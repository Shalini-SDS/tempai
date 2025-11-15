# Emergency Page Backend - API Documentation

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/emergency_db
PORT=5000
NODE_ENV=development
GOOGLE_MAPS_KEY=your_google_maps_api_key_here
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE=+1234567890
EMERGENCY_CONTACT_PHONE=+1234567890
```

### 3. Start Server
```bash
npm start          # Production
npm run dev        # Development with nodemon
```

Server will run on `http://localhost:5000`

---

## API Endpoints

### 1. EMERGENCY CONTACTS API

#### GET /api/emergency/contacts/:userId
Fetch all emergency contacts for a user.

**Parameters:**
- `userId` (path param, required): User ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "contact_id",
    "userId": "user_id",
    "emergencyServices": [
      {
        "name": "Ambulance",
        "phone": "+911234567890",
        "available24x7": true
      }
    ],
    "familyDoctor": {
      "name": "Dr. John Doe",
      "phone": "+919876543210",
      "email": "doctor@example.com",
      "specialization": "General Medicine",
      "hospital": "City Hospital"
    },
    "emergencyContact": [
      {
        "name": "Jane Doe",
        "relationship": "Spouse",
        "phone": "+918765432109",
        "email": "jane@example.com",
        "priority": 1
      }
    ],
    "medicalHistory": {
      "allergies": ["Penicillin"],
      "chronicDiseases": ["Diabetes"],
      "medications": ["Aspirin"],
      "bloodType": "O+"
    }
  }
}
```

#### POST /api/emergency/contacts
Add or update emergency contacts.

**Request Body:**
```json
{
  "userId": "user_id",
  "emergencyServices": [
    {
      "name": "Ambulance",
      "phone": "+911234567890",
      "available24x7": true
    }
  ],
  "familyDoctor": {
    "name": "Dr. John Doe",
    "phone": "+919876543210",
    "email": "doctor@example.com",
    "specialization": "General Medicine",
    "hospital": "City Hospital"
  },
  "emergencyContact": [
    {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phone": "+918765432109",
      "priority": 1
    }
  ],
  "medicalHistory": {
    "allergies": ["Penicillin"],
    "chronicDiseases": ["Diabetes"],
    "bloodType": "O+"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Emergency contacts saved successfully",
  "data": { }
}
```

#### DELETE /api/emergency/contacts/:id
Delete a specific emergency contact.

**Parameters:**
- `id` (path param, required): Contact ID

**Response:**
```json
{
  "success": true,
  "message": "Emergency contact deleted successfully"
}
```

#### PUT /api/emergency/contacts/update-specific
Update a specific contact type.

**Request Body:**
```json
{
  "userId": "user_id",
  "contactType": "familyDoctor",
  "contactData": {
    "name": "Dr. Jane Smith",
    "phone": "+919876543210",
    "email": "jane.smith@example.com",
    "specialization": "Cardiology",
    "hospital": "Central Hospital"
  }
}
```

**Note:** `contactType` can be: `familyDoctor`, `emergencyServices`, or `emergencyContact`

---

### 2. HOSPITALS API

#### GET /api/hospitals/nearby
Find nearby hospitals using OpenStreetMap (Overpass API).

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `radius` (optional, default: 5000): Search radius in meters

**Response:**
```json
{
  "success": true,
  "count": 5,
  "userLocation": {
    "lat": 28.6139,
    "lng": 77.2090
  },
  "data": [
    {
      "name": "City Hospital",
      "address": "Main Road, Sector 26, Noida",
      "distance": "2.45 km",
      "eta": "6m",
      "coordinates": {
        "lat": 28.5920,
        "lng": 77.2190
      },
      "type": "General Hospital",
      "phone": "+91-120-4990000",
      "website": "https://www.cityhospital.com",
      "operatorType": "Private",
      "beds": "150"
    }
  ],
  "note": "Data from OpenStreetMap (free & open source)"
}
```

#### GET /api/hospitals/details
Get detailed information about a hospital.

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `name` (required): Hospital name

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "City Hospital",
    "address": "Main Road, Sector 26, Noida",
    "phone": "+91-120-4990000",
    "website": "https://www.cityhospital.com",
    "type": "General Hospital",
    "operatorType": "Private",
    "beds": "150",
    "coordinates": {
      "lat": 28.5920,
      "lng": 77.2190
    }
  }
}
```

#### GET /api/hospitals/ambulances/nearby
Find nearby ambulance stations using OpenStreetMap.

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `radius` (optional, default: 2000): Search radius in meters

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "name": "Emergency Ambulance Station",
      "address": "Sector 25, Noida",
      "distance": "1.20 km",
      "eta": "3m",
      "coordinates": {
        "lat": 28.5950,
        "lng": 77.2150
      },
      "phone": "+91-9876543210",
      "operator": "Government"
    }
  ],
  "note": "Data from OpenStreetMap (free & open source)"
}
```

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error": "Error message",
  "details": ["Additional details if applicable"]
}
```

**Common Error Codes:**
- `400`: Bad Request (Missing or invalid parameters)
- `404`: Not Found (Resource doesn't exist)
- `409`: Conflict (Duplicate data)
- `500`: Internal Server Error

---

## Database Collections

1. **EmergencyContacts** - User emergency contact information
2. **EmergencyAlerts** - Auto-triggered alerts based on abnormal vitals

---

## Alert System

The backend automatically:
1. Monitors vital signs in real-time
2. Detects abnormalities based on predefined thresholds
3. Creates alert records in the database
4. Notifies emergency contacts (SMS/Email ready)
5. Tracks alert acknowledgment and resolution

---
