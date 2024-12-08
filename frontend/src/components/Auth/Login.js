import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { loginUser } from '../../api';  
import './Login.css';  

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');  
  const [loading, setLoading] = useState(false);  
  const [error, setError] = useState('');  
  const navigate = useNavigate();  

  useEffect(() => {
   
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard'); 
    }
  }, [navigate]);  

  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);  

    try {
      const response = await loginUser(formData);  
      const token = response.data.token;
      localStorage.setItem('token', token);

      setMessage('Login successful. Redirecting to dashboard...');
      setError('');  

      setTimeout(() => {
        navigate('/dashboard'); 
      }, 1000);

    } catch (error) {
      setMessage('');  
      setError(error.response?.data?.message || 'An error occurred during login.');
    } finally {
      setLoading(false);  
    }
  };

  return (
    <div className="login-container">
      
      <div className="login-logo-container">
        <img src="/logo.jpg" alt="Logo" className="login-logo" />
      </div>

     
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

        
        {message && <p className="message-success">{message}</p>}
        {error && <p className="message-error">{error}</p>}

        
        <div className="signup-link-container">
          <p>Don't have an account? <Link to="/register" className="signup-link">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
