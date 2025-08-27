import os
import configparser
from dotenv import load_dotenv

load_dotenv()

config_ini = configparser.ConfigParser()
config_ini.read('config.ini')

def get_protocol(ssl_enabled=None):
    """根據 SSL_ENABLED 設定回傳對應的協議"""
    if ssl_enabled is None:
        ssl_enabled = config_ini.getboolean('Base', 'SSL_ENABLED', fallback=False)
    return 'https' if ssl_enabled else 'http'

def get_url_with_protocol(base_url, ssl_enabled=None):
    """根據 SSL_ENABLED 設定回傳完整的 URL"""
    protocol = get_protocol(ssl_enabled)
    # 如果 base_url 已經包含協議，先移除
    if base_url.startswith('http://') or base_url.startswith('https://'):
        base_url = base_url.split('://', 1)[1]
    return f"{protocol}://{base_url}"
        
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'

    # SSL 設定
    SSL_ENABLED = config_ini.getboolean('Base', 'SSL_ENABLED', fallback=False)

    TMDB_API_KEY = config_ini['TMDB']['API_KEY']
    TMDB_API_TOKEN = config_ini['TMDB']['API_TOKEN']
    TMDB_BASE_URL = os.environ.get('REACT_APP_TMDB_BASE_URL', 'https://api.themoviedb.org/3')
    TMDB_IMG_URL = os.environ.get('REACT_APP_TMDB_IMG_URL', 'https://image.tmdb.org/t/p/w500')
    TMDB_MOVIE_LANGUAGE = os.environ.get('REACT_APP_TMDB_MOVIE_LANGUAGE', 'zh-TW')

    APP_TITLE = os.environ.get('REACT_APP_TITLE', '電影小幫手')
    APP_VERSION = os.environ.get('REACT_APP_VERSION', '1.0.0')

    # 動態設定前端 URL（根據 SSL_ENABLED）
    FRONTEND_URL = get_url_with_protocol(config_ini['URL']['FRONTEND_URL'].replace('http://', '').replace('https://', ''))
    PRODUCTION_FRONTEND_URL = get_url_with_protocol(config_ini['URL']['PRODUCTION_FRONTEND_URL'].replace('http://', '').replace('https://', ''))
    
    CORS_ALLOWED_ORIGINS = [FRONTEND_URL, PRODUCTION_FRONTEND_URL]

    LINE_BOT_CHANNEL_ACCESS_TOKEN = config_ini['LineBot']['CHANNEL_ACCESS_TOKEN']
    LINE_BOT_CHANNEL_SECRET = config_ini['LineBot']['CHANNEL_SECRET']
    
    LINE_LOGIN_CHANNEL_ID = config_ini['LineLogin']['CHANNEL_ID']
    LINE_LOGIN_CHANNEL_SECRET = config_ini['LineLogin']['CHANNEL_SECRET']
    # 動態設定 LINE 登入回調 URL
    LINE_LOGIN_REDIRECT_URI = get_url_with_protocol(config_ini['LineLogin']['REDIRECT_URI'].replace('http://', '').replace('https://', ''))
    
    AZURE_CHAT_API_KEY = config_ini['AzureChat']['API_KEY']
    AZURE_CHAT_DEPLOYMENT_NAME = config_ini['AzureChat']['DEPLOYMENT_NAME']
    AZURE_CHAT_VERSION = config_ini['AzureChat']['VERSION']
    AZURE_CHAT_ENDPOINT = config_ini['AzureChat']['END_POINT']
    
    # Ollama 設定（內部服務，根據 SSL_ENABLED 決定協議）
    OLLAMA_CLIENT = get_url_with_protocol(config_ini['OllamaLLM']['OLLAMA_CLIENT'])
    
    @classmethod
    def get_cors_origins(cls):
        """取得完整的 CORS 允許來源列表"""
        base_origins = config_ini['CORS']['ALLOWED_ORIGINS'].split(',')
        return [get_url_with_protocol(origin.strip()) for origin in base_origins]
    


class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
