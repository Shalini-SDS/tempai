from flask import Blueprint, request, jsonify
from models.user_model import User
import jwt
import os
from functools import wraps
from google.auth.transport import requests
from google.oauth2 import id_token

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({"message": "Token is missing"}), 401
        
        try:
            token = token.split(" ")[1] if " " in token else token
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401
        
        return f(current_user_id, *args, **kwargs)
    
    return decorated

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password') or not data.get('name'):
            return jsonify({"message": "Missing required fields"}), 400
        
        email = data['email']
        password = data['password']
        name = data['name']
        
        if len(password) < 6:
            return jsonify({"message": "Password must be at least 6 characters"}), 400
        
        user_id = User.create_user(email, password, name)
        
        if not user_id:
            return jsonify({"message": "Email already registered"}), 409
        
        token = jwt.encode(
            {"user_id": user_id},
            SECRET_KEY,
            algorithm="HS256"
        )
        
        return jsonify({
            "message": "User created successfully",
            "token": token,
            "user_id": user_id,
            "name": name,
            "email": email
        }), 201
    except Exception as e:
        import traceback
        print(f"Signup error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"message": "Signup failed", "error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"message": "Missing email or password"}), 400
        
        email = data['email']
        password = data['password']
        
        user = User.get_user_by_email(email)
        
        if not user or not User.verify_password(user['password'], password):
            return jsonify({"message": "Invalid email or password"}), 401
        
        token = jwt.encode(
            {"user_id": str(user['_id'])},
            SECRET_KEY,
            algorithm="HS256"
        )
        
        return jsonify({
            "message": "Login successful",
            "token": token,
            "user_id": str(user['_id']),
            "name": user['name'],
            "email": user['email']
        }), 200
    except Exception as e:
        import traceback
        print(f"Login error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"message": "Login failed", "error": str(e)}), 500

@auth_bp.route('/google-oauth', methods=['POST'])
def google_oauth():
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({"message": "Missing Google token"}), 400
        
        GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
        
        if not GOOGLE_CLIENT_ID:
            return jsonify({"message": "Google OAuth not configured"}), 500
        
        try:
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
            
            email = idinfo.get('email')
            name = idinfo.get('name', email.split('@')[0])
            
            user = User.get_user_by_email(email)
            
            if not user:
                user_id = User.create_google_user(email, name)
            else:
                user_id = str(user['_id'])
            
            app_token = jwt.encode(
                {"user_id": user_id},
                SECRET_KEY,
                algorithm="HS256"
            )
            
            return jsonify({
                "message": "Google login successful",
                "token": app_token,
                "user_id": user_id,
                "name": name,
                "email": email
            }), 200
            
        except ValueError as e:
            return jsonify({"message": "Invalid Google token", "error": str(e)}), 401
            
    except Exception as e:
        import traceback
        print(f"Google OAuth error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"message": "Google OAuth failed", "error": str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user_id):
    user = User.get_user_by_id(current_user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    return jsonify({
        "user_id": str(user['_id']),
        "name": user['name'],
        "email": user['email'],
        "created_at": user.get('created_at')
    }), 200

@auth_bp.route('/verify-token', methods=['POST'])
@token_required
def verify_token(current_user_id):
    return jsonify({"message": "Token is valid", "user_id": current_user_id}), 200

@auth_bp.route('/user-settings', methods=['GET'])
@token_required
def get_user_settings(current_user_id):
    user = User.get_user_by_id(current_user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    return jsonify({
        "user_id": str(user['_id']),
        "name": user.get('name', ''),
        "email": user.get('email', ''),
        "age": user.get('age'),
        "allergies": user.get('allergies', ''),
        "created_at": user.get('created_at')
    }), 200

@auth_bp.route('/user-settings', methods=['PUT'])
@token_required
def update_user_settings(current_user_id):
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"message": "No data provided"}), 400
        
        success = User.update_user(current_user_id, data)
        
        if not success:
            return jsonify({"message": "No updates made"}), 400
        
        user = User.get_user_by_id(current_user_id)
        
        return jsonify({
            "message": "Settings updated successfully",
            "user_id": str(user['_id']),
            "name": user.get('name', ''),
            "email": user.get('email', ''),
            "age": user.get('age'),
            "allergies": user.get('allergies', '')
        }), 200
    except Exception as e:
        import traceback
        print(f"Update settings error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"message": "Failed to update settings", "error": str(e)}), 500
