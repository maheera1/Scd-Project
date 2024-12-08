const express = require('express');
const Group = require('../models/Group');
const Student = require('../models/Student');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups' });
  }
});


router.get('/:groupId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching group' });
  }
});


router.post('/:groupId/join', protect, async (req, res) => {
  try {
   
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const student = await Student.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.groupId.includes(group._id)) {
      return res.status(400).json({ message: 'You are already part of this group' });
    }

    
    student.groupId.push(group._id);
    await student.save();
    group.members.push(student._id);
    await group.save();

    res.status(200).json({ message: 'Joined group successfully', student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error joining group', error: error.message });
  }
});



router.get('/:groupId/resources/:resourceId/download', protect, async (req, res) => {
  try {

    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const student = await Student.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.groupId.includes(group._id)) {
      return res.status(403).json({ message: 'You must join the group before downloading resources' });
    }

    const resourceId = new mongoose.Types.ObjectId(req.params.resourceId);  

    const resource = group.resources.find(r => r.resourceId.toString() === resourceId.toString());
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.type === 'pdf') {
      const filePath = path.join(__dirname, '..', resource.filePath); 
      if (fs.existsSync(filePath)) {
        return res.download(filePath);
      } else {
        return res.status(404).json({ message: 'File not found' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid resource type for download' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error downloading resource' });
  }
});


router.post('/:groupId/discussions', protect, async (req, res) => {
  try {
    
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      console.error(`Group not found: ${req.params.groupId}`);
      return res.status(404).json({ message: 'Group not found' });
    }


    const student = await Student.findById(req.student._id);  
    if (!student) {
      console.error(`Student not found: ${req.student._id}`);
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.groupId.includes(group._id)) {
      console.error(`Student ${req.student._id} has not joined group ${group._id}`);
      return res.status(403).json({ message: 'You must join the group before creating a discussion' });
    }

    const { title, body } = req.body;

    if (!title || !body) {
      console.error("Title or body is missing");
      return res.status(400).json({ message: 'Title and body are required' });
    }

    const newDiscussion = {
      title,
      body,
      createdBy: req.student._id,
    };

    group.discussions.push(newDiscussion);
    await group.save();

    res.status(201).json(newDiscussion);
  } catch (error) {
    console.error('Error creating discussion:', error); // Log the full error
    res.status(500).json({ message: 'Error creating discussion' });
  }
});

router.get('/:groupId/discussions', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.status(200).json(group.discussions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching discussions' });
  }
});

router.post('/:groupId/discussions/:discussionId/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text for the comment is required' });
    }

    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const student = await Student.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.groupId.includes(group._id)) {
      return res.status(403).json({ message: 'You must join the group before commenting on discussions' });
    }

    const discussion = group.discussions.id(req.params.discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    discussion.comments.push({
      studentId: req.student._id,
      comment: text,
    });

    await group.save();

  
    res.status(201).json(discussion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});


router.get('/:groupId/discussions/:discussionId/comments', protect, async (req, res) => {
  try {
    // Find the group by ID
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    
    const student = await Student.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

  
    if (!student.groupId.includes(group._id)) {
      return res.status(403).json({ message: 'You must join the group before viewing comments' });
    }

   
    const discussion = group.discussions.id(req.params.discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    
    res.status(200).json(discussion.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});


router.get('/:groupId/resources', protect, async (req, res) => {
  try {
    
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }


    const student = await Student.findById(req.student._id); 
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    if (!student.groupId.includes(group._id)) {
      return res.status(403).json({ message: 'You must join the group before accessing resources' });
    }

    res.status(200).json(group.resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching resources' });
  }
});




module.exports = router;
