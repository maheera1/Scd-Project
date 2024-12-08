const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET || 'key'; 


const generateToken = (id) => {
  const payload = { id }; 
  const options = { expiresIn: '1h' }; 
  return jwt.sign(payload, JWT_SECRET, options);
};


const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
