import requests
import json

API_URL = "http://localhost:5000"

payload = {
    'temperature': 38.5,
    'age': 29,
    'days_since_onset': 2,
    'symptoms': ['Headache', 'Cough', 'Fatigue', 'Chills']
}

try:
    response = requests.post(f"{API_URL}/api/ai/predict", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
    print("Make sure the backend server is running at http://localhost:5000")
