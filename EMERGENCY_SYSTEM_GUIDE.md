# 🚨 Complete Emergency System Guide

## Quick Start

### 1. Backend Setup

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Node.js Backend
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
# Terminal 3: Start React Frontend
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 3. Configure Email Notifications

Edit `.env.emergency`:
```
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
HOSPITAL_NOTIFICATION_EMAIL=hospital_alerts@example.com
```

**Get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification (if not already done)
3. Find "App passwords" section
4. Select "Mail" and "Windows Computer"
5. Copy the generated 16-character password
6. Paste it in `.env.emergency` as EMAIL_PASSWORD

---

## System Architecture

```
┌─────────────────────────────────────┐
│     React Frontend (Emergency Page)  │
│  - Map with Hospital/Ambulance       │
│  - Emergency Contacts List           │
│  - Alert Creation Form               │
│  - Real-time Alert Status            │
└────────────────┬────────────────────┘
                 │ HTTP/REST API
                 ▼
┌─────────────────────────────────────┐
│      Node.js Express Backend         │
│  - Emergency Contacts API            │
│  - Alert Management API              │
│  - Hospital/Ambulance Finder         │
│  - Email Notification Service        │
└────────────────┬────────────────────┘
                 │
        ┌────────┴─────────┬──────────────┐
        ▼                  ▼              ▼
   ┌─────────┐      ┌──────────┐   ┌──────────┐
   │MongoDB  │      │Gmail/    │   │OpenStreetMap
   │Database │      │SMTP      │   │(Maps)
   │         │      │Service   │   │
   └─────────┘      └──────────┘   └──────────┘
```

---

## Complete User Flow

### Scenario: Patient Has Emergency

#### Step 1: User Navigates to Emergency Page
- Opens browser and goes to Emergency tab
- System requests GPS permission
- Location detected: 28.6139°N, 77.2090°E (Delhi)

#### Step 2: System Initializes
**API Calls:**
```
✓ GET /api/emergency/contacts/:userId
  → Returns: Family doctor, emergency contacts

✓ GET /api/hospitals/nearby?lat=28.6139&lng=77.2090&radius=5000
  → Returns: 10 nearby hospitals with ETAs

✓ GET /api/hospitals/ambulances/nearby?lat=28.6139&lng=77.2090&radius=2000
  → Returns: 5 nearby ambulances

✓ GET /api/emergency/alerts/:userId?status=ACTIVE
  → Returns: Any active alerts
```

**Page Renders:**
- Interactive map with blue marker at user location
- Hospital markers in red
- Ambulance markers in orange
- Emergency contacts in sidebar
- Alert creation form ready

#### Step 3: Critical Situation - Create Alert

User clicks "Create New Alert" and fills form:
```
Alert Type: Low Oxygen
Severity: CRITICAL ← This triggers hospital notifications!
Notes: "Oxygen dropping, difficulty breathing"
```

Click "Send Alert to All Contacts"

#### Step 4: Backend Processes Alert

```
1. Create Alert Record
   POST /api/emergency/alerts/create
   
   Body: {
     "userId": "507f1f77bcf86cd799439011",
     "alertType": "LOW_OXYGEN",
     "severity": "CRITICAL",
     "lat": "28.6139",
     "lng": "77.2090",
     "radius": "5000",
     "notes": "Oxygen dropping, difficulty breathing"
   }

2. Save to MongoDB
   Alert Status: ACTIVE
   Triggered At: 2025-11-15T10:30:45Z

3. Notify Emergency Contacts
   - Fetch emergency contacts from database
   - Send email to Family Doctor
   - Send email to top 2 emergency contacts
   - Record notification status

4. Notify Nearby Hospitals (CRITICAL only)
   - Query OpenStreetMap for nearby hospitals
   - Get top 3 closest hospitals
   - Send notification email to hospitals
   - Include: Patient location, alert type, ETA for each hospital

5. Return Response
   Status: 201 Created
   Message: "Alert created and notifications sent"
```

#### Step 5: Email Notifications Sent

**To Emergency Contacts:**
```
Subject: 🚨 EMERGENCY ALERT: CRITICAL - LOW_OXYGEN

Dear [Contact Name],

[Patient Name] has triggered an emergency alert with CRITICAL severity.

Alert Details:
• Alert Type: LOW_OXYGEN
• Severity: CRITICAL
• Location: 28.6139, 77.2090
• Time: Nov 15, 2025, 10:30:45 AM

Vital Signs:
• Heart Rate: 110 bpm
• Oxygen Level: 88%
• Temperature: 37.5°C
• Blood Pressure: 135/88 mmHg
```

**To Nearby Hospitals:**
```
Subject: 🚨 INCOMING PATIENT ALERT - CRITICAL - Apollo Hospital

A patient in your vicinity has triggered an emergency alert.

Alert Information:
• Type: LOW_OXYGEN
• Severity: CRITICAL
• Location: 28.6139, 77.2090 (3.2 km away)
• Time: Nov 15, 2025, 10:30:45 AM

Nearby Hospitals Being Notified:
1. Apollo Hospital - 2.5 km - ETA: 5 minutes
2. Max Healthcare - 3.1 km - ETA: 7 minutes
3. Fortis Hospital - 3.8 km - ETA: 9 minutes
```

#### Step 6: Alert Status Updates in Real-Time

Frontend shows:
```
🚨 ACTIVE ALERTS (1 active)

Alert: LOW_OXYGEN - CRITICAL
Status: ACTIVE
Time: Just now

[Acknowledge] [Resolve]
```

#### Step 7: Family Doctor Acknowledges

Doctor receives email, calls patient, and:
- Clicks "Acknowledge" button in emergency page
- System updates alert status to ACKNOWLEDGED
- Notification recorded with doctor's name

#### Step 8: Patient Improves

Once stable:
- Click "Resolve" button
- System updates alert status to RESOLVED
- Alert removed from active list
- History maintained for medical records

---

## API Endpoints Reference

### Emergency Contacts

```bash
# Get all contacts for a user
GET /api/emergency/contacts/:userId

# Add/Update contacts
POST /api/emergency/contacts
Body: {
  "userId": "...",
  "emergencyServices": [...],
  "familyDoctor": {...},
  "emergencyContact": [...],
  "medicalHistory": {...}
}

# Delete a contact
DELETE /api/emergency/contacts/:id

# Update specific contact type
PUT /api/emergency/contacts/update-specific
Body: {
  "userId": "...",
  "contactType": "familyDoctor",
  "contactData": {...}
}
```

### Alerts

```bash
# Create alert
POST /api/emergency/alerts/create
Body: {
  "userId": "...",
  "alertType": "HIGH_TEMPERATURE|LOW_OXYGEN|HIGH_HEART_RATE|RESPIRATORY_ABNORMAL|CRITICAL",
  "severity": "WARNING|ALERT|CRITICAL",
  "lat": "28.6139",
  "lng": "77.2090",
  "radius": "5000",
  "vitalDetails": {...},
  "notes": "..."
}

# Get all alerts
GET /api/emergency/alerts/:userId
GET /api/emergency/alerts/:userId?status=ACTIVE|ACKNOWLEDGED|RESOLVED

# Acknowledge alert
PUT /api/emergency/alerts/:alertId/acknowledge
Body: {
  "acknowledgedBy": "doctor_id_or_name"
}

# Resolve alert
PUT /api/emergency/alerts/:alertId/resolve
```

### Hospitals & Ambulances

```bash
# Get nearby hospitals
GET /api/hospitals/nearby?lat=28.6139&lng=77.2090&radius=5000

# Get hospital details
GET /api/hospitals/details?lat=28.6139&lng=77.2090&name=Apollo_Hospital

# Get nearby ambulances
GET /api/hospitals/ambulances/nearby?lat=28.6139&lng=77.2090&radius=2000
```

### Email Service

```bash
# Check email service status
GET /api/emergency/email/status

# Send test email
POST /api/emergency/email/test
Body: {
  "recipientEmail": "test@example.com"
}
```

---

## Email Notification Flow Chart

```
┌──────────────────────────┐
│  Create Emergency Alert  │
└────────────┬─────────────┘
             │
             ▼
    ┌────────────────────┐
    │ Check Severity     │
    └────────┬───────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
   WARNING/      CRITICAL
   ALERT         │
   │             ├─────────────────┐
   │             │                 │
   ▼             ▼                 ▼
Notify        Notify          Query OSM
Emergency     Emergency       for Hospitals
Contacts      Contacts        │
│             │               ▼
│             │          Notify
│             │          Hospitals
│             │               │
└──────┬──────┴───────────────┘
       │
       ▼
  Record in
  Alert Document
  (notificationsSent)
```

---

## Data Models

### EmergencyContact
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  emergencyServices: [
    {
      name: String,
      phone: String,
      available24x7: Boolean
    }
  ],
  familyDoctor: {
    name: String,
    phone: String,
    email: String,
    specialization: String,
    hospital: String
  },
  emergencyContact: [
    {
      name: String,
      relationship: String,
      phone: String,
      email: String,
      priority: Number (1-5)
    }
  ],
  medicalHistory: {
    allergies: [String],
    chronicDiseases: [String],
    medications: [String],
    bloodType: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### EmergencyAlert
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  alertType: String (HIGH_TEMPERATURE|LOW_OXYGEN|HIGH_HEART_RATE|RESPIRATORY_ABNORMAL|CRITICAL),
  severity: String (WARNING|ALERT|CRITICAL),
  vitalDetails: {
    heartRate: Number,
    bloodPressure: { systolic: Number, diastolic: Number },
    oxygenLevel: Number,
    temperature: Number,
    respiratoryRate: Number
  },
  status: String (ACTIVE|ACKNOWLEDGED|RESOLVED),
  triggeredAt: Date,
  acknowledgedAt: Date,
  acknowledgedBy: ObjectId,
  resolvedAt: Date,
  notificationsSent: [
    {
      method: String (SMS|CALL|EMAIL|PUSH),
      sentAt: Date,
      status: String (SENT|FAILED|DELIVERED),
      recipient: String,
      contactId: ObjectId
    }
  ],
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Key Features Summary

### ✅ Implemented
- [x] Auto-detected GPS location
- [x] Interactive OpenStreetMap with markers
- [x] Dynamic emergency contacts from database
- [x] Dynamic hospitals/ambulances from OpenStreetMap
- [x] Alert creation with multiple severity levels
- [x] Email notifications to emergency contacts
- [x] Email notifications to nearby hospitals (CRITICAL only)
- [x] Real-time alert status management
- [x] Acknowledge and resolve alerts
- [x] Free, open-source (no API keys required)

### 🔜 Future Enhancements
- [ ] SMS notifications via Twilio
- [ ] WhatsApp alerts
- [ ] In-app push notifications
- [ ] Real-time hospital bed availability
- [ ] Ambulance tracking
- [ ] Voice calling integration
- [ ] Multi-language support
- [ ] Offline mode with service workers

---

## Testing Checklist

```
Backend Tests:
□ MongoDB is running
□ Backend server starts without errors
□ Health check endpoint responds: GET /health
□ Email service configured: GET /api/emergency/email/status
□ Test email sends: POST /api/emergency/email/test

Frontend Tests:
□ Frontend starts: npm run dev
□ Can navigate to Emergency page
□ Location permission dialog appears
□ Map renders with your location
□ Emergency contacts load from API
□ Hospitals list shows nearby facilities
□ Can create alert with all fields
□ Alert creation shows success message
□ Active alerts appear in real-time
□ Acknowledge button works
□ Resolve button works

Integration Tests:
□ Create alert → Email arrives in inbox within 1 minute
□ CRITICAL alert → Hospital notification email arrives
□ Multiple alerts show correctly
□ Acknowledge alert → Status changes to ACKNOWLEDGED
□ Resolve alert → Status changes to RESOLVED
□ Map markers update on page refresh
□ Location changes trigger new hospital queries
```

---

## Deployment Checklist

```
Before Going Live:
□ Use HTTPS (required for geolocation in production)
□ Update CORS settings for production domain
□ Set NODE_ENV=production
□ Configure real email service (Gmail App Password)
□ Set up hospital notification email
□ Test all API endpoints in production
□ Set up MongoDB Atlas or managed database
□ Enable rate limiting on API endpoints
□ Set up monitoring and error logging
□ Configure backup strategy for database
□ Test email delivery in production
□ Load test alert creation endpoint
□ Test map performance with many markers
```

---

## Support Resources

- **Email Setup**: See `backend/EMAIL_TEMPLATES.md`
- **Frontend Setup**: See `frontend/EMERGENCY_PAGE_SETUP.md`
- **API Documentation**: See `backend/API_DOCUMENTATION.md`
- **Backend README**: See `backend/BACKEND_README.md`

---

## Contact & Support

For issues, refer to:
1. Check logs in backend and frontend
2. Review troubleshooting sections in setup guides
3. Verify environment variables are correct
4. Test individual API endpoints with curl
5. Check browser console for JavaScript errors
