import requests
import json

API = 'http://localhost:5000'

print("Testing /api/latestData...")
try:
    r = requests.get(f'{API}/api/latestData', timeout=2)
    print(f'Status: {r.status_code}')
    print(f'Response: {json.dumps(r.json(), indent=2)}')
except Exception as e:
    print(f'Error: {e}')

print("\n" + "="*50)
print("Testing /api/history...")
try:
    r = requests.get(f'{API}/api/history?limit=5', timeout=2)
    print(f'Status: {r.status_code}')
    print(f'Response: {r.text[:300]}...')
except Exception as e:
    print(f'Error: {e}')

print("\n" + "="*50)
print("Testing /health...")
try:
    r = requests.get(f'{API}/health', timeout=2)
    print(f'Status: {r.status_code}')
    print(f'Response: {json.dumps(r.json(), indent=2)}')
except Exception as e:
    print(f'Error: {e}')
