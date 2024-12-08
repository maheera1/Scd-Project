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
import CreateDiscussion from './components/GroupCollaboration/CreateDiscussion';
import NotesPage from './components/notes/NotesPage';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <div className="App">
        {token && <Navbar />}

        <Routes>
          <Route path="/register" element={!token ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
          <Route path="/groups/:groupId" element={<ProtectedRoute><GroupDetails /></ProtectedRoute>} /> {/* Updated path */}
          <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><ResourceList /></ProtectedRoute>} /> {/* Add ResourceList Route */}
          <Route path="/groups/:groupId/create-discussion" element={<CreateDiscussion />} />
          <Route path="/resources/:id" element={<ProtectedRoute><ResourceDetails /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><ProgressDashboard /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsList /></ProtectedRoute>} />

          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
