# Emergency Page Backend - Node.js + Express + MongoDB

Complete backend module for Emergency Health Monitoring System with IoT integration.

## 📁 Project Structure

```
backend/
├── controllers/
│   ├── emergencyController.js      # Emergency contact management
│   └── hospitalsController.js      # OpenStreetMap API integration
├── models/
│   ├── EmergencyContact.js         # MongoDB schema for contacts
│   └── EmergencyAlert.js           # MongoDB schema for alerts
├── routes/
│   ├── emergencyRoutes.js          # Emergency contact endpoints
│   └── hospitalRoutes.js           # Hospital endpoints
├── services/
│   └── alertService.js             # Alert detection & notification logic
├── middleware/
│   └── errorHandler.js             # Error handling & async wrapper
├── examples/
│   ├── iotDataSample.json          # Sample IoT data
│   └── api_test_examples.sh        # cURL test commands
├── server.js                       # Main Express server
├── package.json                    # Dependencies
├── .env.emergency                  # Environment variables template
├── API_DOCUMENTATION.md            # Detailed API docs
└── BACKEND_README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 14+ 
- **MongoDB** 4.4+ (local or cloud)
- **npm** or **yarn**

### Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment:**
Copy `.env.emergency` to `.env` and update values:
```bash
cp .env.emergency .env
```

3. **Update .env file:**
```env
MONGODB_URI=mongodb://localhost:27017/emergency_db
PORT=5000
NODE_ENV=development
GOOGLE_MAPS_KEY=your_actual_google_maps_key
```

4. **Start the server:**
```bash
npm start          # Production
npm run dev        # Development (with hot reload)
```

Server runs on: `http://localhost:5000`

---

## 📡 API Endpoints Overview

### Emergency Contacts
- `GET /api/emergency/contacts/:userId` - Fetch contacts
- `POST /api/emergency/contacts` - Add/update contacts
- `DELETE /api/emergency/contacts/:id` - Delete contact
- `PUT /api/emergency/contacts/update-specific` - Update specific field

### Hospitals & Ambulances (OpenStreetMap)
- `GET /api/hospitals/nearby` - Find nearby hospitals
- `GET /api/hospitals/details` - Get hospital details
- `GET /api/hospitals/ambulances/nearby` - Find nearby ambulances

---

## 🏥 Emergency Alert System

The system includes comprehensive alert tracking and management capabilities to monitor emergency situations and notify relevant contacts when needed.

---

## 🗄️ Database Models

### EmergencyContact
```javascript
{
  userId: ObjectId,
  emergencyServices: [{name, phone, available24x7}],
  familyDoctor: {name, phone, email, specialization, hospital},
  emergencyContact: [{name, relationship, phone, email, priority}],
  medicalHistory: {allergies, chronicDiseases, medications, bloodType},
  isActive: Boolean,
  timestamps
}
```

### EmergencyAlert
```javascript
{
  userId: ObjectId,
  alertType: String,
  severity: String (WARNING|ALERT|CRITICAL),
  vitalDetails: {heartRate, bloodPressure, oxygenLevel, temperature, respiratoryRate},
  triggeredAt: Date,
  resolvedAt: Date,
  status: String (ACTIVE|RESOLVED|ACKNOWLEDGED),
  notificationsSent: [{contactId, method, sentAt, status}],
  acknowledgedBy: ObjectId,
  timestamps
}
```

---

## 🧪 Testing APIs

### Using cURL
```bash
# Add emergency contacts
curl -X POST http://localhost:5000/api/emergency/contacts \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_id","familyDoctor":{"name":"Dr. John","phone":"+919876543210"}}'

# Get nearby hospitals
curl -X GET "http://localhost:5000/api/hospitals/nearby?lat=28.6139&lng=77.2090"
```

### Run test script
```bash
bash examples/api_test_examples.sh
```

---

## 🔧 Configuration

### Environment Variables
| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | Database connection | `mongodb://localhost:27017/emergency_db` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `TWILIO_ACCOUNT_SID` | Twilio SMS/Call (optional) | `AC...` |
| `TWILIO_AUTH_TOKEN` | Twilio auth (optional) | `token...` |

### MongoDB Setup

**Local MongoDB:**
```bash
# macOS
brew services start mongodb-community

# Windows
mongod

# Verify connection
mongo mongodb://localhost:27017
```

**Cloud MongoDB (Atlas):**
1. Create cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `MONGODB_URI` in `.env`

---

## 📊 Vitals Data Format

### Send from IoT Device
```json
{
  "userId": "user_id",
  "deviceId": "IOT_DEVICE_001",
  "heartRate": {"value": 72, "unit": "bpm"},
  "bloodPressure": {"systolic": 120, "diastolic": 80, "unit": "mmHg"},
  "oxygenLevel": {"value": 98, "unit": "%"},
  "respiratoryRate": {"value": 16, "unit": "breaths/min"},
  "temperature": {"value": 37, "unit": "°C"},
  "notes": "Morning reading"
}
```

### Response
```json
{
  "success": true,
  "message": "Vitals recorded successfully",
  "data": { ... },
  "abnormalities": ["HIGH_TEMPERATURE"] or null
}
```

---

## 📱 Sample IoT Integration

### Python IoT Device Example
```python
import requests
import json
import time

BASE_URL = "http://your-server:5000"
USER_ID = "user_id_here"
DEVICE_ID = "IOT_DEVICE_001"

def send_vitals(heart_rate, systolic, diastolic, oxygen, temp, respiratory):
    payload = {
        "userId": USER_ID,
        "deviceId": DEVICE_ID,
        "heartRate": {"value": heart_rate, "unit": "bpm"},
        "bloodPressure": {"systolic": systolic, "diastolic": diastolic},
        "oxygenLevel": {"value": oxygen, "unit": "%"},
        "respiratoryRate": {"value": respiratory, "unit": "breaths/min"},
        "temperature": {"value": temp, "unit": "°C"}
    }
    
    response = requests.post(
        f"{BASE_URL}/api/vitals/update",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    return response.json()

# Send vitals every 10 seconds
while True:
    result = send_vitals(75, 120, 80, 98, 37, 16)
    print(result)
    time.sleep(10)
```

### JavaScript/Node.js Example
```javascript
const axios = require('axios');

const baseURL = 'http://your-server:5000';
const userId = 'user_id_here';
const deviceId = 'IOT_DEVICE_001';

async function sendVitals(vitals) {
  try {
    const response = await axios.post(`${baseURL}/api/vitals/update`, {
      userId,
      deviceId,
      ...vitals
    });
    console.log('Vitals sent:', response.data);
  } catch (error) {
    console.error('Error sending vitals:', error);
  }
}

// Send every 10 seconds
setInterval(() => {
  sendVitals({
    heartRate: { value: 75, unit: 'bpm' },
    bloodPressure: { systolic: 120, diastolic: 80 },
    oxygenLevel: { value: 98, unit: '%' },
    respiratoryRate: { value: 16, unit: 'breaths/min' },
    temperature: { value: 37, unit: '°C' }
  });
}, 10000);
```

---

## 🚨 Emergency Alert Response

When abnormal vitals are detected:

1. **Alert Created** - Stored in database with severity level
2. **Contacts Notified** - Emergency contacts (SMS/Email/Push)
3. **Logs Generated** - Alert tracking and response history
4. **Status Tracking** - ACTIVE → ACKNOWLEDGED → RESOLVED

---

## 🔌 Extending the Backend

### Add New Alert Type
Edit `alertService.js`:
```javascript
const THRESHOLDS = {
  NEW_METRIC: value,
  ...
};

export const checkAbnormalVitals = (vitals) => {
  if (vitals.newMetric > THRESHOLDS.NEW_METRIC) {
    abnormalities.push('NEW_ALERT_TYPE');
  }
  ...
};
```

### Add Twilio Integration
```javascript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const notifyEmergencyContacts = async (phone, message) => {
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE,
    to: phone
  });
};
```

---

## 📚 API Documentation

Full API documentation available in `API_DOCUMENTATION.md`

---

## ✅ Verification Checklist

- [ ] MongoDB running and accessible
- [ ] `.env` file configured with all required keys
- [ ] `npm install` completed
- [ ] Server starts without errors: `npm run dev`
- [ ] Health endpoint works: `http://localhost:5000/health`
- [ ] Create test user and emergency contacts
- [ ] Send test vitals via API
- [ ] Verify alerts trigger for abnormal data

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017

Solution: Ensure MongoDB is running
  - macOS: brew services start mongodb-community
  - Windows: mongod
  - Cloud: Check connection string in .env
```

### GOOGLE_MAPS_KEY Error
```
Solution: Add valid Google Maps API key to .env
- Get key from: https://developers.google.com/maps
- Enable Places API in Google Cloud Console
```

### Port Already in Use
```
Error: listen EADDRINUSE :::5000

Solution: Change port in .env or kill existing process
  - Change: PORT=5001 in .env
  - Or kill: lsof -ti:5000 | xargs kill -9
```

---

## 📝 Notes

- All timestamps are in UTC
- Phone numbers validated with regex pattern
- Distance calculated using Haversine formula
- ETA estimated based on 40 km/h average speed
- Alerts are immutable once created (for audit trail)

---

## 📄 License

ISC License - Feel free to use in your project

---

## 🤝 Support

For API documentation, see: `API_DOCUMENTATION.md`
For test examples, see: `examples/api_test_examples.sh`
For sample IoT data, see: `examples/iotDataSample.json`
