import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    
    # TMDB API 配置 - 與前端保持一致的命名
    TMDB_API_KEY = os.environ.get('REACT_APP_TMDB_API_KEY') or os.environ.get('TMDB_API_KEY')
    TMDB_BASE_URL = os.environ.get('REACT_APP_TMDB_BASE_URL', 'https://api.themoviedb.org/3')
    TMDB_IMG_URL = os.environ.get('REACT_APP_TMDB_IMG_URL', 'https://image.tmdb.org/t/p/w500')
    TMDB_MOVIE_LANGUAGE = os.environ.get('REACT_APP_TMDB_MOVIE_LANGUAGE', 'zh-tw')
    
    # 應用程式配置
    APP_TITLE = os.environ.get('REACT_APP_TITLE', '電影小幫手')
    APP_VERSION = os.environ.get('REACT_APP_VERSION', '1.0.0')
    
    # CORS 設置
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    PRODUCTION_FRONTEND_URL = os.environ.get('PRODUCTION_FRONTEND_URL', 'https://rubyf2e.github.io')

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
