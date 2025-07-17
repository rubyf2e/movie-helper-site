from flask_cors import CORS
import os
from config import config
from flask import Flask
from api.movies import movies_bp
from api.line import line_bp

def create_app(config_name=None):
    app = Flask(__name__)
    config_name = config_name or os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config[config_name])

    CORS(app, origins=['*'], supports_credentials=True, allow_headers=["*"])
   
    app.register_blueprint(movies_bp, url_prefix='/api/movies')
    app.register_blueprint(line_bp, url_prefix='/api/line')

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
