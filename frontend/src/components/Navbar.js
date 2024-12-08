import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import './Navbar.css'; 

const Navbar = () => {
  const navigate = useNavigate(); 

  const handleLogout = () => {

    localStorage.removeItem('token');
    
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand-container">
      
        <img src="/logo.jpg" alt="BrainBox Logo" className="navbar-logo" />
        <h1 className="navbar-brand">BrainBox</h1>
      </div>
      <ul className="navbar-links">
        <li className="navbar-item"><Link to="/dashboard" className="navbar-link">Dashboard</Link></li>
        <li className="navbar-item"><Link to="/all-groups" className="navbar-link"> All Groups</Link></li>
        <li className="navbar-item"><Link to="/groups" className="navbar-link">Groups</Link></li>
        <li className="navbar-item"><Link to="/notes" className="navbar-link">Notes</Link></li>
        <li className="navbar-item"><Link to="/resources" className="navbar-link">Resources</Link></li>
        <li className="navbar-item"><Link to="/progress" className="navbar-link">Progress</Link></li>
        <li className="navbar-item"><Link to="/notifications" className="navbar-link">Notifications</Link></li>
        <li className="navbar-item"><Link to="/bookmarks" className="navbar-link">Bookmarks</Link></li>
        <li className="navbar-item">
          <button onClick={handleLogout} className="navbar-link">Logout</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
