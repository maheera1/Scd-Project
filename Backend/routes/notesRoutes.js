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
  
      // Return success response with the new note data
      res.status(201).json({ message: 'Note created successfully', note: newNote });
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

module.exports = router;
