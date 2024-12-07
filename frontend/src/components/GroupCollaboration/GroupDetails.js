import React from 'react';
import { joinGroup } from '../../api';

const GroupDetails = ({ groupId }) => {
  const handleJoinGroup = async () => {
    try {
      const { data } = await joinGroup(groupId);
      alert('Joined group successfully!');
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  return (
    <div>
      <button onClick={handleJoinGroup}>Join Group</button>
    </div>
  );
};

export default GroupDetails;
