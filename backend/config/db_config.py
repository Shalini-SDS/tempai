from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

# ✅ Match the variable name in your .env file
MONGO_URI = os.getenv("MONGODB_URI")

# Connect to MongoDB
try:
    client = MongoClient(MONGO_URI)
    db = client["tempai_db"]  # database name
    print("MongoDB connection successful")
except Exception as e:
    print("MongoDB connection failed:", e)
    db = None
