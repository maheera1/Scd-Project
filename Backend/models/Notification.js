// models/Notification.js
const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['study-session', 'deadline', 'group-activity', 'zoom-meeting'],
    },
    link: {
      type: String, 
      required: false, 
    },
    sentBy: {
        type: String,
        required: true,
    },
    studentAcknowledged: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
