# app.py
from flask import Flask, jsonify
from flask_cors import CORS
from config.db_config import db
from controllers.sensor_controller import sensor_bp
from controllers.ai_controller import ai_bp
from controllers.auth_controller import auth_bp
from controllers.report_controller import report_bp
from controllers.data_controller import data_bp
from controllers.user_data_controller import user_data_bp
from controllers.hospitals_controller import hospitals_bp

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True, expose_headers=['Content-Disposition'])  # enable cross-origin for your React frontend

    # Register blueprints
    app.register_blueprint(sensor_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(data_bp)
    app.register_blueprint(user_data_bp)
    app.register_blueprint(hospitals_bp)

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
