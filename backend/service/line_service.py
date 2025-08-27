import token
from urllib import response
import urllib.parse
from flask import request, abort, jsonify, session
import requests, json
import hashlib
import base64
import secrets
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

                       
class MockRequest:
    """Mock request object for reusing profile_api method"""
    def __init__(self, access_token):
        self._access_token = access_token
    
    @property
    def args(self):
        return MockArgs(self._access_token)

class MockArgs:
    """Mock args object for mock request"""
    def __init__(self, access_token):
        self._access_token = access_token
    
    def get(self, key, default=None):
        if key == 'access_token':
            return self._access_token
        return default

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
    
    def generate_code_verifier(self, length=128):
        """生成隨機的 code verifier"""
        token = secrets.token_urlsafe(length)
        return token[:length]

    def generate_code_challenge(self, code_verifier):
        """生成 code challenge (SHA256 hash of code verifier)"""
        sha256_hash = hashlib.sha256(code_verifier.encode('utf-8')).digest()
        code_challenge = base64.urlsafe_b64encode(sha256_hash).decode('utf-8')
        return code_challenge.rstrip('=')

    def generate_state(self):
        """生成隨機的 state 參數"""
        return secrets.token_urlsafe(32)   
    
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

    def handle_auth_callback(self, request):
        if request.method == 'POST':
            data = request.get_json()
            code = data.get('code')
            state = data.get('state')
            redirect_uri = data.get('redirect_uri')
            code_verifier = data.get('code_verifier')
        else:
            code = request.args.get('code')
            state = request.args.get('state')
            redirect_uri = request.args.get('redirect_uri')
            code_verifier = request.args.get('code_verifier')
        
        line_login_redirect_uri = self.get_line_login_redirect_uri()
            
        try:
            if request.method == 'POST':
                if not all([code, state, redirect_uri, code_verifier]):
                    return jsonify({"success": False, "error": "缺乏參數"}), 400
            else:
                if not all([code, state]):
                    error_message = urllib.parse.quote("Missing required parameters")
                    state = state or "unknown"
                    url = f"{line_login_redirect_uri}?error={error_message}&state={state}&success=false"
                    return url
                redirect_uri = line_login_redirect_uri
            
            headers = {
                "Content-Type": "application/x-www-form-urlencoded"
            }
            
            payload = {
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri,
                "client_id": self.LINE_LOGIN_CHANNEL_ID,
                "client_secret": self.LINE_LOGIN_CHANNEL_SECRET,
            }
            
            if code_verifier:
                payload["code_verifier"] = code_verifier
   
            response = requests.post(
                self.LINE_TOKEN_API_URL,
                headers=headers,
                data=payload
            )
            
            if response.status_code == 200:
                token_data = response.json()
                
                if 'access_token' in token_data:
                    try:
                        mock_request = MockRequest(token_data['access_token'])
                        profile_response = self.profile_api(mock_request)
                        
                        if hasattr(profile_response, 'json'):
                            profile_data = profile_response.get_json()
                            if profile_response.status_code == 200:
                                token_data['profile'] = profile_data
                        else:
                            token_data['profile'] = profile_response
                            
                    except Exception as e:
                        print(f"Profile fetch error: {str(e)}")
                
                if request.method == 'POST':
                    return jsonify({
                        "success": True,
                        "data": token_data
                    })
                else:
                    response_data = urllib.parse.quote(json.dumps(token_data))
                    url = f"{line_login_redirect_uri}?response={response_data}&state={state}&success=true"
                    return url
            else:
                if request.method == 'POST':
                    return jsonify({
                        "success": False,
                        "error": "Token exchange failed",
                        "details": response.text
                    }), 400
                else:
                    error_message = urllib.parse.quote(f"Token exchange failed: {response.text}")
                    url = f"{line_login_redirect_uri}?error={error_message}&state={state}&success=false"
                    return url
                
        except Exception as e:
            print(f"PKCE auth callback error: {str(e)}")
            if request.method == 'POST':
                return jsonify({
                    "success": False,
                    "error": "Internal server error",
                    "details": str(e)
                }), 500
            else:
                error_message = urllib.parse.quote(f"Internal error: {str(e)}")
                url = f"{line_login_redirect_uri}?error={error_message}&state={state}&success=false"
                return url
    
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