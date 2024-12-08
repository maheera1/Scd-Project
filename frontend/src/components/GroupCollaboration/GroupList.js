import React, { useEffect, useState } from 'react';
import { fetchGroups } from '../../api';
import './GroupList.css'; 

const GroupList = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const getGroups = async () => {
      try {
        const { data } = await fetchGroups();
        setGroups(data);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    getGroups();
  }, []);

  return (
    <div className="unique-group-list-container">
      <h1 className="groups-title">Your Groups</h1>
      {groups.length === 0 ? (
        <p className="no-groups">No groups available. Please join a group!</p>
      ) : (
        <ul className="groups-list">
          {groups.map((group) => (
            <li key={group._id} className="group-item">
              <div>
                <h2>{group.name}</h2>
                <p>{group.description || 'No description available'}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GroupList;
