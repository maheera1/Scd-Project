const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect } = require('../middleware/authMiddleware'); // Import the protect middleware


router.post('/createNote', protect, async (req, res) => {
    const { title, content, tags } = req.body;
    const studentId = req.student._id;  // Get studentId from the authenticated student
  
    try {
      // Find the student by their ID (from the token)
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      // Create the new note
      const newNote = {
        title,
        content,
        tags,
        createdBy: studentId,  // Ensure 'createdBy' is set to the student's ID
        createdAt: new Date(),
        updatedAt: new Date(),
      };
  
      // Push the new note into the student's notes array
      student.notes.push(newNote);
  
      // Save the student document with the new note added
      await student.save();
  
      // Retrieve the newly created note with the _id from the student's notes
      const updatedStudent = await Student.findById(studentId);
      const note = updatedStudent.notes[updatedStudent.notes.length - 1];  // Get the last note added
  
      // Return success response with the new note data including _id
      res.status(201).json({ message: 'Note created successfully', note });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

// Update a note
router.put('/updateNote/:noteId', protect, async (req, res) => {
    const { noteId } = req.params;
    const { title, content, tags } = req.body;
    const studentId = req.student._id;  // Get student ID from the token
  
    try {
      const student = await Student.findOne({ 'notes._id': noteId });
      if (!student) {
        return res.status(404).json({ message: 'Note not found' });
      }
  
      const note = student.notes.id(noteId);
      if (String(note.createdBy) !== String(studentId)) {
        return res.status(403).json({ message: 'You can only update your own notes' });
      }
  
      note.title = title;
      note.content = content;
      note.tags = tags;
      note.updatedAt = new Date();
  
      await student.save();
  
      res.status(200).json({ message: 'Note updated successfully', note });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
// Delete a note

router.delete('/deleteNote/:noteId', protect, async (req, res) => {
    const { noteId } = req.params;
    const studentId = req.student._id;  // Get student ID from the token
  
    try {
      // Find the student and the note within their notes
      const student = await Student.findOne({ 'notes._id': noteId });
      if (!student) {
        return res.status(404).json({ message: 'Note not found' });
      }
  
      // Find the note to be deleted
      const note = student.notes.id(noteId);
      if (String(note.createdBy) !== String(studentId)) {
        return res.status(403).json({ message: 'You can only delete your own notes' });
      }
  
      // Remove the note from the notes array
      student.notes = student.notes.filter(n => n._id.toString() !== noteId);
  
      // Save the student document after removal
      await student.save();
  
      res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

// Fetch notes for a student
router.get('/getNotes', protect, async (req, res) => {
  const studentId = req.student._id;  // Get student ID from the token

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ notes: student.notes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Search notes based on tags
router.get('/searchNotes', protect, async (req, res) => {
    const studentId = req.student._id;  // Get student ID from the token
    const { tags } = req.query;  // Tags will be passed as a query parameter (comma separated)
  
    if (!tags) {
      return res.status(400).json({ message: 'Tags parameter is required' });
    }
  
    const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase()); // Convert tags to an array and normalize
  
    try {
      // Find the student by ID
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      // Filter notes that contain any of the tags (case-insensitive)
      const filteredNotes = student.notes.filter(note =>
        note.tags.some(tag => tagArray.includes(tag.toLowerCase()))
      );
  
      res.status(200).json({ notes: filteredNotes });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  // Search notes based on query word in title or content
router.get('/searchNotesByWord', protect, async (req, res) => {
    const studentId = req.student._id;  // Get student ID from the token
    const { query } = req.query;  // The word to search in title or content

    if (!query) {
        return res.status(400).json({ message: 'Query word is required' });
    }

    const searchQuery = query.trim().toLowerCase();  // Normalize the query for case-insensitive search

    try {
        // Find the student by ID
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Filter notes that contain the query word in the title or content
        const filteredNotes = student.notes.filter(note =>
            note.title.toLowerCase().includes(searchQuery) ||
            note.content.toLowerCase().includes(searchQuery)
        );

        res.status(200).json({ notes: filteredNotes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
