import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { registerUser } from '../../api'; 
import './Register.css';  

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '', name: '', email: '' });
  const [message, setMessage] = useState('');  
  const [loading, setLoading] = useState(false);  
  const [error, setError] = useState('');  
  const navigate = useNavigate();  

 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 

    try {
      const response = await registerUser(formData);  
      setMessage('Registration successful. Redirecting to login...');
      setError(''); 

      
      setTimeout(() => {
        navigate('/login'); 
      }, 1000);
    } catch (error) {
      setMessage('');  
      setError(error.response?.data?.message || 'An error occurred during registration.');
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="register-container">
    
      <div className="register-logo-container">
        <img src="/logo.jpg" alt="Logo" className="register-logo" />
      </div>

  
      <div className="register-form-container">
        <h2 className="register-header">Register</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        {message && <p className="message-success">{message}</p>}
        {error && <p className="message-error">{error}</p>}

        
        <div className="signup-link-container">
          <p>Already have an account? <Link to="/login" className="signup-link">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
