import express from 'express';
import {
  updateVitals,
  getLatestVitals,
  getVitalsHistory,
  getVitalsStats
} from '../controllers/vitalsController.js';

const router = express.Router();

router.post('/update', updateVitals);

router.get('/latest', getLatestVitals);

router.get('/history', getVitalsHistory);

router.get('/stats', getVitalsStats);

export default router;
