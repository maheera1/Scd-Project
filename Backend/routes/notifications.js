// routes/notifications.js
const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware'); // Import the protect middleware
const router = express.Router();

// Route to fetch all notifications for authenticated student (but notifications are for everyone)
router.get('/see', protect, async (req, res) => {
    try {
      // Fetch all notifications (no filtering by studentId)
      const notifications = await Notification.find().sort({ timestamp: -1 });

      if (!notifications || notifications.length === 0) {
        return res.status(404).json({ message: 'No notifications found' });
      }

      // Send the notifications to the authenticated student
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Error fetching notifications' });
    }
});

module.exports = router;
