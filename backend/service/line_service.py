from urllib import response
from flask import request, abort, jsonify
import requests, json
from linebot.v3 import (
    WebhookHandler
)

from linebot.v3.messaging import (
    Configuration,
    ApiClient,
    MessagingApi,
    ReplyMessageRequest,
    TextMessage,
    ImageMessage
)

                       
class LineService:
    configuration = None
    handler = None
    LINE_LOGIN_CHANNEL_SECRET = None
    LINE_LOGIN_CHANNEL_USER_ID = None
    LINE_LOGIN_CHANNEL_ID = None
    LINE_BOT_CHANNEL_ACCESS_TOKEN = None
    LINE_BOT_CHANNEL_SECRET = None
    LINE_LOGIN_REDIRECT_URI = None
    PUSH_MESSAGE_API_URL = "https://api.line.me/v2/bot/message/push"
    LINE_VERIFY_API_URL = "https://api.line.me/oauth2/v2.1/verify"
    
    def __init__(self, app=None):
        if app:
            self.LINE_LOGIN_REDIRECT_URI = app.config['LINE_LOGIN_REDIRECT_URI']
            self.LINE_LOGIN_CHANNEL_SECRET = app.config['LINE_LOGIN_CHANNEL_SECRET']
            self.LINE_LOGIN_CHANNEL_ID = app.config['LINE_LOGIN_CHANNEL_ID']
            self.LINE_LOGIN_CHANNEL_USER_ID = app.config['LINE_LOGIN_CHANNEL_USER_ID']
            self.LINE_BOT_CHANNEL_ACCESS_TOKEN = app.config['LINE_BOT_CHANNEL_ACCESS_TOKEN']
            self.LINE_BOT_CHANNEL_SECRET = app.config['LINE_BOT_CHANNEL_SECRET']
            
    def set_configuration(self):
        self.configuration = Configuration(access_token=self.LINE_BOT_CHANNEL_ACCESS_TOKEN)
        return self
    
    def set_handler(self):
        self.handler = WebhookHandler(self.LINE_BOT_CHANNEL_SECRET)
        return self

    def get_line_login_redirect_uri(self):
        return self.LINE_LOGIN_REDIRECT_URI
    
    def get_line_handler(self):
        return self.handler
    
    def get_line_configuration(self):
        return self.configuration
    
    def get_line_verify_api_url(self):
        return self.LINE_VERIFY_API_URL
    
    def get_line_login_channel_id(self):
        return self.LINE_LOGIN_CHANNEL_ID   
    
    def send_push_message_api(self, message):
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.LINE_BOT_CHANNEL_ACCESS_TOKEN}"
        }   
        
        payload = {
            "to": self.LINE_LOGIN_CHANNEL_USER_ID,
            "messages": [{
                "type": "text",
                "text": message
            }]
        }

        response = requests.post(self.PUSH_MESSAGE_API_URL,
                        headers=headers,
                        json=payload)

        if response.status_code == 200:
            return jsonify({"status": "OK"})
        else:
            return jsonify({"status": "ERROR", "detail": response.text}), 400

    def get_jwt_token(self, request):
        """獲取授權標頭"""
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            jwt_token = auth_header[7:]
        else:
            jwt_token = ''

        return jwt_token
    
    def profile_api(self, request):
        jwt_token = self.get_jwt_token(request)
        
        if not jwt_token:
            return jsonify({"error": "Missing jwt_token"}), 400

        client_id = request.args.get('client_id', '')
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }   
        
        payload = {
            "id_token": jwt_token,
            "client_id": client_id
        }
        
        print(payload)
        
        response = requests.post(self.LINE_VERIFY_API_URL,
                        headers=headers,
                        data=payload)

        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({"status": "ERROR", "detail": response.text}), 400


line_service_instance = None

def get_line_service(app):
    global line_service_instance
    if line_service_instance is None:
        line_service_instance = LineService(app)
    
    return line_service_instance