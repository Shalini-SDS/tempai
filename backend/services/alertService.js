import EmergencyAlert from '../models/EmergencyAlert.js';
import EmergencyContact from '../models/EmergencyContact.js';
import { sendEmergencyAlertEmail } from './emailService.js';

const THRESHOLDS = {
  HIGH_TEMPERATURE: 40,
  LOW_OXYGEN: 92,
  HIGH_HEART_RATE: 140,
  HIGH_BP_SYSTOLIC: 180,
  HIGH_BP_DIASTOLIC: 120,
  LOW_BP_SYSTOLIC: 90,
  LOW_BP_DIASTOLIC: 60,
  RESPIRATORY_LOW: 8,
  RESPIRATORY_HIGH: 30
};

export const checkAbnormalVitals = (vitals) => {
  const abnormalities = [];

  if (vitals.temperature > THRESHOLDS.HIGH_TEMPERATURE) {
    abnormalities.push('HIGH_TEMPERATURE');
  }

  if (vitals.oxygenLevel < THRESHOLDS.LOW_OXYGEN) {
    abnormalities.push('LOW_OXYGEN');
  }

  if (vitals.heartRate > THRESHOLDS.HIGH_HEART_RATE) {
    abnormalities.push('HIGH_HEART_RATE');
  }

  if (vitals.bloodPressure.systolic > THRESHOLDS.HIGH_BP_SYSTOLIC) {
    abnormalities.push('HIGH_BP');
  }

  if (vitals.bloodPressure.systolic < THRESHOLDS.LOW_BP_SYSTOLIC) {
    abnormalities.push('LOW_BP');
  }

  if (vitals.respiratoryRate < THRESHOLDS.RESPIRATORY_LOW || vitals.respiratoryRate > THRESHOLDS.RESPIRATORY_HIGH) {
    abnormalities.push('RESPIRATORY_ABNORMAL');
  }

  return abnormalities;
};

export const determineSeverity = (abnormalities) => {
  const criticalAbnormalities = ['LOW_OXYGEN', 'HIGH_TEMPERATURE'];
  const hasCritical = abnormalities.some(a => criticalAbnormalities.includes(a));

  if (hasCritical) {
    return 'CRITICAL';
  }

  return abnormalities.length > 1 ? 'ALERT' : 'WARNING';
};

const mapAbnormalityToAlertType = (abnormality) => {
  const typeMap = {
    HIGH_TEMPERATURE: 'HIGH_TEMPERATURE',
    LOW_OXYGEN: 'LOW_OXYGEN',
    HIGH_HEART_RATE: 'HIGH_HEART_RATE',
    RESPIRATORY_ABNORMAL: 'RESPIRATORY_ABNORMAL',
    HIGH_BP: 'CRITICAL',
    LOW_BP: 'CRITICAL'
  };
  return typeMap[abnormality] || 'CRITICAL';
};

export const triggerAlert = async (userId, abnormalities, vitalDetails) => {
  try {
    const severity = determineSeverity(abnormalities);

    for (const abnormality of abnormalities) {
      const alertType = mapAbnormalityToAlertType(abnormality);

      const alert = new EmergencyAlert({
        userId,
        alertType,
        severity,
        vitalDetails: {
          heartRate: vitalDetails.heartRate,
          bloodPressure: vitalDetails.bloodPressure,
          oxygenLevel: vitalDetails.oxygenLevel,
          temperature: vitalDetails.temperature,
          respiratoryRate: vitalDetails.respiratoryRate
        },
        status: 'ACTIVE'
      });

      await alert.save();

      console.log(`[ALERT] ${severity} alert triggered for user ${userId}: ${alertType}`);

      await notifyEmergencyContacts(userId, alert);
    }
  } catch (error) {
    console.error('Error triggering alert:', error);
  }
};

const notifyEmergencyContacts = async (userId, alert) => {
  try {
    const emergencyContacts = await EmergencyContact.findOne({ userId });

    if (!emergencyContacts) {
      console.warn(`No emergency contacts found for user ${userId}`);
      return;
    }

    const notifications = [];

    if (emergencyContacts.familyDoctor && emergencyContacts.familyDoctor.email) {
      notifications.push({
        email: emergencyContacts.familyDoctor.email,
        name: emergencyContacts.familyDoctor.name,
        phone: emergencyContacts.familyDoctor.phone,
        type: 'FAMILY_DOCTOR'
      });
    }

    if (emergencyContacts.emergencyContact && emergencyContacts.emergencyContact.length > 0) {
      const sortedContacts = emergencyContacts.emergencyContact.sort((a, b) => a.priority - b.priority);
      notifications.push(
        ...sortedContacts.slice(0, 2).filter(c => c.email).map(contact => ({
          email: contact.email,
          name: contact.name,
          phone: contact.phone,
          type: 'EMERGENCY_CONTACT'
        }))
      );
    }

    for (const notification of notifications) {
      const emailSent = await sendEmergencyAlertEmail(
        notification.email,
        notification.name,
        alert,
        'Patient'
      );

      alert.notificationsSent.push({
        method: 'EMAIL',
        sentAt: new Date(),
        status: emailSent ? 'SENT' : 'FAILED',
        recipient: notification.email
      });
    }

    await alert.save();

    console.log(`Notifications sent for alert: ${alert._id}`);
  } catch (error) {
    console.error('Error notifying emergency contacts:', error);
  }
};

export const acknowledgeAlert = async (alertId, acknowledgedBy) => {
  try {
    const alert = await EmergencyAlert.findByIdAndUpdate(
      alertId,
      {
        status: 'ACKNOWLEDGED',
        acknowledgedBy,
        acknowledgedAt: new Date()
      },
      { new: true }
    );

    return alert;
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    throw error;
  }
};

export const resolveAlert = async (alertId) => {
  try {
    const alert = await EmergencyAlert.findByIdAndUpdate(
      alertId,
      {
        status: 'RESOLVED',
        resolvedAt: new Date()
      },
      { new: true }
    );

    return alert;
  } catch (error) {
    console.error('Error resolving alert:', error);
    throw error;
  }
};

export const getActiveAlerts = async (userId) => {
  try {
    const alerts = await EmergencyAlert.find({
      userId,
      status: { $in: ['ACTIVE', 'ACKNOWLEDGED'] }
    }).sort({ triggeredAt: -1 });

    return alerts;
  } catch (error) {
    console.error('Error fetching active alerts:', error);
    throw error;
  }
};
