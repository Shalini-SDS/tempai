from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

# ✅ Match the variable name in your .env file
MONGO_URI = os.getenv("MONGODB_URI")

# Connect to MongoDB
try:
    # For development: try different connection options
    client = None
    try:
        client = MongoClient(MONGO_URI, tls=False, serverSelectionTimeoutMS=5000)
        # Test the connection
        client.admin.command('ping')
    except:
        try:
            client = MongoClient(MONGO_URI, tls=True, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
            # Test the connection
            client.admin.command('ping')
        except:
            client = None

    if client:
        db = client["tempai_db"]  # database name
        print("MongoDB connection successful")
    else:
        raise Exception("All connection attempts failed")
except Exception as e:
    print("MongoDB connection failed:", e)
    # For development: create a mock db object to prevent crashes
    class MockDB:
        def list_collection_names(self):
            return []
        def __getattr__(self, name):
            raise AttributeError(f"'MockDB' object has no attribute '{name}'")
    db = MockDB()
