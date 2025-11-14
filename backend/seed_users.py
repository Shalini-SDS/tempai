from config.db_config import db
from models.user_model import User

try:
    users_collection = db["users"]
    
    existing_user = users_collection.find_one({"email": "demo@tempai.com"})
    
    if existing_user:
        print("Default user already exists")
    else:
        user_id = User.create_user("demo@tempai.com", "demo1234", "Demo User")
        print(f"Created default user: demo@tempai.com with password: demo1234")
        print(f"User ID: {user_id}")
        
except Exception as e:
    print(f"Error seeding users: {e}")
    import traceback
    traceback.print_exc()
