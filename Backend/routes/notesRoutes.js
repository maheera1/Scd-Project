const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect } = require('../middleware/authMiddleware'); 

// Create the new note
router.post('/createNote', protect, async (req, res) => {
    const { title, content, tags } = req.body;
    const studentId = req.student._id;  
  
    try {
      
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      const newNote = {
        title,
        content,
        tags,
        createdBy: studentId, 
        createdAt: new Date(),
        updatedAt: new Date(),
      };
  
      student.notes.push(newNote);
      await student.save();
      const updatedStudent = await Student.findById(studentId);
      const note = updatedStudent.notes[updatedStudent.notes.length - 1];  

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
    const studentId = req.student._id;  
  
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
    const studentId = req.student._id;  
  
    try {
     
      const student = await Student.findOne({ 'notes._id': noteId });
      if (!student) {
        return res.status(404).json({ message: 'Note not found' });
      }

      const note = student.notes.id(noteId);
      if (String(note.createdBy) !== String(studentId)) {
        return res.status(403).json({ message: 'You can only delete your own notes' });
      }
  
      student.notes = student.notes.filter(n => n._id.toString() !== noteId);
  
      await student.save();
  
      res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

router.get('/getNotes', protect, async (req, res) => {
  const studentId = req.student._id;  

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

router.get('/searchNotes', protect, async (req, res) => {
    const studentId = req.student._id;  
    const { tags } = req.query;  
  
    if (!tags) {
      return res.status(400).json({ message: 'Tags parameter is required' });
    }
  
    const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase()); 
  
    try {
    
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
     
      const filteredNotes = student.notes.filter(note =>
        note.tags.some(tag => tagArray.includes(tag.toLowerCase()))
      );
  
      res.status(200).json({ notes: filteredNotes });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
router.get('/searchNotesByWord', protect, async (req, res) => {
    const studentId = req.student._id;  
    const { query } = req.query;  

    if (!query) {
        return res.status(400).json({ message: 'Query word is required' });
    }

    const searchQuery = query.trim().toLowerCase();  

    try {
       
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

    
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
