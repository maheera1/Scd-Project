const mongoose = require('mongoose');
const Notification = require('./models/Notification');
require('dotenv').config();
const seedNotifications = async () => {
  try {
   
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });


    const notifications = [
      {
        title: 'Study Session Reminder',
        message: 'Don’t forget the study session on React tomorrow at 10 AM.',
        type: 'study-session',
        sentBy: 'hamna',
        link: '',
      },
      {
        title: 'Deadline for Assignment',
        message: 'The deadline for the React assignment is next Friday.',
        type: 'deadline',
        sentBy: 'hamna',
        link: '',
      },
      {
        title: 'Group Activity Reminder',
        message: 'Please submit your group activity reports by Wednesday.',
        type: 'group-activity',
        sentBy: 'maheera',
        link: '',
      },
      {
        title: 'Zoom Meeting Invitation',
        message: 'Join the Zoom meeting using the link below.',
        type: 'zoom-meeting',
        sentBy: 'hamna',
        link: 'https://zoom.us/j/123456789',
      },
    ];

   
    await Notification.insertMany(notifications);
    console.log('Mock notifications seeded successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding notifications:', err);
    mongoose.connection.close();
  }
};

seedNotifications();
