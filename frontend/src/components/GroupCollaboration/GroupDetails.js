import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // useParams to get the groupId from the URL, useNavigate for redirection
import './GroupDetails.css'; 

const GroupDetails = () => {
  const { groupId } = useParams();  // Retrieve groupId from the URL params
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [discussionTitle, setDiscussionTitle] = useState('');
  const [discussionBody, setDiscussionBody] = useState('');
  const [addDiscussionError, setAddDiscussionError] = useState('');
  const [isAddingDiscussion, setIsAddingDiscussion] = useState(false);
  const navigate = useNavigate();

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

  const handleDiscussionSubmit = async (e) => {
    e.preventDefault();
    setIsAddingDiscussion(true);
    setAddDiscussionError('');

    const newDiscussion = { title: discussionTitle, body: discussionBody };

    try {
      const token = localStorage.getItem('token'); // Get the JWT token from localStorage

      if (!token) {
        setAddDiscussionError('You must be logged in to create a discussion');
        setIsAddingDiscussion(false);
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/groups/${groupId}/discussions`,
        newDiscussion,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Successfully created discussion
      console.log('Discussion created:', response.data);

      // Update the group state with the new discussion
      setGroup((prevState) => ({
        ...prevState,
        discussions: prevState.discussions ? [response.data, ...prevState.discussions] : [response.data], // Ensure discussions exists
      }));

      // Clear form fields
      setDiscussionTitle('');
      setDiscussionBody('');
    } catch (err) {
      console.error('Error creating discussion:', err);
      setAddDiscussionError('Failed to create discussion');
    } finally {
      setIsAddingDiscussion(false);
    }
  };

  // Return early if loading or error
  if (loading) return <p>Loading group details...</p>;
  if (error) return <p>{error}</p>;

  // Initialize resources and discussions to empty arrays if they are undefined
  const resources = group.resources || [];
  const discussions = group.discussions || [];

  return (
    <div className="group-details-container">
      <h2>{group.name}</h2>
      <p>{group.description || 'No description available'}</p>

      <h3>Resources:</h3>
      <ul>
        {resources.length > 0 ? (
          resources.map((resource) => (
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
          ))
        ) : (
          <p>No resources available</p>
        )}
      </ul>

      <h3>Discussions:</h3>
      <ul>
        {discussions.length > 0 ? (
          discussions.map((discussion) => (
            <li key={discussion._id}>
              <h4>{discussion.title}</h4>
              <p>{discussion.body}</p>
              <ul>
                {discussion.comments && discussion.comments.length > 0 ? (
                  discussion.comments.map((comment, index) => (
                    <li key={index}>
                      <p>{comment.comment}</p>
                    </li>
                  ))
                ) : (
                  <p>No comments yet</p>
                )}
              </ul>
            </li>
          ))
        ) : (
          <p>No discussions available</p>
        )}
      </ul>

      <h3>Create a New Discussion</h3>
      <form onSubmit={handleDiscussionSubmit}>
        <div>
          <label htmlFor="discussionTitle">Title:</label>
          <input
            type="text"
            id="discussionTitle"
            value={discussionTitle}
            onChange={(e) => setDiscussionTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="discussionBody">Body:</label>
          <textarea
            id="discussionBody"
            value={discussionBody}
            onChange={(e) => setDiscussionBody(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={isAddingDiscussion}>
          {isAddingDiscussion ? 'Creating Discussion...' : 'Create Discussion'}
        </button>
      </form>

      {addDiscussionError && <p className="error-message">{addDiscussionError}</p>}
    </div>
  );
};

export default GroupDetails;
