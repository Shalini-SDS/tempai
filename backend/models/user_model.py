from config.db_config import db
import bcrypt
from datetime import datetime

class User:
    @staticmethod
    def create_user(email, password, name):
        users_collection = db["users"]
        
        if users_collection.find_one({"email": email}):
            return None
        
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        user_data = {
            "email": email,
            "password": hashed_password,
            "name": name,
            "created_at": datetime.utcnow(),
            "auth_method": "password",
            "readings": [],
            "age": None,
            "allergies": ""
        }
        
        result = users_collection.insert_one(user_data)
        return str(result.inserted_id)
    
    @staticmethod
    def create_google_user(email, name):
        users_collection = db["users"]
        
        if users_collection.find_one({"email": email}):
            return None
        
        user_data = {
            "email": email,
            "name": name,
            "created_at": datetime.utcnow(),
            "auth_method": "google",
            "readings": [],
            "age": None,
            "allergies": ""
        }
        
        result = users_collection.insert_one(user_data)
        return str(result.inserted_id)
    
    @staticmethod
    def get_user_by_email(email):
        users_collection = db["users"]
        return users_collection.find_one({"email": email})
    
    @staticmethod
    def get_user_by_id(user_id):
        from bson.objectid import ObjectId
        users_collection = db["users"]
        return users_collection.find_one({"_id": ObjectId(user_id)})
    
    @staticmethod
    def verify_password(stored_hash, provided_password):
        return bcrypt.checkpw(provided_password.encode('utf-8'), stored_hash)
    
    @staticmethod
    def add_reading(user_id, reading_data):
        from bson.objectid import ObjectId
        users_collection = db["users"]
        
        reading_data["timestamp"] = datetime.utcnow()
        
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"readings": reading_data}}
        )
        
        return result.modified_count > 0
    
    @staticmethod
    def get_user_readings(user_id, limit=50):
        from bson.objectid import ObjectId
        users_collection = db["users"]
        
        user = users_collection.find_one(
            {"_id": ObjectId(user_id)},
            {"readings": {"$slice": -limit}}
        )
        
        if user and "readings" in user:
            return user["readings"]
        return []
    
    @staticmethod
    def get_latest_reading(user_id):
        from bson.objectid import ObjectId
        users_collection = db["users"]
        
        user = users_collection.find_one(
            {"_id": ObjectId(user_id)},
            {"readings": {"$slice": -1}}
        )
        
        if user and "readings" in user and len(user["readings"]) > 0:
            return user["readings"][0]
        return None
    
    @staticmethod
    def update_user(user_id, update_data):
        from bson.objectid import ObjectId
        users_collection = db["users"]
        
        allowed_fields = {"name", "age", "allergies"}
        filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        if not filtered_data:
            return False
        
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": filtered_data}
        )
        
        return result.modified_count > 0
