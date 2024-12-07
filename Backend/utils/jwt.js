const jwt = require('jsonwebtoken');

// Secret key for JWT (should be stored securely)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Replace with your actual secret

// Generate JWT token
const generateToken = (id) => {
  const payload = { id }; // Use 'id' for consistency
  const options = { expiresIn: '1h' }; // Token expires in 1 hour
  return jwt.sign(payload, JWT_SECRET, options);
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
