import mongoose from 'mongoose';

const vitalsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    deviceId: {
      type: String,
      required: true
    },
    heartRate: {
      value: {
        type: Number,
        required: true,
        min: 0,
        max: 300
      },
      unit: {
        type: String,
        default: 'bpm'
      },
      isAbnormal: Boolean
    },
    bloodPressure: {
      systolic: {
        type: Number,
        required: true,
        min: 0,
        max: 300
      },
      diastolic: {
        type: Number,
        required: true,
        min: 0,
        max: 200
      },
      unit: {
        type: String,
        default: 'mmHg'
      },
      isAbnormal: Boolean
    },
    oxygenLevel: {
      value: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      unit: {
        type: String,
        default: '%'
      },
      isAbnormal: Boolean
    },
    respiratoryRate: {
      value: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      unit: {
        type: String,
        default: 'breaths/min'
      },
      isAbnormal: Boolean
    },
    temperature: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        default: '°C'
      },
      isAbnormal: Boolean
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    notes: String
  },
  { timestamps: true }
);

vitalsSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model('Vitals', vitalsSchema);
