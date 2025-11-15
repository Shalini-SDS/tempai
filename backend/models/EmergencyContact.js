import mongoose from 'mongoose';

const emergencyContactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    emergencyServices: [
      {
        name: {
          type: String,
          enum: ['Police', 'Ambulance', 'Fire', 'Hospital'],
          required: true
        },
        phone: {
          type: String,
          required: true,
          match: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
        },
        available24x7: {
          type: Boolean,
          default: true
        }
      }
    ],
    familyDoctor: {
      name: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true,
        match: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
      },
      email: {
        type: String,
        lowercase: true
      },
      specialization: String,
      hospital: String
    },
    emergencyContact: [
      {
        name: {
          type: String,
          required: true
        },
        relationship: {
          type: String,
          enum: ['Parent', 'Spouse', 'Child', 'Sibling', 'Friend', 'Other'],
          required: true
        },
        phone: {
          type: String,
          required: true,
          match: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
        },
        email: {
          type: String,
          lowercase: true
        },
        priority: {
          type: Number,
          default: 1
        }
      }
    ],
    medicalHistory: {
      allergies: [String],
      chronicDiseases: [String],
      medications: [String],
      bloodType: {
        type: String,
        enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('EmergencyContact', emergencyContactSchema);
