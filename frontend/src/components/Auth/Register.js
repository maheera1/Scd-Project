import React, { useState } from 'react';
import { registerUser } from '../../api';  // Importing the registerUser function from your API module

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '', name: '', email: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);  // Optional: To handle loading state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);  // Set loading to true when starting the registration

    try {
      const response = await registerUser(formData);  // Use registerUser from your API
      setMessage('Registration successful. Please log in.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error occurred during registration.');
    } finally {
      setLoading(false);  // Reset loading state after the request is finished
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;
