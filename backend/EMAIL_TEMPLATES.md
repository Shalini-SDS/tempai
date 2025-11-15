# Email Notification Templates

This document shows the email templates used by the Emergency Alert System for notifying emergency contacts and nearby hospitals.

---

## 1. Emergency Alert Email (Emergency Contacts)

**To**: Family Doctor, Emergency Contacts  
**Subject**: 🚨 EMERGENCY ALERT: {SEVERITY} - {ALERT_TYPE}  
**Trigger**: When an alert is created

```html
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 EMERGENCY ALERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear [Contact Name],

[Patient Name] has triggered an emergency alert with CRITICAL severity.

ALERT DETAILS:
─────────────────────────────────────────────────────
• Alert Type: HIGH_TEMPERATURE
• Severity: CRITICAL
• Status: ACTIVE
• Triggered at: Nov 15, 2025, 10:30:45 AM

VITAL SIGNS:
─────────────────────────────────────────────────────
• Heart Rate: 110 bpm
• Oxygen Level: 88 %
• Temperature: 40.5 °C
• Blood Pressure: 135/88 mmHg
• Respiratory Rate: 24 breaths/min

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is an automated alert from the Emergency Response System.
```

---

## 2. Hospital Notification Email

**To**: Hospital notification email (from HOSPITAL_NOTIFICATION_EMAIL env var)  
**Subject**: 🚨 INCOMING PATIENT ALERT - {SEVERITY} - {Hospital Name}  
**Trigger**: When a CRITICAL alert is created with location coordinates

```html
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 INCOMING PATIENT NOTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A patient in your vicinity has triggered an emergency alert.

ALERT INFORMATION:
─────────────────────────────────────────────────────
• Alert Type: LOW_OXYGEN
• Severity: CRITICAL
• Location: 28.6139, 77.2090 (Delhi)
• Time: Nov 15, 2025, 10:30:45 AM

NEARBY HOSPITALS BEING NOTIFIED:
─────────────────────────────────────────────────────

1. Apollo Hospital - 2.5 km
   Address: Mathura Road, New Delhi
   Phone: +91-11-4166-1111
   ETA: 5m

2. Max Healthcare - 3.1 km
   Address: Saket, New Delhi
   Phone: +91-11-4200-0000
   ETA: 7m

3. Fortis Hospital - 3.8 km
   Address: Okhla, New Delhi
   Phone: +91-11-4133-3333
   ETA: 9m

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is an automated alert from the Emergency Response System.
```

---

## 3. Test Email

**To**: Any provided email address  
**Subject**: Test Email - Emergency Alert System  
**Trigger**: Manual test via `/api/emergency/email/test` endpoint

```html
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ TEST EMAIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test Email

If you received this, email notifications are working correctly!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Email Configuration

### For Gmail:
```
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
```

**Steps to get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to App Passwords section
4. Select "Mail" and "Windows Computer"
5. Copy the generated password and use it as EMAIL_PASSWORD

### For Outlook/Custom SMTP:
```
EMAIL_SERVICE=custom
SMTP_HOST=smtp.gmail.com (or your SMTP server)
SMTP_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_password
```

### Hospital Notification Email:
```
HOSPITAL_NOTIFICATION_EMAIL=hospital_alerts@yourorg.com
```
Leave empty to use the same EMAIL_USER as emergency contact notifications.

---

## Testing Email Notifications

### Test Email Service:
```bash
curl -X POST http://localhost:5000/api/emergency/email/test \
  -H "Content-Type: application/json" \
  -d '{"recipientEmail":"test@example.com"}'
```

### Check Email Service Status:
```bash
curl -X GET http://localhost:5000/api/emergency/email/status
```

**Response:**
```json
{
  "success": true,
  "emailService": {
    "configured": true,
    "service": "gmail",
    "user": "your_email@gmail.com",
    "notificationsEnabled": {
      "emergencyContacts": true,
      "hospitals": true
    }
  }
}
```

---

## Alert Email Flow

### When an Alert is Created:

1. **Alert Created** → Saved to MongoDB with status "ACTIVE"

2. **Emergency Contacts Notification**
   - Fetch emergency contacts for the user
   - Send email to Family Doctor (if configured)
   - Send emails to top 2 emergency contacts (if configured)
   - Record notification status in alert document

3. **Hospital Notification** (if CRITICAL severity + location provided)
   - Query OpenStreetMap for nearby hospitals
   - Get top 3 closest hospitals
   - Send notification email to hospital notification address
   - Include patient location, alert type, and hospital details
   - Provide ETA and contact information for each hospital

4. **Alert Stored** → Notification details stored with alert record
   - Timestamp of each notification
   - Delivery status (SENT/FAILED)
   - Recipient email

---

## Severity Levels and Thresholds

### WARNING
- Single minor vital abnormality detected
- Email sent to emergency contacts only

### ALERT  
- Multiple vital abnormalities detected
- Email sent to emergency contacts only

### CRITICAL
- Critical vital abnormalities detected (Low Oxygen, High Temperature)
- Email sent to emergency contacts AND nearby hospitals
- Hospital notification includes location and ETA information

---

## Customizing Email Templates

To modify email templates, edit `/backend/services/emailService.js`:

```javascript
// For emergency contact emails
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: recipientEmail,
  subject: `🚨 EMERGENCY ALERT: ${alert.severity} - ${alert.alertType}`,
  html: `<h2>Customize your template here</h2>`
}

// For hospital notifications
const hospitalMailOptions = {
  from: process.env.EMAIL_USER,
  subject: `🚨 INCOMING PATIENT ALERT - ${alertDetails.severity}`,
  html: `<h2>Customize hospital template here</h2>`
}
```

---

## Troubleshooting

### Email Not Sending?

1. **Check Configuration**
   ```bash
   curl -X GET http://localhost:5000/api/emergency/email/status
   ```

2. **Verify Credentials**
   - For Gmail: Use App Password, not your regular password
   - For Outlook: Ensure SMTP credentials are correct
   - For Custom SMTP: Test SMTP connection manually

3. **Test Email Feature**
   ```bash
   curl -X POST http://localhost:5000/api/emergency/email/test \
     -H "Content-Type: application/json" \
     -d '{"recipientEmail":"your_email@gmail.com"}'
   ```

4. **Check Server Logs**
   ```
   [EMAIL] Alert notification sent to [email]
   [EMAIL ERROR] Failed to send email to [email]: [error details]
   ```

5. **Gmail Security**
   - Check if 2-Step Verification is enabled
   - Use only App Passwords, not regular passwords
   - Allow "Less secure app access" if needed

6. **Email in Spam**
   - Add sender email to contacts
   - Check spam folder for verification emails
   - Ensure SPF/DKIM records are configured for custom domains

---

## Future Enhancements

- SMS notifications via Twilio
- WhatsApp alerts via Twilio
- In-app push notifications
- SMS to hospital main switchboard
- Priority routing based on alert severity
- Multi-language email templates
- Custom email branding
