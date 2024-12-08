import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { registerUser } from '../../api'; // Assuming registerUser is a function in your API module
import './Register.css';  // Import the updated CSS for styling

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '', name: '', email: '' });
  const [message, setMessage] = useState('');  // For feedback messages
  const [loading, setLoading] = useState(false);  // To handle loading state
  const [error, setError] = useState('');  // For displaying errors
  const navigate = useNavigate();  // For navigation

  // Handling input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handling form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);  // Set loading to true to disable submit button

    try {
      const response = await registerUser(formData);  // Assuming registerUser is your API function
      setMessage('Registration successful. Redirecting to login...');
      setError('');  // Reset error message on successful registration

      // Redirect to the login page with a slight delay
      setTimeout(() => {
        navigate('/login');  // Use navigate to redirect
      }, 1000); // Slight delay before navigating

    } catch (error) {
      setMessage('');  // Reset success message on error
      setError(error.response?.data?.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);  // Reset loading state after request finishes
    }
  };

  return (
    <div className="register-container">
      {/* Left side for logo */}
      <div className="register-logo-container">
        <img src="/logo.jpg" alt="Logo" className="register-logo" />
      </div>

      {/* Right side for register form */}
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

        {/* Link to the login page */}
        <div className="signup-link-container">
          <p>Already have an account? <Link to="/login" className="signup-link">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
