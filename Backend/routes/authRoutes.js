const express = require('express');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Sign-Up Route (Create Student)
router.post('/signup', async (req, res) => {
  const { username, password, name, email } = req.body;

  try {
    const studentExists = await Student.findOne({ username });
    if (studentExists) {
      return res.status(400).json({ message: 'Student already exists' });
    }

    const student = new Student({ username, password, name, email });
    await student.save();

    // Generate JWT Token
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Log-In Route (Authenticate Student)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const student = await Student.findOne({ username });
    if (!student) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await student.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
