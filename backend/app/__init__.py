from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes
    
    # Register blueprints
    from app.routes.similarity import similarity_bp
    app.register_blueprint(similarity_bp, url_prefix='/api')
    
    return app