const mongoose = require('mongoose');
const Group = require('./models/Group'); 
require('dotenv').config();

const seedGroups = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const groups = [
      {
        name: 'Advanced Math Group',  
        code: 'MATH1289',
        description: 'A group for advanced math discussions and resources',
        resources: [
          {
            resourceId: new mongoose.Types.ObjectId(),  
            type: 'link', 
            url: 'http://example.com/resource1',  
          },
          {
            resourceId: new mongoose.Types.ObjectId(),  
            type: 'pdf',  
            filePath: '/uploads/resource1.pdf',  
            description: 'Advanced Math Lecture Notes',
          }
        ],
      },
      {
        name: 'Physics Enthusiasts Club',  
        code: 'PHY456',
        description: 'A club for physics lovers and learners',
        resources: [
          {
            resourceId: new mongoose.Types.ObjectId(), 
            type: 'link',
            url: 'http://example.com/resource2',
          },
          {
            resourceId: new mongoose.Types.ObjectId(), 
            type: 'pdf',
            filePath: '/uploads/resource2.pdf',
            description: 'Physics Article for Enthusiasts',
          }
        ],
      },
      {
        name: 'Science Knowledge Hub',  
        code: 'SCI789',
        description: 'A hub for sharing and discussing science resources',
        resources: [
          {
            resourceId:new mongoose.Types.ObjectId(),  
            type: 'link',
            url: 'http://example.com/resource3',
          },
          {
            resourceId:new mongoose.Types.ObjectId(),  
            type: 'pdf',
            filePath: '/uploads/resource3.pdf',
            description: 'Comprehensive Science Study Material',
          }
        ],
      }
    ];

    
    await Group.insertMany(groups);  

    console.log('Groups seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding groups:', error);
    process.exit(1);
  }
};

seedGroups();
