import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter;

const initializeTransporter = () => {
  if (transporter) return transporter;

  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.warn('Email service not configured. Skipping email notifications.');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: emailService,
    auth: {
      user: emailUser,
      pass: emailPassword
    }
  });

  return transporter;
};

const formatAlertDetails = (alert) => {
  const vitalDetails = alert.vitalDetails || {};
  return `
    <h3>Alert Details:</h3>
    <ul>
      <li><strong>Alert Type:</strong> ${alert.alertType}</li>
      <li><strong>Severity:</strong> ${alert.severity}</li>
      <li><strong>Status:</strong> ${alert.status}</li>
      <li><strong>Triggered at:</strong> ${new Date(alert.triggeredAt).toLocaleString()}</li>
    </ul>
    <h3>Vital Signs:</h3>
    <ul>
      <li><strong>Heart Rate:</strong> ${vitalDetails.heartRate || 'N/A'} bpm</li>
      <li><strong>Oxygen Level:</strong> ${vitalDetails.oxygenLevel || 'N/A'} %</li>
      <li><strong>Temperature:</strong> ${vitalDetails.temperature || 'N/A'} °C</li>
      <li><strong>Blood Pressure:</strong> ${vitalDetails.bloodPressure?.systolic || 'N/A'}/${vitalDetails.bloodPressure?.diastolic || 'N/A'} mmHg</li>
      <li><strong>Respiratory Rate:</strong> ${vitalDetails.respiratoryRate || 'N/A'} breaths/min</li>
    </ul>
  `;
};

export const sendEmergencyAlertEmail = async (recipientEmail, recipientName, alert, patientName) => {
  try {
    const mailer = initializeTransporter();
    if (!mailer) return;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `🚨 EMERGENCY ALERT: ${alert.severity} - ${alert.alertType}`,
      html: `
        <h2 style="color: #d9534f;">EMERGENCY ALERT</h2>
        <p>Dear ${recipientName},</p>
        <p><strong>${patientName}</strong> has triggered an emergency alert with <strong>${alert.severity}</strong> severity.</p>
        ${formatAlertDetails(alert)}
        <p style="margin-top: 20px; color: #999;">
          This is an automated alert from the Emergency Response System.
        </p>
      `
    };

    await mailer.sendMail(mailOptions);
    console.log(`[EMAIL] Alert notification sent to ${recipientEmail} for alert ${alert._id}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${recipientEmail}:`, error.message);
    return false;
  }
};

export const sendTestEmail = async (recipientEmail) => {
  try {
    const mailer = initializeTransporter();
    if (!mailer) {
      return { success: false, message: 'Email service not configured' };
    }

    await mailer.sendMail({
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: 'Test Email - Emergency Alert System',
      html: '<h2>Test Email</h2><p>If you received this, email notifications are working correctly!</p>'
    });

    return { success: true, message: `Test email sent to ${recipientEmail}` };
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send test email:`, error.message);
    return { success: false, message: error.message };
  }
};

export const sendNearbyHospitalNotification = async (hospitals, alertDetails, userLocation) => {
  try {
    const mailer = initializeTransporter();
    if (!mailer) return;

    if (!hospitals || hospitals.length === 0) {
      console.warn('[EMAIL] No hospitals provided for notification');
      return;
    }

    const hospitalEmails = hospitals
      .filter(h => h.phone && h.phone !== 'N/A')
      .map(h => ({
        name: h.name,
        address: h.address,
        phone: h.phone,
        distance: h.distance,
        eta: h.eta
      }));

    if (hospitalEmails.length === 0) {
      console.warn('[EMAIL] No valid hospital emails found for notification');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      subject: `🚨 INCOMING PATIENT ALERT - ${alertDetails.severity}`,
      html: `
        <h2 style="color: #d9534f;">INCOMING PATIENT NOTIFICATION</h2>
        <p>A patient in your vicinity has triggered an emergency alert.</p>
        
        <h3>Alert Information:</h3>
        <ul>
          <li><strong>Alert Type:</strong> ${alertDetails.alertType}</li>
          <li><strong>Severity:</strong> ${alertDetails.severity}</li>
          <li><strong>Location:</strong> ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}</li>
          <li><strong>Time:</strong> ${new Date(alertDetails.triggeredAt).toLocaleString()}</li>
        </ul>
        
        <h3>Nearby Hospitals Being Notified:</h3>
        <ul>
          ${hospitalEmails.map(h => `
            <li>
              <strong>${h.name}</strong> - ${h.distance}<br/>
              Address: ${h.address}<br/>
              Phone: ${h.phone}<br/>
              ETA: ${h.eta}
            </li>
          `).join('')}
        </ul>
        
        <p style="margin-top: 20px; color: #999;">
          This is an automated alert from the Emergency Response System.
        </p>
      `
    };

    for (const hospital of hospitalEmails) {
      const hospitalContactEmail = process.env.HOSPITAL_NOTIFICATION_EMAIL || process.env.EMAIL_USER;
      if (hospitalContactEmail) {
        try {
          await mailer.sendMail({
            ...mailOptions,
            to: hospitalContactEmail,
            subject: `${mailOptions.subject} - ${hospital.name}`
          });
          console.log(`[EMAIL] Hospital notification sent to ${hospital.name}`);
        } catch (error) {
          console.error(`[EMAIL ERROR] Failed to send hospital notification for ${hospital.name}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send hospital notifications:', error.message);
  }
};

export const getEmailServiceStatus = () => {
  const configured = !!process.env.EMAIL_USER && !!process.env.EMAIL_PASSWORD;
  return {
    configured,
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: configured ? process.env.EMAIL_USER : 'Not configured',
    notificationsEnabled: {
      emergencyContacts: true,
      hospitals: !!process.env.HOSPITAL_NOTIFICATION_EMAIL || configured
    }
  };
};
