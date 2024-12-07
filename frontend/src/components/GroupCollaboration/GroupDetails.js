import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // useParams to get the groupId from the URL
import './GroupDetails.css'; 
const GroupDetails = () => {
  const { groupId } = useParams();  // Retrieve groupId from the URL params
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log("Group ID:", groupId);  // Log the groupId to ensure it's correct

    const fetchGroupDetails = async () => {
      try {
        if (!groupId) {
          setError('Group ID is missing');
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/groups/${groupId}`); // Correct API route
        setGroup(response.data);
      } catch (err) {
        console.error('Error fetching group details:', err);
        setError('Failed to fetch group details');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  if (loading) return <p>Loading group details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="group-details-container">
      <h2>{group.name}</h2>
      <p>{group.description || 'No description available'}</p>

      <h3>Resources:</h3>
      <ul>
        {group.resources.map((resource) => (
          <li key={resource._id}>
            <p>{resource.description}</p>
            {resource.type === 'pdf' && (
              <a
                href={`http://localhost:5000/api/groups/${group._id}/resources/${resource._id}/download`}
                target="_blank"
                rel="noopener noreferrer"
              >
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
        {group.discussions.map((discussion) => (
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
  );
};

export default GroupDetails;
