import express from 'express';
import {
  getEmergencyContacts,
  addOrUpdateEmergencyContacts,
  deleteEmergencyContact,
  updateSpecificContact,
  getEmailServiceStatus,
  sendTestEmailController,
  createEmergencyAlert,
  getEmergencyAlerts,
  acknowledgeEmergencyAlert,
  resolveEmergencyAlert
} from '../controllers/emergencyController.js';

const router = express.Router();

router.get('/contacts/:userId', getEmergencyContacts);

router.post('/contacts', addOrUpdateEmergencyContacts);

router.delete('/contacts/:id', deleteEmergencyContact);

router.put('/contacts/update-specific', updateSpecificContact);

router.get('/email/status', getEmailServiceStatus);

router.post('/email/test', sendTestEmailController);

router.post('/alerts/create', createEmergencyAlert);

router.get('/alerts/:userId', getEmergencyAlerts);

router.put('/alerts/:alertId/acknowledge', acknowledgeEmergencyAlert);

router.put('/alerts/:alertId/resolve', resolveEmergencyAlert);

export default router;
