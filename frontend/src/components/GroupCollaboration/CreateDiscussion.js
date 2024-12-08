import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './CreateDiscussion.css';

const CreateDiscussion = () => {
  const { groupId } = useParams(); // Get groupId from URL
  const navigate = useNavigate(); // For redirecting after success
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Reset error message before making a new request

    try {
      // Check if title and body are provided
      if (!title || !body) {
        setError('Title and body are required');
        setLoading(false);
        return;
      }

      // Make a POST request to create a discussion
      const response = await axios.post(
        `http://localhost:5000/api/groups/${groupId}/discussions`,
        {
          title,
          body,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Send the token in the headers
          },
        }
      );

      // On success, navigate to the group details page
      if (response.status === 201) {
        navigate(`/groups/${groupId}`);
      }
    } catch (error) {
      console.error('Error creating discussion:', error);
      setError('Failed to create discussion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-discussion">
      <h2>Create aaaaa New Discussion</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Body:</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          ></textarea>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Discussion...' : 'Create Discussion'}
        </button>
      </form>
    </div>
  );
};

export default CreateDiscussion;
