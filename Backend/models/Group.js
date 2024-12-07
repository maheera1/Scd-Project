const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String },
  resources: [
    {
      resourceId: { type: mongoose.Schema.Types.ObjectId, default: mongoose.Types.ObjectId },  // Unique ID for the resource within the group
      type: { type: String, required: true, enum: ['pdf', 'link', 'note'] },  // Define resource type (PDF, link, note)
      url: { type: String },  // URL for links (e.g., external links)
      filePath: { type: String },  // Path for PDF or note files (if uploaded locally)
      description: { type: String },  // Optional description for the resource
      _id: false
    }
  ],
  discussions: [
    {
      title: { type: String },
      body: { type: String },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      createdAt: { type: Date, default: Date.now },
      comments: [
        {
          studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
          comment: { type: String },
          createdAt: { type: Date, default: Date.now },
        }
      ]
    },],
    members: [  // New field to store members of the group
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student'  // Referencing the Student model
        }
      ]
  
});

module.exports = mongoose.model('Group', groupSchema);
