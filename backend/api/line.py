import requests, json
from flask import redirect, request, abort, jsonify, current_app, Blueprint

from linebot.v3.exceptions import (
    InvalidSignatureError
)
from linebot.v3.messaging import (
    Configuration,
    ApiClient,
    MessagingApi,
    ReplyMessageRequest,
    TextMessage,
    ImageMessage
)

from linebot.v3.webhooks import (
    MessageEvent,
    TextMessageContent
)

from service.line_service import get_line_service
from service.azure.openai_service import get_openai_service

line_bp = Blueprint('line', __name__)

def get_line_configuration():
    return get_line_service(current_app).set_configuration().get_line_configuration()

def get_line_handler():
    line_service = get_line_service(current_app)
    line_handler = line_service.set_handler().get_line_handler()
    configuration = line_service.set_configuration().get_line_configuration()
    
    def call_tmdb(movie_title, movie_target):
        print("[call_tmdb] in")
        print("movie_title : ", movie_title)
        print("movie_target : ", movie_target)
        baseUrl = "https://api.themoviedb.org/3/search/movie?"
        parameters = "language=" + "zh-TW"
        parameters += "&"
        parameters += "query=" + movie_title

        headers = {
            "accept": "application/json",
            "Authorization": "Bearer " + current_app.config['TMDB_API_TOKEN'],
        }

        response = requests.get(baseUrl + parameters, headers=headers)
        result = json.loads(response.text)
        print(result)
        if len(result["results"]) != 0:
            if movie_target == "overview":
                if "overview" in result["results"][0] and len(result["results"][0]["overview"])!=0:
                    return TextMessage(text=result["results"][0]["title"]), TextMessage(text=result["results"][0]["overview"])
                else:
                    return TextMessage(text=result["results"][0]["title"]), TextMessage(text="該電影沒有簡介")
            elif movie_target == "poster":
                if "poster_path" in result["results"][0]:
                    imageUri = "https://image.tmdb.org/t/p/original" + result["results"][0]["poster_path"]
                    return TextMessage(text=result["results"][0]["title"]), ImageMessage(
                        originalContentUrl=imageUri, previewImageUrl=imageUri
                    )
                else:
                    return TextMessage(text=result["results"][0]["title"]), TextMessage(text="該電影沒有海報")
            else:
                if "overview" in result["results"][0]:
                    return TextMessage(text=result["results"][0]["title"]), TextMessage(text=result["results"][0]["overview"])
                else:
                    return TextMessage(text=result["results"][0]["title"]), TextMessage(text="該電影沒有簡介")
        else:
            return TextMessage(text="N/A"), TextMessage(text="很抱歉，系統內並無相關電影")


    @line_handler.add(MessageEvent, message=TextMessageContent)
    def message_text(event):
        with ApiClient(configuration) as api_client:
            isFunctionCall, response, movie_title, movie_target = get_openai_service(current_app).azure_openai(
                event.message.text
            )
            this_messages = []
            if isFunctionCall:
                this_messages.append(TextMessage(text="你想查詢的是：" + movie_title))
                movie_title, movie_result = call_tmdb(movie_title, movie_target)
                this_messages.append(movie_title)
                this_messages.append(movie_result)
            else:
                this_messages.append(TextMessage(text=response))
            line_bot_api = MessagingApi(api_client)
            line_bot_api.reply_message_with_http_info(
                ReplyMessageRequest(
                    reply_token=event.reply_token,
                    messages=this_messages,
                )
            )
    
    return line_handler

@line_bp.route('/bot/send-to-line', methods=['POST', 'OPTIONS'])
def send_to_line():
    if request.method == 'OPTIONS':
        return '', 200 
    
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"status": "ERROR", "detail": "Invalid JSON format"}), 400

    current_app.logger.info(data)
    
    movie_title = ''
    for movie in data['movieList']:
        if 'title' in movie:
            movie_title += '\n' + movie['title']
        else:
            movie_title = "未知電影"
            
    line_login_channel_user_id = data['line_login_channel_user_id']

    current_app.logger.info("movie_title: " + movie_title)
    current_app.logger.info("line_login_channel_user_id: " + str(line_login_channel_user_id))

    message = f"電影待看清單新增了：{movie_title}"
    
    return get_line_service(current_app).send_push_message_api(message, line_login_channel_user_id)


@line_bp.route("/login/callback", methods=['GET', 'OPTIONS'])
def line_login_callback():
    if request.method == 'OPTIONS':
        return '', 200 
    elif request.method == 'GET':
        redirect_uri = get_line_service(current_app).get_line_login_redirect_uri()
        jwt_token = request.args.get('response', '')
        state = request.args.get('state', '')
        client_id = request.args.get('client_id', '')
        scope = request.args.get('scope', '')
        nonce = request.args.get('nonce', '')
    
        print(request.args.to_dict())

        return redirect(redirect_uri+'?response='+jwt_token+'&state='+state+'&client_id='+client_id+'&scope='+scope+'&nonce='+nonce)

@line_bp.route("/auth/line/profile", methods=['GET', 'POST', 'OPTIONS'])
def line_profile():
    if request.method == 'OPTIONS':
        return '', 200 
    return get_line_service(current_app).profile_api(request)

@line_bp.route("/auth/line/bot/profile/<user_id>", methods=['GET', 'POST', 'OPTIONS'])
def line_profile_bot(user_id):
    if request.method == 'OPTIONS':
        return '', 200 
    return get_line_service(current_app).profile_bot_api(user_id)

@line_bp.route("/auth/line/revoke", methods=['POST', 'OPTIONS'])
def line_revoke():
    if request.method == 'OPTIONS':
        return '', 200 
    return get_line_service(current_app).revoke_api(request)

@line_bp.route("/auth/line/verify", methods=['GET', 'POST', 'OPTIONS'])
def line_verify():
    if request.method == 'OPTIONS':
        return '', 200 
    return get_line_service(current_app).verify_api(request)

@line_bp.route("/auth/line/token", methods=['GET', 'POST', 'OPTIONS'])
def line_token():
    if request.method == 'OPTIONS':
        return '', 200 
    return get_line_service(current_app).get_token_api(request)
    
@line_bp.route("/auth/line/token_profile", methods=['GET', 'OPTIONS'])
def line_token_profile():
    id_token = request.args.get('id_token', '')
    nonce = request.args.get('nonce', '')
    iss = request.args.get('iss', '')
        
    if request.method == 'OPTIONS':
        return '', 200
     
    return get_line_service(current_app).get_line_jwt_data(id_token, nonce, iss)
        
@line_bp.route("/bot/callback", methods=['GET', 'POST', 'OPTIONS'])
def line_bot_callback():
    if request.method == 'OPTIONS':
        return '', 200 
    elif request.method == 'GET':
        return 'ok'
    elif request.method == 'POST':
        signature = request.headers['X-Line-Signature']
        body = request.get_data(as_text=True)
        current_app.logger.info("Request body: " + body)

        try:
            get_line_handler().handle(body, signature)
        except InvalidSignatureError:
            current_app.logger.info("Invalid signature. Please check your channel access token/channel secret.")
            abort(400)

        return 'ok'
    
