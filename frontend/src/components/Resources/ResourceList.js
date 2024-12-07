import React, { useEffect, useState } from 'react';
import { fetchResources } from '../../api';

const ResourceList = ({ groupId }) => {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const getResources = async () => {
      try {
        const { data } = await fetchResources(groupId);
        setResources(data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    };

    getResources();
  }, [groupId]);

  return (
    <div>
      <h1>Resources</h1>
      <ul>
        {resources.map((resource) => (
          <li key={resource._id}>{resource.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default ResourceList;
