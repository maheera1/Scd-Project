const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String },
  resources: [
    {
      resourceId: { 
        type: mongoose.Schema.Types.ObjectId, 
        default: () => new mongoose.Types.ObjectId()  
      },
      type: { 
        type: String, 
        required: true, 
        enum: ['pdf', 'link', 'note']  
      },
      url: { type: String },  
      filePath: { type: String },  
      description: { type: String },  
      _id: false,
      done: { type: Boolean, default: false }
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
    }
  ],
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'  
    }
  ]
});

module.exports = mongoose.model('Group', groupSchema);
