#!/bin/bash

BASE_URL="http://localhost:5000"
USER_ID="507f1f77bcf86cd799439011"

echo "=== EMERGENCY CONTACTS API TESTS ==="

echo -e "\n1. Add/Update Emergency Contacts"
curl -X POST $BASE_URL/api/emergency/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "emergencyServices": [
      {
        "name": "Ambulance",
        "phone": "+911234567890",
        "available24x7": true
      },
      {
        "name": "Police",
        "phone": "+919876543210",
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
      },
      {
        "name": "John Smith",
        "relationship": "Sibling",
        "phone": "+918765432108",
        "priority": 2
      }
    ],
    "medicalHistory": {
      "allergies": ["Penicillin", "Aspirin"],
      "chronicDiseases": ["Diabetes Type 2"],
      "medications": ["Metformin", "Lisinopril"],
      "bloodType": "O+"
    }
  }'

echo -e "\n\n2. Get Emergency Contacts"
curl -X GET $BASE_URL/api/emergency/contacts/$USER_ID

echo -e "\n\n3. Update Specific Contact (Family Doctor)"
curl -X PUT $BASE_URL/api/emergency/contacts/update-specific \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "contactType": "familyDoctor",
    "contactData": {
      "name": "Dr. Jane Smith",
      "phone": "+919876543211",
      "email": "jane.smith@example.com",
      "specialization": "Cardiology",
      "hospital": "Heart Care Hospital"
    }
  }'

echo -e "\n\n=== EMAIL & ALERT NOTIFICATION TESTS ==="

echo -e "\n4. Check Email Service Status"
curl -X GET $BASE_URL/api/emergency/email/status

echo -e "\n\n5. Send Test Email"
curl -X POST $BASE_URL/api/emergency/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "your_email@example.com"
  }'

echo -e "\n\n6. Create Emergency Alert (WARNING - No hospital notification)"
curl -X POST $BASE_URL/api/emergency/alerts/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "alertType": "HIGH_TEMPERATURE",
    "severity": "WARNING",
    "vitalDetails": {
      "temperature": 38.5,
      "heartRate": 92,
      "oxygenLevel": 96
    },
    "notes": "Mild fever detected"
  }'

echo -e "\n\n7. Create CRITICAL Alert with Hospital Notifications (Delhi coordinates)"
curl -X POST $BASE_URL/api/emergency/alerts/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "alertType": "LOW_OXYGEN",
    "severity": "CRITICAL",
    "lat": "28.6139",
    "lng": "77.2090",
    "radius": "5000",
    "vitalDetails": {
      "temperature": 37.5,
      "heartRate": 110,
      "oxygenLevel": 88,
      "respiratoryRate": 24
    },
    "notes": "Oxygen level critically low - nearby hospitals notified"
  }'

echo -e "\n\n8. Get All Alerts for User"
curl -X GET "$BASE_URL/api/emergency/alerts/$USER_ID"

echo -e "\n\n9. Get Active Alerts Only"
curl -X GET "$BASE_URL/api/emergency/alerts/$USER_ID?status=ACTIVE"

echo -e "\n\n10. Acknowledge an Alert (Replace ALERT_ID with actual alert ID)"
curl -X PUT $BASE_URL/api/emergency/alerts/ALERT_ID_HERE/acknowledge \
  -H "Content-Type: application/json" \
  -d '{
    "acknowledgedBy": "doctor_id_or_name"
  }'

echo -e "\n\n11. Resolve an Alert (Replace ALERT_ID with actual alert ID)"
curl -X PUT $BASE_URL/api/emergency/alerts/ALERT_ID_HERE/resolve \
  -H "Content-Type: application/json" \
  -d '{}'

echo -e "\n\n=== HOSPITALS API TESTS ==="

echo -e "\n12. Get Nearby Hospitals (Delhi coordinates)"
curl -X GET "$BASE_URL/api/hospitals/nearby?lat=28.6139&lng=77.2090&radius=5000"

echo -e "\n\n13. Get Nearby Ambulances"
curl -X GET "$BASE_URL/api/hospitals/ambulances/nearby?lat=28.6139&lng=77.2090&radius=2000"

echo -e "\n\n14. Get Hospital Details"
curl -X GET "$BASE_URL/api/hospitals/details?lat=28.6139&lng=77.2090&name=Apollo_Hospital"

echo -e "\n\n=== HEALTH CHECK ==="
echo -e "\n15. Health Check"
curl -X GET "$BASE_URL/health"

echo -e "\n\n=== TESTS COMPLETED ==="
