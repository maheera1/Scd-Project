import React, { useEffect, useState } from 'react';
import { API } from '../api'; // Assuming API is set up with Axios
import './Dashboard.css'; // External CSS for styling

const Dashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

        console.log('Dashboard Data:', response.data); // Log fetched data for debugging
        setStudentData(response.data);
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

    fetchDashboardData();
  }, []);

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

      {/* Student Info Section */}
      <section className="student-info">
        <h2>Student Info</h2>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
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
