import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import './Navbar.css'; // Import the CSS file for styling

const Navbar = () => {
  const navigate = useNavigate(); // Hook to programmatically navigate

  // Function to handle logout
  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    // Redirect to login page
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand-container">
        {/* Logo from public folder */}
        <img src="/logo.jpg" alt="BrainBox Logo" className="navbar-logo" />
        <h1 className="navbar-brand">BrainBox</h1>
      </div>
      <ul className="navbar-links">
        <li className="navbar-item"><Link to="/groups" className="navbar-link">Groups</Link></li>
        <li className="navbar-item"><Link to="/resources" className="navbar-link">Resources</Link></li>
        <li className="navbar-item"><Link to="/progress" className="navbar-link">Progress</Link></li>
        <li className="navbar-item"><Link to="/notifications" className="navbar-link">Notifications</Link></li>
        <li className="navbar-item">
          <button onClick={handleLogout} className="navbar-link">Logout</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
