import token
from urllib import response
from flask import request, abort, jsonify
import requests, json
from jwt import PyJWKClient
import jwt
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
    LINE_LOGIN_CHANNEL_ID = None
    LINE_BOT_CHANNEL_ACCESS_TOKEN = None
    LINE_BOT_CHANNEL_SECRET = None
    LINE_LOGIN_REDIRECT_URI = None
    LINE_ISSUER = "https://access.line.me"
    LINE_JWKS_URL = "https://access.line.me/.well-known/openid-configuration"
    LINE_REVOKE_API_URL = "https://api.line.me/oauth2/v2.1/revoke"
    LINE_PUSH_MESSAGE_API_URL = "https://api.line.me/v2/bot/message/push"
    LINE_GET_VERIFY_ACCESS_TOKEN_API_URL = "https://api.line.me/oauth2/v2.1/verify"
    LINE_POST_VERIFY_ID_API_URL = "https://api.line.me/oauth2/v2.1/verify"
    LINE_PROFILE_API_URL = "https://api.line.me/v2/profile"
    LINE_PROFILE_BOT_API_URL = "https://api.line.me/v2/bot/profile"
    LINE_TOKEN_API_URL = "https://api.line.me/oauth2/v2.1/token"
    
    def __init__(self, app=None):
        if app:
            self.LINE_LOGIN_REDIRECT_URI = app.config['LINE_LOGIN_REDIRECT_URI']
            self.LINE_LOGIN_CHANNEL_SECRET = app.config['LINE_LOGIN_CHANNEL_SECRET']
            self.LINE_LOGIN_CHANNEL_ID = app.config['LINE_LOGIN_CHANNEL_ID']
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
    
    
    def get_line_login_channel_id(self):
        return self.LINE_LOGIN_CHANNEL_ID   
    
    def get_line_jwks(self):
        openid_config = requests.get(self.LINE_JWKS_URL).json()
        jwks_uri = openid_config["jwks_uri"]
        jwks_client = PyJWKClient(jwks_uri)

        return jwks_client
    
    def get_line_unverified_header(self, id_token):

        return jwt.get_unverified_header(id_token)
        
    # response_mode=query.jwt
    # {
    #     "aud": "",
    #     "code": "",
    #     "exp": ,
    #     "iss": "",
    #     "state": ""
    # }
    def get_line_jwt_data(self, id_token, nonce, iss):
        jwks_client = self.get_line_jwks()
        
        try:
            decoded = jwt.decode(
                id_token,
                key=self.LINE_LOGIN_CHANNEL_SECRET,
                algorithms=["HS256"],
                audience=self.LINE_LOGIN_CHANNEL_ID
            )
            
            print("JWT Payload:")
            print(decoded)

            return jsonify(decoded)

        except Exception as e:
            return jsonify({'error': 'Invalid token', 'details': str(e)}), 400

    def send_push_message_api(self, message, line_login_channel_user_id=None):
        token = self.LINE_BOT_CHANNEL_ACCESS_TOKEN
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
        payload = {
            "to": line_login_channel_user_id,
            "messages": [{
                "type": "text",
                "text": message
            }]
        }

        response = requests.post(self.LINE_PUSH_MESSAGE_API_URL,
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

    def revoke_api(self, request):
        content = request.json
        access_token = content['access_token']
        client_id = content['client_id']
        
        if not access_token or not client_id:
            return jsonify({"error": "Missing access_token or client_id"}), 400

        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }   
        
        payload = {
            "access_token": access_token,
            "client_id": client_id
        }

        response = requests.post(
            self.LINE_REVOKE_API_URL,
            headers=headers,
            data=payload
        )
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({"status": "ERROR", "detail": response.text}), 400
        
        
    def profile_api(self, request):
        access_token = request.args.get('access_token')
        
        if not access_token:
            return jsonify({"error": "Missing access_token"}), 400

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }   
   
        response = requests.get(self.LINE_PROFILE_API_URL,
                        headers=headers)
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({"status": "ERROR", "detail": response.text}), 400
        
        
    def profile_bot_api(self, userId):
        token = self.LINE_BOT_CHANNEL_ACCESS_TOKEN
        
        if not userId:
            return jsonify({"error": "Missing userId"}), 400

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }   
   
        response = requests.get(self.LINE_PROFILE_BOT_API_URL + '/' + userId,
                        headers=headers)
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({"status": "ERROR", "detail": response.text}), 400

    
    def verify_api(self, request):
        access_token = request.args.get('code')
        request_type = request.args.get('type')
        request_redirect_uri = request.args.get('redirect_uri')
        
        if not access_token:
            return jsonify({"error": "Missing access_token"}), 400

        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }   
        
        response = None
        
        if request_type == 'ACCESS_TOKEN':
            response = requests.get(self.LINE_POST_VERIFY_ID_API_URL,
                        headers=headers,
                        params={"access_token": access_token})

        elif request_type == 'ID':
            client_id = request.args.get('client_id', '')
            response = requests.post(self.LINE_GET_VERIFY_ACCESS_TOKEN_API_URL,
                        headers=headers,
                        data={"id_token": access_token,"client_id": client_id})
            
        if response.status_code == 200:
            response.request_redirect_uri = request_redirect_uri
            print(response.json())
            print(request_redirect_uri)
            
            return jsonify(response.json())
        else:
            return jsonify({"status": "ERROR", "detail": response.text}), 400

    def get_token_api(self, request):
        # 取得必要參數
        access_token = request.args.get('code')
        redirect_uri = request.args.get('redirect_uri')
        client_id = request.args.get('client_id')
        client_secret = self.LINE_LOGIN_CHANNEL_SECRET
        
        print(redirect_uri)

        # 檢查必要參數
        if not all([access_token, redirect_uri, client_id, client_secret]):
            return jsonify({"error": "Missing required parameters"}), 400

        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }

        payload = {
            "grant_type": 'authorization_code',
            "code": access_token,
            "redirect_uri": redirect_uri,
            "client_id": client_id,
            "client_secret": client_secret,
        }

        print("LINE token payload:", payload)

        response = requests.post(
            self.LINE_TOKEN_API_URL,
            headers=headers,
            data=payload
        )

        if response.status_code == 200:
            print(response.json())
            return jsonify(response.json())
        else:
            return jsonify({"status": "ERROR", "detail": response.text}), 400
        
   

line_service_instance = None

def get_line_service(app):
    global line_service_instance
    if line_service_instance is None:
        line_service_instance = LineService(app)
    
    return line_service_instance