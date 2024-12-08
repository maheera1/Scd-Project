const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  groupId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  bookmarks: [
    {
      groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
      resourceIndex: { type: Number, required: false }, 
      discussionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discussion',
      },
    }
  ],
  notes: [
    {
      title: { type: String, required: true },
      content: { type: String, required: true },
      tags: [String], 
      createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student', 
        required: true
      },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    }
  ],
  doneResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }] 
});


studentSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});


studentSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
