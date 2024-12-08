require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const notesRoutes = require('./routes/notesRoutes'); 
const app = express();

// Middleware
app.use(express.json()); // To parse JSON data in requests
app.use(cors()); // To handle cross-origin requests
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Test Route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Use authentication routes for /api/auth (sign-up and login)
app.use('/api/auth', authRoutes);

const studentRoutes = require('./routes/studentRoutes');
app.use('/api/students', studentRoutes);

const groupRoutes = require('./routes/groupRoutes');

app.use('/api/groups', groupRoutes); // Prefix all group routes with /api/groups
app.use('/api/notes', notesRoutes); 

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
