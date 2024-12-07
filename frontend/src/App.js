import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import GroupList from './components/GroupCollaboration/GroupList';
import GroupDetails from './components/GroupCollaboration/GroupDetails';
import ResourceList from './components/Resources/ResourceList';
import ResourceDetails from './components/Resources/ResourceDetails';
import ProgressDashboard from './components/Progress/ProgressDashboard';
import NotificationsList from './components/Notifications/NotificationsList';
import Dashboard from './components/Dashboard';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Groups from './components/GroupCollaboration/groups';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';  // Import ProtectedRoute

const App = () => {
  const token = localStorage.getItem('token');
  console.log(localStorage.getItem('token'));

  return (
    <Router>
      <div className="App">
        {/* Conditionally render the Navbar only if logged in */}
        {token && <Navbar />}

        <Routes>
          {/* Authentication Routes */}
          <Route path="/register" element={!token ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><Groups/></ProtectedRoute>} />
          <Route path="/group/:id" element={<ProtectedRoute><GroupDetails /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><ResourceList /></ProtectedRoute>} />
          <Route path="/resources/:id" element={<ProtectedRoute><ResourceDetails /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><ProgressDashboard /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsList /></ProtectedRoute>} />

          {/* Redirect to Dashboard or Login */}
          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
