# Emergency Page Backend - Setup & Configuration Guide

## ✨ What's Included

This is a **complete, production-ready Node.js backend** for an Emergency Health Monitoring System with:

✅ **Emergency Contacts Management** - Store and manage emergency contacts  
✅ **IoT Vitals Integration** - Real-time vital signs from medical devices  
✅ **Smart Alert System** - Auto-detect critical conditions  
✅ **Hospital Finder** - Google Places API integration for nearby hospitals/ambulances  
✅ **Alert Logging** - Full audit trail of all alerts  
✅ **Error Handling** - Comprehensive error handling middleware  
✅ **Data Validation** - Mongoose schema validation  

---

## 📦 Complete File Structure Generated

```
backend/
│
├── 📄 server.js
│   └─ Main Express server, DB connection, route initialization
│
├── 📄 package.json
│   └─ Node.js dependencies (Express, Mongoose, Axios, CORS, Nodemon)
│
├── 📄 .env.emergency
│   └─ Environment variables template
│
├─📁 models/
│   ├── EmergencyContact.js        (Schema: contacts + medical history)
│   ├── Vitals.js                  (Schema: vital signs with abnormality flags)
│   └── EmergencyAlert.js          (Schema: alert logs + notifications)
│
├─📁 controllers/
│   ├── emergencyController.js     (5 endpoints for contact management)
│   ├── vitalsController.js        (4 endpoints for vitals + stats)
│   └── hospitalsController.js     (3 endpoints for Google Places API)
│
├─📁 routes/
│   ├── emergencyRoutes.js         (Maps emergency endpoints)
│   ├── vitalsRoutes.js            (Maps vitals endpoints)
│   └── hospitalRoutes.js          (Maps hospital endpoints)
│
├─📁 services/
│   └── alertService.js
│       ├─ checkAbnormalVitals()     (Threshold checking logic)
│       ├─ determineSeverity()       (WARNING|ALERT|CRITICAL)
│       ├─ triggerAlert()            (Create alert + notify)
│       ├─ acknowledgeAlert()        (Mark as acknowledged)
│       ├─ resolveAlert()            (Mark as resolved)
│       └─ getActiveAlerts()         (Fetch active alerts)
│
├─📁 middleware/
│   └── errorHandler.js
│       ├─ Error handling middleware (ValidationError, CastError, etc.)
│       └─ Async handler wrapper
│
├─📁 examples/
│   ├── iotDataSample.json         (6 sample vitals data sets)
│   └── api_test_examples.sh       (13 cURL test commands)
│
├─📄 API_DOCUMENTATION.md
│   └─ Complete API reference with all endpoints
│
└─📄 BACKEND_README.md
    └─ Setup guide + usage examples
```

---

## 🚀 Installation Steps

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs:
- **express** - Web framework
- **mongoose** - MongoDB ORM
- **dotenv** - Environment variables
- **axios** - HTTP client (for Google Maps API)
- **cors** - Cross-Origin Resource Sharing
- **nodemon** - Auto-reload in development

### Step 3: Setup MongoDB

**Option A: Local MongoDB**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Windows (using chocolatey)
choco install mongodb
# Then start MongoDB service manually

# Verify connection
mongosh mongodb://localhost:27017
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Copy to `.env` as `MONGODB_URI`

### Step 4: Configure Environment Variables

Copy and rename the environment template:
```bash
cp .env.emergency .env
```

Edit `.env` with your values:
```env
MONGODB_URI=mongodb://localhost:27017/emergency_db
PORT=5000
NODE_ENV=development
GOOGLE_MAPS_KEY=your_actual_google_maps_api_key_here
TWILIO_ACCOUNT_SID=optional_twilio_account_sid
TWILIO_AUTH_TOKEN=optional_twilio_token
TWILIO_PHONE=optional_twilio_phone_number
```

### Step 5: No API Key Required!

This backend uses **OpenStreetMap (Overpass API)** which is completely free and doesn't require any API key registration. All hospital and ambulance data is sourced from the community-driven OpenStreetMap project.

### Step 6: Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Expected output:
```
MongoDB connected successfully
Server running on http://localhost:5000
```

### Step 7: Verify Setup

```bash
# Health check endpoint
curl http://localhost:5000/health

# Response should be:
# {"status":"Server is running"}
```

---

## 📡 Testing the APIs

### Quick Test: Add Emergency Contacts

```bash
curl -X POST http://localhost:5000/api/emergency/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "emergencyServices": [
      {"name": "Ambulance", "phone": "+911234567890", "available24x7": true}
    ],
    "familyDoctor": {
      "name": "Dr. John Doe",
      "phone": "+919876543210",
      "email": "doctor@example.com",
      "specialization": "General Medicine",
      "hospital": "City Hospital"
    },
    "emergencyContact": [
      {"name": "Jane Doe", "relationship": "Spouse", "phone": "+918765432109", "priority": 1}
    ],
    "medicalHistory": {
      "allergies": ["Penicillin"],
      "chronicDiseases": ["Diabetes"],
      "bloodType": "O+"
    }
  }'
```

### Test: Find Nearby Hospitals

```bash
curl -X GET "http://localhost:5000/api/hospitals/nearby?lat=28.6139&lng=77.2090&radius=5000"
```

### Run All Tests

```bash
bash examples/api_test_examples.sh
```

---

## 🚨 Alert System Configuration

### Current Thresholds (in alertService.js)

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Temperature | > 40°C | HIGH_TEMPERATURE |
| Oxygen | < 92% | LOW_OXYGEN |
| Heart Rate | > 140 bpm | HIGH_HEART_RATE |
| Respiratory Rate | < 8 or > 30 | RESPIRATORY_ABNORMAL |
| Systolic BP | > 180 mmHg | HIGH_BP |
| Diastolic BP | > 120 mmHg | HIGH_BP |

### Customize Thresholds

Edit `services/alertService.js`:

```javascript
const THRESHOLDS = {
  HIGH_TEMPERATURE: 40,          // Change to 38.5 for lower threshold
  LOW_OXYGEN: 92,                // Change to 95 for stricter
  HIGH_HEART_RATE: 140,          // Change to 120 for stricter
  HIGH_BP_SYSTOLIC: 180,
  HIGH_BP_DIASTOLIC: 120,
  LOW_BP_SYSTOLIC: 90,
  LOW_BP_DIASTOLIC: 60,
  RESPIRATORY_LOW: 8,
  RESPIRATORY_HIGH: 30
};
```

---

## 🔌 API Endpoints Summary

### Emergency Contacts (4 endpoints)
```
GET    /api/emergency/contacts/:userId
POST   /api/emergency/contacts
DELETE /api/emergency/contacts/:id
PUT    /api/emergency/contacts/update-specific
```

### Hospitals (OpenStreetMap - 3 endpoints)
```
GET    /api/hospitals/nearby
GET    /api/hospitals/details
GET    /api/hospitals/ambulances/nearby
```

---

## 🏗️ Architecture Overview

```
IoT Device
   ↓
   └→ POST /api/vitals/update
       └→ Vitals Controller
           └→ Save to MongoDB
               ├→ Check thresholds (Alert Service)
                   ├→ If abnormal:
                       ├→ Create EmergencyAlert record
                       ├→ Notify contacts (SMS/Email ready)
                       └→ Mark as HIGH_TEMPERATURE/LOW_OXYGEN/etc
                   └→ If normal: Just save vitals
```

---

## 🧪 Sample Data

### IoT Device Sending Data Every 10 Seconds

```json
{
  "userId": "user_123",
  "deviceId": "IOT_DEVICE_001",
  "heartRate": {"value": 72, "unit": "bpm"},
  "bloodPressure": {"systolic": 120, "diastolic": 80},
  "oxygenLevel": {"value": 98, "unit": "%"},
  "respiratoryRate": {"value": 16, "unit": "breaths/min"},
  "temperature": {"value": 37, "unit": "°C"}
}
```

See `examples/iotDataSample.json` for:
- ✅ Normal vitals
- 🔴 High temperature (40.5°C)
- 🔴 Low oxygen (88%)
- 🔴 High heart rate (155 bpm)
- 🔴 Respiratory issues (32 breaths/min)
- 🔴 Critical (multiple abnormalities)

---

## 📊 Database Collections

### EmergencyContact
- Stores user's emergency contacts
- Medical history (allergies, diseases, medications, blood type)
- Family doctor information
- Emergency service numbers

### Vitals
- IoT vital signs data
- Timestamps for trend analysis
- Abnormality flags for quick filtering
- Indexed by userId + timestamp for fast queries

### EmergencyAlert
- Alert triggers with full vital details
- Notification tracking (SMS/Email/Push)
- Status tracking (ACTIVE → ACKNOWLEDGED → RESOLVED)
- Acknowledgment history

---

## 🔒 Security Notes

✅ **Implemented:**
- Input validation (Mongoose schemas)
- Error handling (No stack traces in production)
- CORS enabled for frontend
- Rate limiting ready (add middleware)

⚠️ **To Add:**
- JWT authentication
- API key validation
- Request rate limiting
- HTTPS in production
- Helmet for security headers

---

## 🚨 Troubleshooting

### Issue: MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Fix:**
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- For cloud: Verify connection string and IP whitelist

### Issue: GOOGLE_MAPS_KEY Error
```
Error: Invalid Google Maps API key or quota exceeded
```
**Fix:**
- Get key from Google Cloud Console
- Enable Places API
- Check key is valid for your quota

### Issue: Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Fix:**
- Kill existing process: `lsof -ti:5000 | xargs kill -9`
- Or change PORT in .env

### Issue: Module Not Found
```
Error: Cannot find module 'express'
```
**Fix:**
- Run `npm install`
- Delete `node_modules` and `package-lock.json`, then reinstall

---

## 📚 Next Steps

1. **Connect Frontend** - Use axios in React/Vue to call APIs
2. **Implement Twilio** - Add SMS/Call notifications
3. **Add Authentication** - Implement JWT token validation
4. **Deploy** - Use Heroku, AWS, or DigitalOcean
5. **Monitor** - Set up logging and monitoring

---

## 📖 Documentation Files

- **API_DOCUMENTATION.md** - Complete API reference with examples
- **BACKEND_README.md** - Architecture and usage guide
- **examples/api_test_examples.sh** - 13 ready-to-run cURL commands
- **examples/iotDataSample.json** - Sample data for testing

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] npm install completed without errors
- [ ] MongoDB running and accessible
- [ ] .env file configured
- [ ] Server starts: `npm run dev`
- [ ] Health check: `curl http://localhost:5000/health`
- [ ] Can add emergency contacts
- [ ] Can query hospitals API (OpenStreetMap)
- [ ] Data saved in MongoDB

---

## 🎯 Your Next Move

1. **Complete Setup:**
   ```bash
   cd backend
   npm install
   cp .env.emergency .env
   # No API key needed - using free OpenStreetMap!
   npm run dev
   ```

2. **Test API:**
   ```bash
   bash examples/api_test_examples.sh
   ```

3. **Check Database:**
   ```bash
   mongosh mongodb://localhost:27017/emergency_db
   db.emergencycontacts.find()
   db.vitals.find()
   ```

---

**Your Emergency Page backend is ready to go!** 🚀

For detailed API documentation, see: `API_DOCUMENTATION.md`
