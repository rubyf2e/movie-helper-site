from flask import request, abort, jsonify
from openai import AzureOpenAI
import json 
import os

class OpenAiService:
    client = None
    AZURE_CHAT_DEPLOYMENT_NAME = None
    AZURE_CHAT_API_KEY = None
    AZURE_CHAT_VERSION = None
    AZURE_CHAT_ENDPOINT = None
    
    def __init__(self, app=None):
        if app:
            self.AZURE_CHAT_DEPLOYMENT_NAME = app.config['AZURE_CHAT_DEPLOYMENT_NAME']
            self.AZURE_CHAT_API_KEY = app.config['AZURE_CHAT_API_KEY']
            self.AZURE_CHAT_VERSION = app.config['AZURE_CHAT_VERSION']
            self.AZURE_CHAT_ENDPOINT = app.config['AZURE_CHAT_ENDPOINT']
            self.client = AzureOpenAI(
                api_key=self.AZURE_CHAT_API_KEY,
                api_version=self.AZURE_CHAT_VERSION,
                azure_endpoint=self.AZURE_CHAT_ENDPOINT,
            )
        
    def azure_openai(self, user_input):
        with open(os.path.join(os.path.dirname(__file__), "message_text.json"), "r", encoding="utf-8") as f:
            message_text = json.load(f)
            
        for msg in message_text:
            if msg["role"] == "user":
                msg["content"] = user_input
            
        with open(os.path.join(os.path.dirname(__file__), "prompt.json"), "r", encoding="utf-8") as f:
            functions = json.load(f)

        completion = self.client.chat.completions.create(
            model=self.AZURE_CHAT_DEPLOYMENT_NAME,
            messages=message_text,
            functions=functions,
            max_tokens=800,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None,
        )
       
        completion_message = completion.choices[0].message
        if completion.choices[0].finish_reason == "function_call":
            this_arguments = json.loads(completion_message.function_call.arguments)
 
            function_name = completion_message.function_call.name
            movie_title = this_arguments["title"]
            movie_target = (
                this_arguments["target"] if "target" in this_arguments else "no-target"
            )
            return True, "need to call funcation", movie_title, movie_target
        else:
            return False, completion_message.content, "unknown", "unknown"


openai_service_instance = None  # 全域變數

def get_openai_service(app):
    global openai_service_instance
    if openai_service_instance is None:
        openai_service_instance = OpenAiService(app)  # 這裡會在 context 內初始化
    
    return openai_service_instance