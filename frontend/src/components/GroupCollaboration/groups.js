import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import './Groups.css';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/students/joined', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const uniqueGroups = Array.from(
          new Map(response.data.groups.map((group) => [group._id, group])).values()
        );

        setGroups(uniqueGroups);
      } catch (err) {
        console.error('Error:', err.response || err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          setError(err.response?.data?.message || 'Failed to fetch groups');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleGroupClick = (groupId) => {
    console.log("Navigating to Group with ID:", groupId); // Log to debug
    navigate(`/groups/${groupId}`); // Updated route to /groups/:groupId
  };

  if (loading) return <p className="groups-loading-message">Loading groups...</p>;
  if (error) return <p className="groups-error-message">Error: {error}</p>;

  return (
    <div className="groups-container">
      <h1>Your Groups</h1>
      {groups.length > 0 ? (
        <ul className="group-list">
          {groups.map((group) => (
            <li
              key={group._id}
              className="group-item"
              onClick={() => handleGroupClick(group._id)} // Pass group._id
            >
              <h2>{group.name}</h2>
              <p>{group.description || 'No description available'}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-groups">No groups joined yet.</p>
      )}
    </div>
  );
};

export default Groups;
