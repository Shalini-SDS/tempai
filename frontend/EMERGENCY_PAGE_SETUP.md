# Emergency Page Setup Guide

## Overview

The new Emergency Page provides real-time emergency response capabilities with:
- **Auto-detected GPS location** of the user
- **Interactive OpenStreetMap integration** showing nearby hospitals and ambulances
- **Dynamic emergency contacts** fetched from the backend
- **Alert creation system** with email notifications to emergency contacts and hospitals
- **Real-time alert management** with acknowledge/resolve functionality

---

## Installation

### 1. Install Dependencies

The frontend now requires Leaflet for map functionality:

```bash
cd frontend
npm install
```

This will install:
- `leaflet@1.9.4` - OpenStreetMap integration library

### 2. Backend Requirements

Ensure the backend is running with these endpoints configured:

```
GET  /api/emergency/contacts/:userId
GET  /api/emergency/alerts/:userId
POST /api/emergency/alerts/create
PUT  /api/emergency/alerts/:alertId/acknowledge
PUT  /api/emergency/alerts/:alertId/resolve
GET  /api/hospitals/nearby
GET  /api/hospitals/ambulances/nearby
```

### 3. Environment Configuration

**Frontend (`.env.local`):**
```
VITE_API_URL=http://localhost:5000
```

**Backend (`.env.emergency`):**
```
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Hospital Notifications (Optional)
HOSPITAL_NOTIFICATION_EMAIL=hospital_alerts@example.com

# MongoDB
MONGODB_URI=mongodb://localhost:27017/emergency_db

# Server
PORT=5000
NODE_ENV=development
```

---

## Features

### 1. Auto-Detection Location

When the Emergency page loads:
- Browser requests GPS location permission
- User location is captured automatically
- Map centers on user location with blue marker

```javascript
// Automatic geolocation detection
navigator.geolocation.getCurrentPosition(position => {
  const { latitude, longitude } = position.coords
  // Load hospitals, ambulances, and render map
})
```

### 2. Interactive Map

**Markers:**
- **Blue** (🔵): Your current location
- **Red** (🔴): Nearby hospitals
- **Orange** (🟠): Nearby ambulances

**Features:**
- Zoom in/out to see more details
- Click markers to see facility information
- Pan around to explore the area
- Map loads from OpenStreetMap (free, no API key required)

### 3. Emergency Contacts

Displays all configured emergency contacts:
- **Emergency Services** (Ambulance, Police, etc.)
- **Family Doctor** with specialization
- **Emergency Contacts** with relationships and priority

Each contact shows:
- Name and relationship
- Phone number (clickable to call)
- Email address

### 4. Nearby Facilities

**Hospitals List:**
- Name and address
- Distance from your location
- ETA to hospital (based on 40 km/h average speed)
- Phone number (clickable)
- Clickable to get directions

**Ambulances List:**
- Name and address
- Distance
- ETA
- Phone number

### 5. Alert Creation

**Create a new alert:**

1. Click "Create New Alert" button
2. Select alert type:
   - High Temperature
   - Low Oxygen
   - High Heart Rate
   - Respiratory Abnormality
   - Critical Condition

3. Select severity:
   - **WARNING**: Single minor issue, notifies emergency contacts only
   - **ALERT**: Multiple issues, notifies emergency contacts only
   - **CRITICAL**: Severe issues, notifies emergency contacts + nearby hospitals

4. Add optional notes
5. Click "Send Alert to All Contacts"

**What happens:**
- Alert is created and stored in database
- Emails sent to emergency contacts with vitals and alert details
- If CRITICAL: Nearby hospitals are notified with your location and ETA
- Alert status displayed in real-time
- User can acknowledge or resolve the alert

### 6. Active Alerts Management

Shows all active alerts with:
- Alert type and timestamp
- Current status (ACTIVE/ACKNOWLEDGED/RESOLVED)
- Severity level (color-coded)
- Action buttons to acknowledge or resolve

---

## API Integration

### Get Emergency Contacts

```javascript
GET /api/emergency/contacts/:userId

Response:
{
  "success": true,
  "data": {
    "userId": "...",
    "emergencyServices": [...],
    "familyDoctor": {...},
    "emergencyContact": [...]
  }
}
```

### Get Nearby Hospitals

```javascript
GET /api/hospitals/nearby?lat=28.6139&lng=77.2090&radius=5000

Response:
{
  "success": true,
  "count": 10,
  "data": [
    {
      "name": "Apollo Hospital",
      "distance": "2.5 km",
      "eta": "5m",
      "coordinates": { "lat": 28.5721, "lng": 77.1884 },
      "address": "...",
      "phone": "...",
      "website": "..."
    }
  ]
}
```

### Create Emergency Alert

```javascript
POST /api/emergency/alerts/create

Body:
{
  "userId": "...",
  "alertType": "LOW_OXYGEN",
  "severity": "CRITICAL",
  "lat": "28.6139",
  "lng": "77.2090",
  "radius": "5000",
  "vitalDetails": {
    "temperature": 37.5,
    "heartRate": 110,
    "oxygenLevel": 88
  },
  "notes": "Patient condition deteriorating"
}

Response:
{
  "success": true,
  "message": "Emergency alert created and notifications sent",
  "data": {...}
}
```

### Get Active Alerts

```javascript
GET /api/emergency/alerts/:userId?status=ACTIVE

Response:
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "...",
      "alertType": "HIGH_TEMPERATURE",
      "severity": "CRITICAL",
      "status": "ACTIVE",
      "triggeredAt": "2025-11-15T10:30:45.000Z",
      "vitalDetails": {...},
      "notificationsSent": [...]
    }
  ]
}
```

### Acknowledge Alert

```javascript
PUT /api/emergency/alerts/:alertId/acknowledge

Body:
{
  "acknowledgedBy": "doctor_id_or_name"
}

Response:
{
  "success": true,
  "message": "Alert acknowledged",
  "data": {...}
}
```

### Resolve Alert

```javascript
PUT /api/emergency/alerts/:alertId/resolve

Response:
{
  "success": true,
  "message": "Alert resolved",
  "data": {...}
}
```

---

## File Structure

```
frontend/src/
├── components/
│   ├── EmergencyPage.jsx          (Main emergency page component)
│   ├── Dashboard.jsx              (Updated to use EmergencyPage)
│   └── ...
├── styles/
│   ├── Emergency.css              (Emergency page styling)
│   └── ...
├── context/
│   ├── AuthContext.jsx
│   └── ...
└── ...
```

---

## CSS Classes Reference

### Main Layout
- `.emergency-page` - Main container
- `.emergency-banner` - Top warning banner
- `.emergency-content` - Main content area with sidebar

### Map
- `.map-card` - Map container card
- `.map-container` - Leaflet map div

### Alerts
- `.alerts-card` - Active alerts section
- `.alerts-list` - List of alerts
- `.alert-item` - Individual alert item
- `.alert-warning`, `.alert-alert`, `.alert-critical` - Severity indicators

### Forms
- `.alert-form-card` - Alert creation form
- `.form-group` - Form field container
- `.form-message.success`, `.form-message.error` - Message indicators

### Sidebar
- `.emergency-sidebar` - Right sidebar
- `.contact-card` - Emergency contacts card
- `.facilities-card` - Hospitals card
- `.ambulances-card` - Ambulances card

---

## Testing

### 1. Test Location Detection

Open DevTools and manually set location:
```javascript
// In browser console
navigator.geolocation.getCurrentPosition(pos => console.log(pos))
```

### 2. Test Map Rendering

Verify map loads:
```javascript
// Map should be visible with markers
console.log(document.querySelector('.leaflet-container'))
```

### 3. Create Test Alert

```bash
curl -X POST http://localhost:5000/api/emergency/alerts/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"507f1f77bcf86cd799439011",
    "alertType":"HIGH_TEMPERATURE",
    "severity":"CRITICAL",
    "lat":"28.6139",
    "lng":"77.2090",
    "notes":"Test alert"
  }'
```

### 4. Check Email Notifications

```bash
# Verify email service is configured
curl -X GET http://localhost:5000/api/emergency/email/status

# Send test email
curl -X POST http://localhost:5000/api/emergency/email/test \
  -H "Content-Type: application/json" \
  -d '{"recipientEmail":"your_email@gmail.com"}'
```

---

## Troubleshooting

### Location Permission Denied

**Error**: "Please enable location permissions to use emergency features"

**Solution:**
1. Check browser location permission settings
2. Reset site permissions for localhost:5000
3. Use HTTPS (required for production geolocation)

### Map Not Loading

**Error**: Map container appears blank

**Solution:**
1. Check that Leaflet is installed: `npm list leaflet`
2. Verify `.leaflet-container` has height: `min-height: 350px`
3. Check browser console for errors
4. Ensure OpenStreetMap API is accessible

### No Hospitals Found

**Error**: "No hospitals found in the specified radius"

**Solution:**
1. Verify location coordinates are correct
2. Try increasing radius parameter (default: 5000m)
3. Check OpenStreetMap data coverage for your region
4. Verify internet connection to Overpass API

### Email Not Sending

**Error**: "Email service not configured"

**Solution:**
1. Check `.env.emergency` has EMAIL_USER and EMAIL_PASSWORD
2. For Gmail, use App Password, not regular password
3. Verify email credentials are correct
4. Check server logs for SMTP errors
5. See `EMAIL_TEMPLATES.md` for detailed configuration

### Alerts Not Showing

**Error**: "No active alerts" even after creating one

**Solution:**
1. Verify alert was created (check backend logs)
2. Check MongoDB connection is working
3. Ensure user ID is correctly passed in API calls
4. Check browser console for API errors
5. Refresh the page

---

## Performance Tips

1. **Map Performance**
   - Limit number of markers displayed
   - Use clustering for many markers
   - Cache hospital/ambulance data

2. **API Calls**
   - Cache emergency contacts (only fetch on load)
   - Fetch hospitals/ambulances only when needed
   - Implement pagination for large alert lists

3. **Location Accuracy**
   - Request high accuracy geolocation (may use more battery)
   - Cache location for 5-10 minutes
   - Allow manual location input as fallback

---

## Future Enhancements

- [ ] Real-time location tracking
- [ ] Multiple language support
- [ ] SMS alerts integration
- [ ] Call integration
- [ ] Medical history display on alert
- [ ] Hospital bed availability
- [ ] Ambulance real-time tracking
- [ ] Alert history with analytics
- [ ] Offline mode with service workers
- [ ] Voice commands for alerts
- [ ] Integration with wearable devices

---

## Support

For issues or questions:
1. Check `EMAIL_TEMPLATES.md` for email configuration
2. Review backend API documentation in `API_DOCUMENTATION.md`
3. Check browser console for JavaScript errors
4. Review server logs for backend errors
5. Test individual API endpoints with curl

---

## License

This emergency page component is part of the TempAI Emergency Response System.
