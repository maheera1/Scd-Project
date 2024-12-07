const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Student = require('../models/Student');
const Group = require('../models/Group');
const router = express.Router();

// Protected route
router.get('/dashboard', protect, async (req, res) => {
  try {
    // Populate the groupId field with name and description from the Group model
    const student = await Student.findById(req.student._id).populate({
      path: 'groupId', // Reference the groupId field in the Student schema
      select: 'name description', // Specify which fields to include from Group
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(student); // Send the populated student data
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});


// Add a resource to bookmarks
router.post('/bookmark', protect, async (req, res) => {
  try {
    const { resourceId, groupId } = req.body;  // Get resourceId and groupId from the request body

    if (!resourceId || !groupId) {
      return res.status(400).json({ message: 'Resource ID and Group ID are required' });
    }

    // Find the student based on studentId (from the token)
    const student = await Student.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find the group by groupId
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Find the resource by resourceId within the group and get its index
    const resourceIndex = group.resources.findIndex(r => r.resourceId.toString() === resourceId.toString());

    if (resourceIndex === -1) {
      return res.status(404).json({ message: 'Resource not found in this group' });
    }

    // Add the resource to the student's bookmarks
    student.bookmarks.push({ groupId: group._id, resourceIndex });
    await student.save();

    res.status(200).json({ message: 'Resource bookmarked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Get all bookmarks for a student
router.get('/:studentId/bookmarks', async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await Student.findById(studentId).populate('bookmarks.groupId', 'name'); // Populate group name
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const bookmarks = student.bookmarks.map(bookmark => {
      const group = bookmark.groupId;
      const resource = group ? group.resources[bookmark.resourceIndex] : null;
      return resource ? { groupName: group.name, ...resource } : null;
    }).filter(Boolean); // Filter out invalid references

    res.status(200).json({ bookmarks });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Route to get joined groups
router.get('/joined', protect, async (req, res) => {
  try {
    // Fetch student and populate the joined groups
    const student = await Student.findById(req.student._id).populate('groupId', 'name description');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Ensure unique groups based on their _id
    const uniqueGroups = [
      ...new Map(student.groupId.map(group => [group._id.toString(), group])).values(),
    ];

    res.status(200).json({ groups: uniqueGroups });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching joined groups', error: error.message });
  }
});


module.exports = router;
