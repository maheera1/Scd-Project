import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';  // Import Link from react-router-dom
import { loginUser } from '../../api';  // Assuming loginUser is a function in your API module
import './Login.css';  // Import the updated CSS for styling

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');  // For feedback messages
  const [loading, setLoading] = useState(false);  // To handle loading state
  const [error, setError] = useState('');  // For displaying errors
  const navigate = useNavigate();  // For navigation

  useEffect(() => {
    // Check if the user is already logged in by checking for token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');  // Redirect to dashboard if already logged in
    }
  }, [navigate]);  // Dependency array ensures the effect runs only once

  // Handling input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handling form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);  // Set loading to true to disable submit button

    try {
      const response = await loginUser(formData);  // Assuming loginUser is your API function
      const token = response.data.token;

      // Store token in localStorage for authenticated requests
      localStorage.setItem('token', token);

      setMessage('Login successful. Redirecting to dashboard...');
      setError('');  // Reset error message on successful login

      // Redirect to the dashboard page with a slight delay
      setTimeout(() => {
        navigate('/dashboard');  // Use navigate to redirect
      }, 1000); // Slight delay before navigating

    } catch (error) {
      setMessage('');  // Reset success message on error
      setError(error.response?.data?.message || 'An error occurred during login.');
    } finally {
      setLoading(false);  // Reset loading state after request finishes
    }
  };

  return (
    <div className="login-container">
      {/* Left side for logo */}
      <div className="login-logo-container">
        <img src="/logo.jpg" alt="Logo" className="login-logo" />
      </div>

      {/* Right side for login form */}
      <div className="login-form-container">
        <h2 className="login-header">Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="login-input"
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
              className="login-input"
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Success or error messages */}
        {message && <p className="message-success">{message}</p>}
        {error && <p className="message-error">{error}</p>}

        {/* Link to the signup page */}
        <div className="signup-link-container">
          <p>Don't have an account? <Link to="/register" className="signup-link">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
