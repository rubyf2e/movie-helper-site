from flask_cors import CORS
import os
from config import config, config_ini
from flask import Flask
from api.movies import movies_bp
from api.line import line_bp
from flask import request, jsonify
from service.chat_service import ChatService



def create_app(config_name=None):
    app = Flask(__name__)
    config_name = config_name or os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config[config_name])

    CORS(app, origins=['*'], supports_credentials=True, allow_headers=["*"])
   
    app.register_blueprint(movies_bp, url_prefix='/api/movies')
    app.register_blueprint(line_bp, url_prefix='/api/line')
    
    @app.route('/api/chat', methods=['POST'])
    def chat():
        if request.method == 'OPTIONS':
            return '', 200 
    
        try:
            user_input = request.json.get('user_input')
            chat_model = request.json.get('chat_model', 'gemini')
            
            # 建立 ChatService 實例並傳入配置
            chat_service = ChatService(config_ini)
            response_text = chat_service.chat(user_input, chat_model)
            
            return jsonify({
                'response': response_text,
                'model': chat_model,
                'status': 'success'
            })
        except Exception as e:
            return jsonify({
                'response': 'chat 模型需要升級，暫時無法提供服務',
                'error': str(e),
                'status': 'error'
            }), 500

    @app.route('/health')
    def health_check():
        return {
            'status': 'healthy', 
            'version': app.config['APP_VERSION']
        }, 200
        
        
    return app 

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
