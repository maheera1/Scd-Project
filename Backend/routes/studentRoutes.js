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
// Route to get student details by studentId
// Route to get student details by studentId
router.get('/students/:studentId', async (req, res) => {
  const { studentId } = req.params; // Get the studentId from the URL

  try {
    // Find the student by the provided studentId
    const student = await Student.findById(studentId).populate('groupId', 'name description'); // Populate groupId to get group details

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Remove duplicates from the groupId array by filtering based on _id
    const uniqueGroups = [
      ...new Map(student.groupId.map(group => [group._id.toString(), group])).values(),
    ];

    // Modify the student object to use the unique groups
    student.groupId = uniqueGroups;

    // Send the student details as the response
    res.status(200).json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/resources', protect, async (req, res) => {
  try {
    // Find the student from the JWT token
    const student = await Student.findById(req.student._id);
    console.log('Student from JWT:', student); // Debug: Log student information
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find all groups the student is a member of
    const groups = await Group.find({ _id: { $in: student.groupId } }).populate('members');
    console.log('Groups the student is a member of:', groups); // Debug: Log groups found for the student
    
    if (!groups.length) {
      return res.status(404).json({ message: 'No groups found for this student' });
    }

    // Collect all resources across the student's groups
    const resources = groups.flatMap(group => 
      group.resources.map(resource => ({
        resourceId: resource.resourceId,
        type: resource.type,
        url: resource.url,
        filePath: resource.filePath,
        description: resource.description,
        groupName: group.name, // Add the group name for context
        groupId: group._id     // Add the group ID for reference
      }))
    );

    console.log('All resources found:', resources); // Debug: Log all resources found across groups
    
    if (!resources.length) {
      return res.status(404).json({ message: 'No resources found for your groups' });
    }

    res.status(200).json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error); // Log full error details
    res.status(500).json({ message: 'Error fetching resources' });
  }
});

module.exports = router;
