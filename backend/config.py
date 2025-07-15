import os
import configparser
from dotenv import load_dotenv

load_dotenv()

config_ini = configparser.ConfigParser()
config_ini.read('config.ini')
        
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'

    TMDB_API_KEY = config_ini['TMDB']['API_KEY']
    TMDB_BASE_URL = os.environ.get('REACT_APP_TMDB_BASE_URL', 'https://api.themoviedb.org/3')
    TMDB_IMG_URL = os.environ.get('REACT_APP_TMDB_IMG_URL', 'https://image.tmdb.org/t/p/w500')
    TMDB_MOVIE_LANGUAGE = os.environ.get('REACT_APP_TMDB_MOVIE_LANGUAGE', 'zh-tw')

    APP_TITLE = os.environ.get('REACT_APP_TITLE', '電影小幫手')
    APP_VERSION = os.environ.get('REACT_APP_VERSION', '1.0.0')

    CORS_ALLOWED_ORIGINS = [config_ini['URL']['FRONTEND_URL'], config_ini['URL']['PRODUCTION_FRONTEND_URL']]

    LINE_BOT_CHANNEL_ACCESS_TOKEN = config_ini['LineBot']['CHANNEL_ACCESS_TOKEN']
    LINE_BOT_CHANNEL_SECRET = config_ini['LineBot']['CHANNEL_SECRET']
    
    LINE_LOGIN_CHANNEL_ID = config_ini['LineLogin']['CHANNEL_ID']
    LINE_LOGIN_CHANNEL_SECRET = config_ini['LineLogin']['CHANNEL_SECRET']
    LINE_LOGIN_CHANNEL_USER_ID = config_ini['LineLogin']['CHANNEL_USER_ID']
    LINE_LOGIN_REDIRECT_URI = config_ini['LineLogin']['REDIRECT_URI']
    
    AZURE_CHAT_API_KEY = config_ini['AzureChat']['API_KEY']
    AZURE_CHAT_DEPLOYMENT_NAME = config_ini['AzureChat']['DEPLOYMENT_NAME']
    AZURE_CHAT_VERSION = config_ini['AzureChat']['VERSION']
    AZURE_CHAT_ENDPOINT = config_ini['AzureChat']['END_POINT']
    


class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
