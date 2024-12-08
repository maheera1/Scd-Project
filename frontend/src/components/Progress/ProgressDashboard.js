
import React, { useEffect, useState } from 'react';
import { API } from '../../api'; 
import './ProgressDashboard.css'; 

const ProgressDashboard = () => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await API.get('/students/progress');
        setProgressData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch progress data');
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="progress-dashboard-container">
      <h2>Your Progress</h2>
      <div className="progress-summary">
        <p>Discussions Created: {progressData.discussionsCreated}</p>
        <p>Resources Completed: {progressData.doneResourcesCount}</p>
      </div>

      <h3>Resources:</h3>
      <ul className="progress-resource-list">
        {progressData.resources.map((resource) => (
          <li key={resource.resourceId} className="progress-resource-item">
            <div>
              <h4>{resource.groupName}</h4>
              {resource.type === 'link' ? (
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  {resource.description || 'View Resource'}
                </a>
              ) : (
                <a href={resource.filePath} download>
                  {resource.description || 'Download Resource'}
                </a>
              )}
            </div>
            <p>Status: {resource.done ? 'Completed' : 'Not Completed'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProgressDashboard;
