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
    const { resourceId, groupId } = req.body; // Get resourceId and groupId from the request body

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

    // Check if the resource is already bookmarked
    const alreadyBookmarked = student.bookmarks.some(
      (bookmark) => bookmark.groupId.toString() === groupId.toString() && bookmark.resourceIndex === resourceIndex
    );

    if (alreadyBookmarked) {
      return res.status(400).json({ message: 'Resource is already bookmarked' });
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


router.get('/bookmarks', protect, async (req, res) => {
  try {
    // Find the student using the ID from the JWT token
    const student = await Student.findById(req.student._id).populate({
      path: 'bookmarks.groupId', // Populate the groupId in bookmarks
      select: 'name description resources', // Fetch the group name, description, and resources
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Use a Set to track unique resources
    const uniqueBookmarks = new Set();

    // Format the bookmarks to include detailed resource information
    const formattedBookmarks = student.bookmarks
      .map(bookmark => {
        const group = bookmark.groupId;
        if (!group) return null;

        const resource = group.resources[bookmark.resourceIndex];
        if (!resource) return null;

        // Create a unique identifier for the bookmark (groupId + resourceId)
        const uniqueKey = `${group._id}-${resource.resourceId}`;
        if (uniqueBookmarks.has(uniqueKey)) {
          return null; // Skip duplicates
        }

        uniqueBookmarks.add(uniqueKey); // Add uniqueKey to the Set

        return {
          groupId: group._id,
          groupName: group.name,
          resource: {
            resourceId: resource.resourceId,
            type: resource.type,
            url: resource.url,
            filePath: resource.filePath,
            description: resource.description,
          },
        };
      })
      .filter(bookmark => bookmark !== null); // Filter out null entries

    res.status(200).json({ bookmarks: formattedBookmarks });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ message: 'Error fetching bookmarks' });
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
router.get('/progress', protect, async (req, res) => {
  try {
    // Fetch the student
    const student = await Student.findById(req.student._id).populate('groupId');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Count the discussions created by the student
    let discussionCount = 0;
    const groups = await Group.find({ _id: { $in: student.groupId } });
    groups.forEach(group => {
      group.discussions.forEach(discussion => {
        if (discussion.createdBy.toString() === req.student._id.toString()) {
          discussionCount++;
        }
      });
    });

    // Fetch all resources across the student's groups
    const allResources = [];
    groups.forEach(group => {
      group.resources.forEach(resource => {
        allResources.push({
          resourceId: resource.resourceId,
          type: resource.type,
          url: resource.url,
          filePath: resource.filePath,
          description: resource.description,
          groupName: group.name,
          groupId: group._id,
          done: student.doneResources.includes(resource.resourceId.toString()) // Check if the resource is marked as done
        });
      });
    });

    // Respond with the discussion count and resources
    res.status(200).json({
      discussionsCreated: discussionCount,
      resources: allResources,
      doneResourcesCount: student.doneResources.length // Count how many resources are marked as done
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching progress data' });
  }
});

// Route to mark a resource as done
router.post('/resources/:resourceId/done', protect, async (req, res) => {
  try {
    const { resourceId } = req.params;

    // Find the student
    const student = await Student.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if the resource is already marked as done
    if (student.doneResources.includes(resourceId)) {
      return res.status(400).json({ message: 'Resource already marked as done' });
    }

    // Add the resource to the doneResources array in the student schema
    student.doneResources.push(resourceId);
    await student.save();

    // Find the group that the resource belongs to and update its 'done' status
    const group = await Group.findOne({ 'resources.resourceId': resourceId });
    if (!group) {
      return res.status(404).json({ message: 'Group not found for this resource' });
    }

    // Update the resource's 'done' status in the Group schema
    await Group.updateOne(
      { 'resources.resourceId': resourceId },
      { $set: { 'resources.$.done': true } } // Mark this resource as done
    );

    res.status(200).json({ 
      message: 'Resource marked as done', 
      doneResourcesCount: student.doneResources.length 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error marking resource as done' });
  }
});
router.post('/resources/:resourceId/notdone', protect, async (req, res) => {
  try {
    const { resourceId } = req.params;

    // Find the student
    const student = await Student.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if the resource is not marked as done yet
    if (!student.doneResources.includes(resourceId)) {
      return res.status(400).json({ message: 'Resource not marked as done yet' });
    }

    // Remove the resource from the doneResources array in the student schema
    student.doneResources = student.doneResources.filter(id => id.toString() !== resourceId);
    await student.save();

    // Find the group that the resource belongs to and update its 'done' status to false
    const group = await Group.findOne({ 'resources.resourceId': resourceId });
    if (!group) {
      return res.status(404).json({ message: 'Group not found for this resource' });
    }

    // Update the resource's 'done' status in the Group schema to false
    await Group.updateOne(
      { 'resources.resourceId': resourceId },
      { $set: { 'resources.$.done': false } } // Mark this resource as not done
    );

    res.status(200).json({ 
      message: 'Resource marked as not done', 
      doneResourcesCount: student.doneResources.length 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error marking resource as not done' });
  }
});
router.get('/resources/:resourceId/status', protect, async (req, res) => {
  try {
    const { resourceId } = req.params;

    // Find the student
    const student = await Student.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if the resource is marked as done in the Student schema
    const isResourceDone = student.doneResources.includes(resourceId);

    // Find the group that the resource belongs to and check its 'done' status
    const group = await Group.findOne({ 'resources.resourceId': resourceId });
    if (!group) {
      return res.status(404).json({ message: 'Group not found for this resource' });
    }

    // Check the 'done' status of the resource in the Group schema
    const resource = group.resources.find(r => r.resourceId.toString() === resourceId.toString());
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found in this group' });
    }

    // Send the resource status (done or not done)
    res.status(200).json({
      resourceId,
      studentDoneStatus: isResourceDone ? 'done' : 'not done',
      groupDoneStatus: resource.done ? 'done' : 'not done'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching resource status' });
  }
});

module.exports = router;
