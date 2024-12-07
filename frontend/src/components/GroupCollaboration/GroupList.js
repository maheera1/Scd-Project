import React, { useEffect, useState } from 'react';
import { fetchGroups } from '../../api';

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
    <div>
      <h1>Groups</h1>
      <ul>
        {groups.map((group) => (
          <li key={group._id}>{group.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default GroupList;
