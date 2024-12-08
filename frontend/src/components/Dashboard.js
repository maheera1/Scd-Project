import React, { useEffect, useState } from 'react';
import { API } from '../api'; // Assuming API is set up with Axios
import './Dashboard.css'; // External CSS for styling

const Dashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false); // To toggle edit mode
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [successMessage, setSuccessMessage] = useState(''); // State to store success message

  // Fetch dashboard data from the server
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await API.get('/students/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStudentData(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email
      });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Function to handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      await API.put(
        'http://localhost:5000/api/auth/update', 
        formData, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refetch the updated student data after successful profile update
      fetchDashboardData();

      setEditing(false); // Exit edit mode
      setSuccessMessage('Profile updated successfully!'); // Show success message

      // Hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) return <p className="loading">Loading dashboard...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  const { name, email, groupId } = studentData || {}; // Destructure data

  // Filter out duplicate groups
  const uniqueGroups = Array.from(
    new Map(groupId?.map(group => [group._id, group])).values()
  );

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">BrainBox Dashboard</h1>

      {/* Success Message */}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {/* Student Info Section */}
      <section className="student-info">
        <h2>Student Info</h2>
        {editing ? (
          <form onSubmit={handleProfileUpdate} className="update-form">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="update-btn">Update Profile</button>
          </form>
        ) : (
          <>
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Email:</strong> {email}</p>
            <button onClick={() => setEditing(true)} className="edit-btn">Edit Profile</button>
          </>
        )}
      </section>

      {/* Groups Section */}
      <section className="groups-section">
        <h2>Your Groups</h2>
        {uniqueGroups.length > 0 ? (
          <ul className="group-list">
            {uniqueGroups.map((group) => (
              <li key={group._id} className="group-item">
                <strong>{group.name}</strong>
                <p>{group.description || 'No description available'}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-groups">No groups joined yet. Please verify your group memberships.</p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
