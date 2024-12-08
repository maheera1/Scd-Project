import React, { useEffect, useState } from 'react';
import { API } from '../../api';  
import './AllGroups.css';

const AllGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await API.get('/students/not-joined');
        setGroups(response.data);
      } catch (err) {
        setError('Failed to fetch groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleJoinGroup = async (groupId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      await API.post(`/groups/${groupId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Successfully joined the group!');
      
    } catch (err) {
      alert('Failed to join group');
    }
  };

  if (loading) return <p>Loading groups...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="all-groups-container">
      <h2>All Groups</h2>
      <ul className="group-list">
        {groups.map(group => (
          <li key={group._id} className="group-item">
            <h3>{group.name}</h3>
            <p>{group.description || 'No description available'}</p>
            <button onClick={() => handleJoinGroup(group._id)} className="join-btn">Join Group</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllGroups;
