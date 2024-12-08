import React, { useEffect, useState } from 'react';
import { fetchResources } from '../../api';  // Import the fetchResources function
 import './ResourceList.css';

const ResourceList = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentResources = async () => {
      try {
        // Fetch resources for the student
        const response = await fetchResources();
        setResources(response.data);
      } catch (err) {
        setError('Error fetching resources');
        console.error('Error fetching resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentResources();
  }, []);

  if (loading) {
    return <div>Loading resources...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="resource-list">
      <h2>Resources</h2>
      <ul>
        {resources.map((resource) => (
          <li key={resource.resourceId}>
            <div className="resource-item">
              <h3>{resource.groupName}</h3>
              <p>{resource.description}</p>
              {resource.type === 'link' ? (
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  View Resource
                </a>
              ) : (
                <a href={resource.filePath} download>
                  Download Resource
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResourceList;
