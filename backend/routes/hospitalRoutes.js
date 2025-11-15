import express from 'express';
import {
  getNearbyHospitals,
  getHospitalDetails,
  getNearbyAmbulances
} from '../controllers/hospitalsController.js';

const router = express.Router();

router.get('/nearby', getNearbyHospitals);

router.get('/details', getHospitalDetails);

router.get('/ambulances/nearby', getNearbyAmbulances);

export default router;
