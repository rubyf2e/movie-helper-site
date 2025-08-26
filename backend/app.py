from flask_cors import CORS
import sys
import os
import json
from service.log_service import LogService
from config import config, config_ini
from flask import Flask
from api.movies import movies_bp
from api.line import line_bp
from flask import request, jsonify, Response
from service.chat_service import ChatService
from service.chat_stream_service import ChatStreamService

def create_app(config_name=None):
    app = Flask(__name__)
    config_name = config_name or os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config[config_name])
    log_service = LogService(app, log_dir='logs')
    app_logger = log_service.get_custom_logger('app', 'app.log')
    app.custom_logger = app_logger
    chat_stream_service = ChatStreamService(config_ini, app_logger)
    chat_service = ChatService(config_ini)

    # 使用動態 CORS 設定
    cors_origins = app.config['CORS_ALLOWED_ORIGINS'] + config[config_name].get_cors_origins()
    CORS(app, origins=cors_origins, supports_credentials=True, allow_headers=["*"])
   
    app.register_blueprint(movies_bp, url_prefix='/api/movies')
    app.register_blueprint(line_bp, url_prefix='/api/line')
    
    @app.route('/api/chat', methods=['POST'])
    def chat():
        if request.method == 'OPTIONS':
            return '', 200 
    
        try:
            user_input = request.json.get('user_input')
            chat_model = request.json.get('chat_model', 'gemini')
            
            response_text = chat_service.chat(user_input, chat_model)
            app_logger.info(user_input)
            
            return jsonify({
                'response': response_text,
                'model': chat_model,
                'status': 'success'
            })
        except Exception as e:
            app_logger.error(e)
            return jsonify({
                'response': 'chat 模型需要升級，暫時無法提供服務',
                'error': str(e),
                'status': 'error'
            }), 500

    @app.route('/api/chat/stream', methods=['POST'])
    def chat_stream():
        app_logger.info(f"收到 chat_stream 請求: {request.json}")

        if request.method == 'OPTIONS':
            return '', 200
        
        data = request.get_json()
        user_input = data.get('user_input')
        chat_model = data.get('chat_model')
           
        def generate(user_input, chat_model):
            try:
                if not user_input or not chat_model:
                    yield f"data: {json.dumps({'type': 'error', 'message': 'chat 模型需要升級，暫時無法提供服務'})}\n\n"
                    sys.stdout.flush()
                    return
                
                # 發送開始事件
                yield f"data: {json.dumps({'type': 'start', 'model': chat_model})}\n\n"
                sys.stdout.flush()
                
                # 調用支援流式回應的方法
                app_logger.info(f"開始 chat_stream: {user_input}, {chat_model}")
                for chunk in chat_stream_service.chat_stream(user_input, chat_model):
                    app_logger.info(f"chat_stream: {chunk}")

                    if chunk:
                        yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
                        sys.stdout.flush()
                
                # 發送結束事件
                yield f"data: {json.dumps({'type': 'end'})}\n\n"
                sys.stdout.flush()
                
            except Exception as e:
                app_logger.error(e)
                yield f"data: {json.dumps({'type': 'error', 'message': 'chat 模型需要升級，暫時無法提供服務', 'error': str(e)})}\n\n"
                sys.stdout.flush()
     
        return Response(
            generate(user_input, chat_model),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no', 
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        )

    @app.route('/health')
    def health_check():
        return {
            'status': 'healthy', 
            'version': app.config['APP_VERSION']
        }, 200
        
        
    return app 

if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get('PORT_MOVIE_HELPER_BACKEND', 5000))
    debug = os.environ.get('FLASK_DEBUG', '0')
    
    app.run(host='0.0.0.0', port=port, debug=debug)
