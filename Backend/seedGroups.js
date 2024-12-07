const mongoose = require('mongoose');
const Group = require('./models/Group'); // Adjust path if the Group model is in a different directory
require('dotenv').config();

const seedGroups = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const groups = [
      {
        name: 'Advanced Math Group',  // Changed group name
        code: 'MATH1289',
        description: 'A group for advanced math discussions and resources',
        resources: [
          {
            resourceId: new mongoose.Types.ObjectId(),  // Unique ID for each resource
            type: 'link',  // Type of resource (link, pdf, note)
            url: 'http://example.com/resource1',  // Link to an online resource
          },
          {
            resourceId: new mongoose.Types.ObjectId(),  // Unique ID for each resource
            type: 'pdf',  // Type of resource (PDF)
            filePath: '/uploads/resource1.pdf',  // Local file path if the PDF is uploaded
            description: 'Advanced Math Lecture Notes',
          }
        ],
      },
      {
        name: 'Physics Enthusiasts Club',  // Changed group name
        code: 'PHY456',
        description: 'A club for physics lovers and learners',
        resources: [
          {
            resourceId: new mongoose.Types.ObjectId(),  // Unique ID for each resource
            type: 'link',
            url: 'http://example.com/resource2',
          },
          {
            resourceId: new mongoose.Types.ObjectId(),  // Unique ID for each resource
            type: 'pdf',
            filePath: '/uploads/resource2.pdf',
            description: 'Physics Article for Enthusiasts',
          }
        ],
      },
      {
        name: 'Science Knowledge Hub',  // Changed group name
        code: 'SCI789',
        description: 'A hub for sharing and discussing science resources',
        resources: [
          {
            resourceId:new mongoose.Types.ObjectId(),  // Unique ID for each resource
            type: 'link',
            url: 'http://example.com/resource3',
          },
          {
            resourceId:new mongoose.Types.ObjectId(),  // Unique ID for each resource
            type: 'pdf',
            filePath: '/uploads/resource3.pdf',
            description: 'Comprehensive Science Study Material',
          }
        ],
      }
    ];

    // Removed the deleteMany line to preserve existing groups
    await Group.insertMany(groups);  // Insert new groups with resources

    console.log('Groups seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding groups:', error);
    process.exit(1);
  }
};

seedGroups();
