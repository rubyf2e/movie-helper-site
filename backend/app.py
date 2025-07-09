from flask import Flask
from flask_cors import CORS
import os
from config import config

def create_app(config_name=None):
    """應用程式工廠函式"""
    app = Flask(__name__)
    
    # 載入配置
    config_name = config_name or os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config[config_name])
    
    # 設置 CORS
    allowed_origins = [
        app.config['FRONTEND_URL'],
        app.config['PRODUCTION_FRONTEND_URL']
    ]
    CORS(app, origins=allowed_origins, supports_credentials=True)
    
    # 註冊藍圖
    from api.movies import movies_bp
    app.register_blueprint(movies_bp, url_prefix='/api')
    
    @app.route('/health')
    def health_check():
        return {
            'status': 'healthy', 
            'message': f'{app.config["APP_TITLE"]} API 運行中',
            'version': app.config['APP_VERSION']
        }, 200
    
    @app.route('/')
    def index():
        return {
            'message': f'歡迎使用{app.config["APP_TITLE"]} API',
            'version': app.config['APP_VERSION'],
            'title': app.config['APP_TITLE'],
            'endpoints': {
                'health': '/health',
                'movies': '/api/movies',
                'popular': '/api/movies/popular',
                'search': '/api/movies/search',
                'genres': '/api/movies/genres'
            },
            'tmdb_config': {
                'base_url': app.config['TMDB_BASE_URL'],
                'img_url': app.config['TMDB_IMG_URL'],
                'language': app.config['TMDB_MOVIE_LANGUAGE'],
                'api_key_configured': bool(app.config['TMDB_API_KEY'])
            }
        }, 200
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
