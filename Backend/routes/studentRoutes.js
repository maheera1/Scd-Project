const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Student = require('../models/Student');
const Group = require('../models/Group');
const router = express.Router();


router.get('/dashboard', protect, async (req, res) => {
  try {
    
    const student = await Student.findById(req.student._id).populate({
      path: 'groupId', 
      select: 'name description', 
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(student); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});
// Add a resource to bookmarks
router.post('/bookmark', protect, async (req, res) => {
  try {
    const { resourceId, groupId } = req.body; 
    if (!resourceId || !groupId) {
      return res.status(400).json({ message: 'Resource ID and Group ID are required' });
    }

    const student = await Student.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

   
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const resourceIndex = group.resources.findIndex(r => r.resourceId.toString() === resourceId.toString());

    if (resourceIndex === -1) {
      return res.status(404).json({ message: 'Resource not found in this group' });
    }

    const alreadyBookmarked = student.bookmarks.some(
      (bookmark) => bookmark.groupId.toString() === groupId.toString() && bookmark.resourceIndex === resourceIndex
    );

    if (alreadyBookmarked) {
      return res.status(400).json({ message: 'Resource is already bookmarked' });
    }

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
    
    const student = await Student.findById(req.student._id).populate({
      path: 'bookmarks.groupId', 
      select: 'name description resources', 
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const uniqueBookmarks = new Set();

    const formattedBookmarks = student.bookmarks
      .map(bookmark => {
        const group = bookmark.groupId;
        if (!group) return null;

        const resource = group.resources[bookmark.resourceIndex];
        if (!resource) return null;

        const uniqueKey = `${group._id}-${resource.resourceId}`;
        if (uniqueBookmarks.has(uniqueKey)) {
          return null; 
        }

        uniqueBookmarks.add(uniqueKey);

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
      .filter(bookmark => bookmark !== null); 

    res.status(200).json({ bookmarks: formattedBookmarks });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ message: 'Error fetching bookmarks' });
  }
});


// Route to get joined groups
router.get('/joined', protect, async (req, res) => {
  try {
   
    const student = await Student.findById(req.student._id).populate('groupId', 'name description');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

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
  const { studentId } = req.params; 

  try {

    const student = await Student.findById(studentId).populate('groupId', 'name description'); // Populate groupId to get group details

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const uniqueGroups = [
      ...new Map(student.groupId.map(group => [group._id.toString(), group])).values(),
    ];

    
    student.groupId = uniqueGroups;
    res.status(200).json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/resources', protect, async (req, res) => {
  try {
   
    const student = await Student.findById(req.student._id);
    console.log('Student from JWT:', student); 
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const groups = await Group.find({ _id: { $in: student.groupId } }).populate('members');
    console.log('Groups the student is a member of:', groups); 
    
    if (!groups.length) {
      return res.status(404).json({ message: 'No groups found for this student' });
    }

 
    const resources = groups.flatMap(group => 
      group.resources.map(resource => ({
        resourceId: resource.resourceId,
        type: resource.type,
        url: resource.url,
        filePath: resource.filePath,
        description: resource.description,
        groupName: group.name, 
        groupId: group._id     
      }))
    );

    console.log('All resources found:', resources); 
    
    if (!resources.length) {
      return res.status(404).json({ message: 'No resources found for your groups' });
    }

    res.status(200).json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error); 
    res.status(500).json({ message: 'Error fetching resources' });
  }
});
router.get('/progress', protect, async (req, res) => {
  try {
   
    const student = await Student.findById(req.student._id).populate('groupId');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let discussionCount = 0;
    const groups = await Group.find({ _id: { $in: student.groupId } });
    groups.forEach(group => {
      group.discussions.forEach(discussion => {
        if (discussion.createdBy.toString() === req.student._id.toString()) {
          discussionCount++;
        }
      });
    });

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

    res.status(200).json({
      discussionsCreated: discussionCount,
      resources: allResources,
      doneResourcesCount: student.doneResources.length 
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

    
    const student = await Student.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    
    if (student.doneResources.includes(resourceId)) {
      return res.status(400).json({ message: 'Resource already marked as done' });
    }

    student.doneResources.push(resourceId);
    await student.save();

    const group = await Group.findOne({ 'resources.resourceId': resourceId });
    if (!group) {
      return res.status(404).json({ message: 'Group not found for this resource' });
    }

    await Group.updateOne(
      { 'resources.resourceId': resourceId },
      { $set: { 'resources.$.done': true } }
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

    
    const student = await Student.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.doneResources.includes(resourceId)) {
      return res.status(400).json({ message: 'Resource not marked as done yet' });
    }

    student.doneResources = student.doneResources.filter(id => id.toString() !== resourceId);
    await student.save();

    const group = await Group.findOne({ 'resources.resourceId': resourceId });
    if (!group) {
      return res.status(404).json({ message: 'Group not found for this resource' });
    }

    await Group.updateOne(
      { 'resources.resourceId': resourceId },
      { $set: { 'resources.$.done': false } } 
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

    const isResourceDone = student.doneResources.includes(resourceId);

    const group = await Group.findOne({ 'resources.resourceId': resourceId });
    if (!group) {
      return res.status(404).json({ message: 'Group not found for this resource' });
    }
    const resource = group.resources.find(r => r.resourceId.toString() === resourceId.toString());
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found in this group' });
    }
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
router.get('/not-joined', protect, async (req, res) => {
  try {

    const student = await Student.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const allGroups = await Group.find();

    const notJoinedGroups = allGroups.filter(group => !student.groupId.includes(group._id));

    res.status(200).json(notJoinedGroups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching groups the student has not joined' });
  }
});
// Add a discussion to bookmarks
router.post('/bookmark-discussion', protect, async (req, res) => {
  try {
    const { discussionId, groupId } = req.body; // Get discussionId and groupId from request body

    if (!discussionId || !groupId) {
      return res.status(400).json({ message: 'Discussion ID and Group ID are required' });
    }

    const student = await Student.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const discussion = group.discussions.find(d => d._id.toString() === discussionId.toString());
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found in this group' });
    }

    const alreadyBookmarked = student.bookmarks.some(
      (bookmark) => bookmark.groupId.toString() === groupId.toString() && bookmark.discussionId.toString() === discussionId.toString()
    );

    if (alreadyBookmarked) {
      return res.status(400).json({ message: 'Discussion is already bookmarked' });
    }

    student.bookmarks.push({ groupId, discussionId });
    await student.save();

    res.status(200).json({ message: 'Discussion bookmarked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});
// Get bookmarked discussions
router.get('/bookmarked-discussions', protect, async (req, res) => {
  try {

    const student = await Student.findById(req.student._id)
      .populate({
        path: 'bookmarks.groupId', 
        select: 'name description discussions',
        populate: {
          path: 'discussions', 
          select: 'title body createdBy', 
        },
      });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log("Student Bookmarks:", student.bookmarks);
    const bookmarkedDiscussions = student.bookmarks.map(bookmark => {
      const group = bookmark.groupId;

    
      if (!group || !group.discussions || group.discussions.length === 0) {
        console.log(`No discussions found for group: ${group._id}`);
        return null; 
      }

      if (!bookmark.discussionId) {
        console.log("No discussionId found in bookmark, skipping...");
        return null; 
      }

   
      const discussion = group.discussions.find(disc => disc._id.toString() === bookmark.discussionId.toString());

      if (!discussion) {
        console.log(`No matching discussion found for discussionId: ${bookmark.discussionId}`);
        return null; 
      }

      return {
        groupId: group._id,
        groupName: group.name,
        discussionId: discussion._id,
        discussionTitle: discussion.title,
        discussionBody: discussion.body,
        discussionCreatedBy: discussion.createdBy,
      };
    }).filter(disc => disc !== null);

    
    res.status(200).json({ bookmarkedDiscussions });
  } catch (error) {
    console.error('Error fetching bookmarked discussions:', error);
    res.status(500).json({ message: 'Error fetching bookmarked discussions' });
  }
});

module.exports = router;
