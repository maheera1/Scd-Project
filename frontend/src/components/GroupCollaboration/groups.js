import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Groups.css';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null); // State for the selected group

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/students/joined', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        console.log('API Response:', response.data);

        const uniqueGroups = Array.from(
          new Map(response.data.groups.map((group) => [group._id, group])).values()
        );

        console.log('Unique Groups:', uniqueGroups);

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

  const handleGroupClick = async (groupId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSelectedGroup(response.data); // Set the selected group details
    } catch (err) {
      console.error('Error fetching group details:', err.response || err.message);
      setError('Failed to fetch group details');
    }
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
              onClick={() => handleGroupClick(group._id)} // Add click handler
            >
              <h2>{group.name}</h2>
              <p>{group.description || 'No description available'}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-groups">No groups joined yet.</p>
      )}

      {selectedGroup && (  // Render the selected group details
        <div className="group-details">
          <h2>{selectedGroup.name}</h2>
          <p>{selectedGroup.description || 'No description available'}</p>
          <h3>Resources:</h3>
          <ul>
            {selectedGroup.resources.map((resource) => (
              <li key={resource.resourceId}>
                <p>{resource.description}</p>
                {resource.type === 'pdf' && (
                  <a href={`/api/groups/${selectedGroup._id}/resources/${resource.resourceId}/download`} target="_blank" rel="noopener noreferrer">
                    Download PDF
                  </a>
                )}
                {resource.type === 'link' && (
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    Visit Link
                  </a>
                )}
              </li>
            ))}
          </ul>
          <h3>Discussions:</h3>
          <ul>
            {selectedGroup.discussions.map((discussion) => (
              <li key={discussion._id}>
                <h4>{discussion.title}</h4>
                <p>{discussion.body}</p>
                <ul>
                  {discussion.comments.map((comment, index) => (
                    <li key={index}>
                      <p>{comment.comment}</p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Groups;
