import mongoose from 'mongoose';

const emergencyAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    alertType: {
      type: String,
      enum: ['HIGH_TEMPERATURE', 'LOW_OXYGEN', 'HIGH_HEART_RATE', 'RESPIRATORY_ABNORMAL', 'CRITICAL'],
      required: true
    },
    severity: {
      type: String,
      enum: ['WARNING', 'ALERT', 'CRITICAL'],
      default: 'ALERT'
    },
    vitalDetails: {
      heartRate: Number,
      bloodPressure: {
        systolic: Number,
        diastolic: Number
      },
      oxygenLevel: Number,
      temperature: Number,
      respiratoryRate: Number
    },
    triggeredAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    resolvedAt: Date,
    status: {
      type: String,
      enum: ['ACTIVE', 'RESOLVED', 'ACKNOWLEDGED'],
      default: 'ACTIVE'
    },
    notificationsSent: [
      {
        contactId: mongoose.Schema.Types.ObjectId,
        method: {
          type: String,
          enum: ['SMS', 'CALL', 'EMAIL', 'PUSH']
        },
        sentAt: Date,
        status: {
          type: String,
          enum: ['SENT', 'FAILED', 'DELIVERED']
        }
      }
    ],
    acknowledgedBy: mongoose.Schema.Types.ObjectId,
    acknowledgedAt: Date,
    notes: String
  },
  { timestamps: true }
);

export default mongoose.model('EmergencyAlert', emergencyAlertSchema);
