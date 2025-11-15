import EmergencyContact from '../models/EmergencyContact.js';
import EmergencyAlert from '../models/EmergencyAlert.js';
import { sendTestEmail, getEmailServiceStatus } from '../services/emailService.js';
import { triggerAlert, acknowledgeAlert, resolveAlert, getActiveAlerts } from '../services/alertService.js';

export const getEmergencyContacts = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const contacts = await EmergencyContact.findOne({ userId });

    if (!contacts) {
      return res.status(404).json({ error: 'No emergency contacts found' });
    }

    res.status(200).json({
      success: true,
      data: contacts
    });
  } catch (error) {
    next(error);
  }
};

export const addOrUpdateEmergencyContacts = async (req, res, next) => {
  try {
    const { userId, emergencyServices, familyDoctor, emergencyContact, medicalHistory } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    let contacts = await EmergencyContact.findOne({ userId });

    if (!contacts) {
      contacts = new EmergencyContact({
        userId,
        emergencyServices: emergencyServices || [],
        familyDoctor,
        emergencyContact: emergencyContact || [],
        medicalHistory
      });
    } else {
      if (emergencyServices) contacts.emergencyServices = emergencyServices;
      if (familyDoctor) contacts.familyDoctor = familyDoctor;
      if (emergencyContact) contacts.emergencyContact = emergencyContact;
      if (medicalHistory) contacts.medicalHistory = medicalHistory;
    }

    await contacts.save();

    res.status(201).json({
      success: true,
      message: 'Emergency contacts saved successfully',
      data: contacts
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEmergencyContact = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Contact ID is required' });
    }

    const contact = await EmergencyContact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Emergency contact deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateSpecificContact = async (req, res, next) => {
  try {
    const { userId, contactType, contactData } = req.body;

    if (!userId || !contactType) {
      return res.status(400).json({ error: 'userId and contactType are required' });
    }

    let updateData = {};
    if (contactType === 'familyDoctor') {
      updateData.familyDoctor = contactData;
    } else if (contactType === 'emergencyServices') {
      updateData.emergencyServices = contactData;
    } else if (contactType === 'emergencyContact') {
      updateData.emergencyContact = contactData;
    } else {
      return res.status(400).json({ error: 'Invalid contactType' });
    }

    const contacts = await EmergencyContact.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!contacts) {
      return res.status(404).json({ error: 'Emergency contacts not found' });
    }

    res.status(200).json({
      success: true,
      message: `${contactType} updated successfully`,
      data: contacts
    });
  } catch (error) {
    next(error);
  }
};

export const getEmailServiceStatus = async (req, res, next) => {
  try {
    const status = getEmailServiceStatus();
    res.status(200).json({
      success: true,
      emailService: status
    });
  } catch (error) {
    next(error);
  }
};

export const sendTestEmailController = async (req, res, next) => {
  try {
    const { recipientEmail } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({ error: 'recipientEmail is required' });
    }

    const result = await sendTestEmail(recipientEmail);

    res.status(result.success ? 200 : 500).json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

export const createEmergencyAlert = async (req, res, next) => {
  try {
    const { userId, alertType, severity, vitalDetails, notes, lat, lng, radius } = req.body;

    if (!userId || !alertType || !severity) {
      return res.status(400).json({
        error: 'userId, alertType, and severity are required'
      });
    }

    const validAlertTypes = ['HIGH_TEMPERATURE', 'LOW_OXYGEN', 'HIGH_HEART_RATE', 'RESPIRATORY_ABNORMAL', 'CRITICAL'];
    const validSeverities = ['WARNING', 'ALERT', 'CRITICAL'];

    if (!validAlertTypes.includes(alertType)) {
      return res.status(400).json({
        error: `Invalid alertType. Must be one of: ${validAlertTypes.join(', ')}`
      });
    }

    if (!validSeverities.includes(severity)) {
      return res.status(400).json({
        error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}`
      });
    }

    const alert = new EmergencyAlert({
      userId,
      alertType,
      severity,
      vitalDetails: vitalDetails || {},
      status: 'ACTIVE',
      notes
    });

    await alert.save();

    const emergencyContacts = await EmergencyContact.findOne({ userId });

    if (emergencyContacts) {
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
        const { sendEmergencyAlertEmail } = await import('../services/emailService.js');
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
    }

    if (lat && lng && severity === 'CRITICAL') {
      try {
        const { sendNearbyHospitalNotification } = await import('../services/emailService.js');
        const axios = (await import('axios')).default;

        const radiusKm = (radius || 5000) / 1000;
        const overpassQuery = `
          [bbox:${parseFloat(lng) - (radiusKm / 111)},${parseFloat(lat) - (radiusKm / 111)},${parseFloat(lng) + (radiusKm / 111)},${parseFloat(lat) + (radiusKm / 111)}];
          (
            node["amenity"="hospital"];
            way["amenity"="hospital"];
            relation["amenity"="hospital"];
          );
          out center;
        `;

        const response = await axios.post('https://overpass-api.de/api/interpreter', overpassQuery, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (response.data.elements && response.data.elements.length > 0) {
          const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371;
            const dLat = ((lat2 - lat1) * Math.PI) / 180;
            const dLon = ((lon2 - lon1) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;
            return distance.toFixed(2);
          };

          const estimateETA = (distanceKm) => {
            const avgSpeed = 40;
            const minutes = Math.round((distanceKm / avgSpeed) * 60);
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
          };

          const hospitals = response.data.elements
            .filter(el => el.center || (el.lat && el.lon))
            .map((hospital) => {
              const hospitalLat = hospital.center?.lat || hospital.lat;
              const hospitalLon = hospital.center?.lon || hospital.lon;
              const distance = calculateDistance(parseFloat(lat), parseFloat(lng), hospitalLat, hospitalLon);

              return {
                name: hospital.tags?.name || 'Unknown Hospital',
                address: hospital.tags?.['addr:street']
                  ? `${hospital.tags['addr:street']}, ${hospital.tags['addr:city'] || ''}`
                  : 'Address not available',
                distance: `${distance} km`,
                eta: estimateETA(distance),
                phone: hospital.tags?.['contact:phone'] || 'N/A'
              };
            })
            .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
            .slice(0, 3);

          await sendNearbyHospitalNotification(hospitals, alert, { lat: parseFloat(lat), lng: parseFloat(lng) });
        }
      } catch (hospitalError) {
        console.error('Error fetching nearby hospitals for notification:', hospitalError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Emergency alert created and notifications sent',
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

export const getEmergencyAlerts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    let query = { userId };
    if (status) {
      query.status = status;
    }

    const alerts = await EmergencyAlert.find(query).sort({ triggeredAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

export const acknowledgeEmergencyAlert = async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const { acknowledgedBy } = req.body;

    if (!alertId) {
      return res.status(400).json({ error: 'alertId is required' });
    }

    const alert = await EmergencyAlert.findByIdAndUpdate(
      alertId,
      {
        status: 'ACKNOWLEDGED',
        acknowledgedBy,
        acknowledgedAt: new Date()
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Alert acknowledged',
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

export const resolveEmergencyAlert = async (req, res, next) => {
  try {
    const { alertId } = req.params;

    if (!alertId) {
      return res.status(400).json({ error: 'alertId is required' });
    }

    const alert = await EmergencyAlert.findByIdAndUpdate(
      alertId,
      {
        status: 'RESOLVED',
        resolvedAt: new Date()
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Alert resolved',
      data: alert
    });
  } catch (error) {
    next(error);
  }
};
