const mongoose = require('mongoose');
const Group = require('./models/Group');
require('dotenv').config();

const seedGroups = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const groups = [
      
      {
        name: 'Web engineering',
        code: 'WEB202',
        description: 'Discussion group for web developers',
        resources: [
          {
            resourceId: new mongoose.Types.ObjectId(),
            type: 'link',
            url: 'https://blog.hubspot.com/website/website-development',
          },
          {
            resourceId: new mongoose.Types.ObjectId(),
            type: 'pdf',
            filePath: '/uploads/web.pdf',
            description: 'Advanced web dev  Notes',
          }
        ],
      }
    ];

    for (const group of groups) {
      const existingGroup = await Group.findOne({ code: group.code });
      if (existingGroup) {
        console.log(`Group with code ${group.code} already exists. Skipping.`);
      } else {
        await Group.create(group);
        console.log(`Group ${group.name} added successfully!`);
      }
    }

    console.log('Group seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding groups:', error);
    process.exit(1);
  }
};

seedGroups();
