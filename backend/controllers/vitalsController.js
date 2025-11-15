import Vitals from '../models/Vitals.js';
import EmergencyAlert from '../models/EmergencyAlert.js';
import { checkAbnormalVitals, triggerAlert } from '../services/alertService.js';

export const updateVitals = async (req, res, next) => {
  try {
    const {
      userId,
      deviceId,
      heartRate,
      bloodPressure,
      oxygenLevel,
      respiratoryRate,
      temperature,
      notes
    } = req.body;

    if (!userId || !deviceId) {
      return res.status(400).json({ error: 'userId and deviceId are required' });
    }

    if (!heartRate || !bloodPressure || !oxygenLevel || !respiratoryRate || !temperature) {
      return res.status(400).json({ error: 'All vital parameters are required' });
    }

    const vitalRecord = new Vitals({
      userId,
      deviceId,
      heartRate: {
        value: heartRate.value || heartRate,
        unit: heartRate.unit || 'bpm'
      },
      bloodPressure: {
        systolic: bloodPressure.systolic,
        diastolic: bloodPressure.diastolic,
        unit: bloodPressure.unit || 'mmHg'
      },
      oxygenLevel: {
        value: oxygenLevel.value || oxygenLevel,
        unit: oxygenLevel.unit || '%'
      },
      respiratoryRate: {
        value: respiratoryRate.value || respiratoryRate,
        unit: respiratoryRate.unit || 'breaths/min'
      },
      temperature: {
        value: temperature.value || temperature,
        unit: temperature.unit || '°C'
      },
      notes
    });

    const abnormalities = checkAbnormalVitals({
      heartRate: heartRate.value || heartRate,
      bloodPressure: { systolic: bloodPressure.systolic, diastolic: bloodPressure.diastolic },
      oxygenLevel: oxygenLevel.value || oxygenLevel,
      respiratoryRate: respiratoryRate.value || respiratoryRate,
      temperature: temperature.value || temperature
    });

    if (abnormalities.length > 0) {
      vitalRecord.heartRate.isAbnormal = abnormalities.includes('HIGH_HEART_RATE');
      vitalRecord.bloodPressure.isAbnormal = abnormalities.includes('HIGH_BP') || abnormalities.includes('LOW_BP');
      vitalRecord.oxygenLevel.isAbnormal = abnormalities.includes('LOW_OXYGEN');
      vitalRecord.respiratoryRate.isAbnormal = abnormalities.includes('RESPIRATORY_ABNORMAL');
      vitalRecord.temperature.isAbnormal = abnormalities.includes('HIGH_TEMPERATURE');

      await triggerAlert(userId, abnormalities, {
        heartRate: heartRate.value || heartRate,
        bloodPressure,
        oxygenLevel: oxygenLevel.value || oxygenLevel,
        respiratoryRate: respiratoryRate.value || respiratoryRate,
        temperature: temperature.value || temperature
      });
    }

    await vitalRecord.save();

    res.status(201).json({
      success: true,
      message: 'Vitals recorded successfully',
      data: vitalRecord,
      abnormalities: abnormalities.length > 0 ? abnormalities : null
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestVitals = async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const latestVital = await Vitals.findOne({ userId }).sort({ timestamp: -1 });

    if (!latestVital) {
      return res.status(404).json({ error: 'No vitals found for this user' });
    }

    res.status(200).json({
      success: true,
      data: latestVital
    });
  } catch (error) {
    next(error);
  }
};

export const getVitalsHistory = async (req, res, next) => {
  try {
    const { userId, limit = 20, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const vitals = await Vitals.find({ userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Vitals.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: vitals,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getVitalsStats = async (req, res, next) => {
  try {
    const { userId, hours = 24 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const timeAgo = new Date(Date.now() - hours * 60 * 60 * 1000);

    const vitals = await Vitals.find({
      userId,
      timestamp: { $gte: timeAgo }
    }).sort({ timestamp: -1 });

    if (vitals.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No vitals data available for the specified period',
        data: null
      });
    }

    const stats = {
      heartRate: {
        current: vitals[0].heartRate.value,
        avg: (vitals.reduce((sum, v) => sum + v.heartRate.value, 0) / vitals.length).toFixed(2),
        min: Math.min(...vitals.map(v => v.heartRate.value)),
        max: Math.max(...vitals.map(v => v.heartRate.value))
      },
      oxygenLevel: {
        current: vitals[0].oxygenLevel.value,
        avg: (vitals.reduce((sum, v) => sum + v.oxygenLevel.value, 0) / vitals.length).toFixed(2),
        min: Math.min(...vitals.map(v => v.oxygenLevel.value)),
        max: Math.max(...vitals.map(v => v.oxygenLevel.value))
      },
      temperature: {
        current: vitals[0].temperature.value,
        avg: (vitals.reduce((sum, v) => sum + v.temperature.value, 0) / vitals.length).toFixed(2),
        min: Math.min(...vitals.map(v => v.temperature.value)),
        max: Math.max(...vitals.map(v => v.temperature.value))
      },
      bloodPressure: {
        current: `${vitals[0].bloodPressure.systolic}/${vitals[0].bloodPressure.diastolic}`,
        avgSystolic: (vitals.reduce((sum, v) => sum + v.bloodPressure.systolic, 0) / vitals.length).toFixed(2),
        avgDiastolic: (vitals.reduce((sum, v) => sum + v.bloodPressure.diastolic, 0) / vitals.length).toFixed(2)
      },
      respiratoryRate: {
        current: vitals[0].respiratoryRate.value,
        avg: (vitals.reduce((sum, v) => sum + v.respiratoryRate.value, 0) / vitals.length).toFixed(2),
        min: Math.min(...vitals.map(v => v.respiratoryRate.value)),
        max: Math.max(...vitals.map(v => v.respiratoryRate.value))
      },
      dataPoints: vitals.length,
      period: `${hours} hours`
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
