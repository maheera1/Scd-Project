const express = require('express');
const Group = require('../models/Group');
const Student = require('../models/Student');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all groups 
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups' });
  }
});

// Get a specific group by ID 
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

// Join a group 
router.post('/:groupId/join', protect, async (req, res) => {
  try {
    // Retrieve the group by ID
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Find the student from the JWT token
    const student = await Student.findById(req.student._id);  // Using the student ID from the decoded token
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if the group is already in the student's groupId field
    if (student.groupId.includes(group._id)) {
      return res.status(400).json({ message: 'You are already part of this group' });
    }

    // Add the group to the student's groupId field
    student.groupId.push(group._id);
    await student.save();

    // Add the student to the group's members field
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

    // Find the resource by ID
    const resource = group.resources.id(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.type === 'pdf') {
      // For PDF or files, send the file from the server
      const filePath = path.join(__dirname, '..', resource.filePath);
      console.log(filePath);
      if (fs.existsSync(filePath)) {
        res.download(filePath);
      } else {
        return res.status(404).json({ message: 'File not found' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid resource type for download' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error downloading resource' });
  }
});

// Create a discussion within a group
router.post('/:groupId/discussions', protect, async (req, res) => {
  try {
    // Retrieve the group by ID
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      console.error(`Group not found: ${req.params.groupId}`);
      return res.status(404).json({ message: 'Group not found' });
    }

    // Find the student from the JWT token
    const student = await Student.findById(req.student._id);  // Using the student ID from the decoded token
    if (!student) {
      console.error(`Student not found: ${req.student._id}`);
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if the student has joined the group
    if (!student.groupId.includes(group._id)) {
      console.error(`Student ${req.student._id} has not joined group ${group._id}`);
      return res.status(403).json({ message: 'You must join the group before creating a discussion' });
    }

    // Extract title and body from the request body
    const { title, body } = req.body;

    if (!title || !body) {
      console.error("Title or body is missing");
      return res.status(400).json({ message: 'Title and body are required' });
    }

    // Create the new discussion
    const newDiscussion = {
      title,
      body,
      createdBy: req.student._id,
    };

    // Add the discussion to the group's discussions array
    group.discussions.push(newDiscussion);
    await group.save();

    res.status(201).json(newDiscussion);
  } catch (error) {
    console.error('Error creating discussion:', error); // Log the full error
    res.status(500).json({ message: 'Error creating discussion' });
  }
});

// Get discussions in a group
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

// Post a comment on a discussion
router.post('/:groupId/discussions/:discussionId/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text for the comment is required' });
    }

    // Find the group by ID
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if the student has joined the group
    const student = await Student.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.groupId.includes(group._id)) {
      return res.status(403).json({ message: 'You must join the group before commenting on discussions' });
    }

    // Find the discussion within the group
    const discussion = group.discussions.id(req.params.discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Add the comment to the discussion
    discussion.comments.push({
      studentId: req.student._id,
      comment: text,
    });

    await group.save();

    // Return the updated discussion
    res.status(201).json(discussion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});



// Get all comments for a specific discussion in a group
router.get('/:groupId/discussions/:discussionId/comments', protect, async (req, res) => {
  try {
    // Find the group by ID
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Find the student from the JWT token
    const student = await Student.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if the student has joined the group
    if (!student.groupId.includes(group._id)) {
      return res.status(403).json({ message: 'You must join the group before viewing comments' });
    }

    // Find the discussion within the group
    const discussion = group.discussions.id(req.params.discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Return all the comments of the discussion
    res.status(200).json(discussion.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});


module.exports = router;
