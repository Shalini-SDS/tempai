# app.py
from flask import Flask, jsonify
from flask_cors import CORS
from config.db_config import db
from controllers.sensor_controller import sensor_bp
from controllers.ai_controller import ai_bp

def create_app():
    app = Flask(__name__)
    CORS(app)  # enable cross-origin for your React frontend

    # Register blueprints
    app.register_blueprint(sensor_bp)
    app.register_blueprint(ai_bp)

    @app.route('/')
    def home():
        return jsonify({"message": "🌡️ TempAI Backend Running Successfully!"})

    # Simple DB health check route
    @app.route('/health')
    def health_check():
        try:
            db.list_collection_names()
            return jsonify({"status": "ok", "db": "connected"}), 200
        except Exception as e:
            return jsonify({"status": "error", "details": str(e)}), 500

    return app


if __name__ == '__main__':
    app = create_app()
    # Run on localhost:5000
    app.run(host='0.0.0.0', port=5000, debug=True)
