import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './GroupDetails.css';

const GroupDetails = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [discussionTitle, setDiscussionTitle] = useState('');
  const [discussionBody, setDiscussionBody] = useState('');
  const [isAddingDiscussion, setIsAddingDiscussion] = useState(false);
  const [addDiscussionError, setAddDiscussionError] = useState('');
  const [commentText, setCommentText] = useState({});
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [students, setStudents] = useState({});
  const [addError, setAddError] = useState('');
  const [bookmarkedDiscussions, setBookmarkedDiscussions] = useState(new Set());

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/groups/${groupId}`);
        setGroup(response.data);
      } catch (err) {
        setError('Failed to fetch group details');
      } finally {
        setLoading(false);
      }
    };
    fetchGroupDetails();
  }, [groupId]);

  const fetchStudentName = async (studentId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/students/students/${studentId}`);
      return response.data?.name || 'Unknown'; // Return 'Unknown' if name is not found
    } catch (err) {
      console.error('Failed to fetch student name', err);
      return 'Unknown'; // Return 'Unknown' if the request fails
    }
  };

  const handleDiscussionSubmit = async (e) => {
    e.preventDefault();
    setIsAddingDiscussion(true);
    setAddDiscussionError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAddDiscussionError('You must be logged in to create a discussion');
        setIsAddingDiscussion(false);
        return;
      }

      const newDiscussion = { title: discussionTitle, body: discussionBody };
      const response = await axios.post(
        `http://localhost:5000/api/groups/${groupId}/discussions`,
        newDiscussion,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setGroup((prevState) => ({
        ...prevState,
        discussions: [...prevState.discussions, response.data],
      }));

      setDiscussionTitle('');
      setDiscussionBody('');
    } catch (err) {
      setAddDiscussionError('Failed to create discussion');
    } finally {
      setIsAddingDiscussion(false);
    }
  };

  const handleShowComments = async (discussionId) => {
    try {
      if (!showComments[discussionId]) {
        setShowComments((prevState) => ({ ...prevState, [discussionId]: true }));
  
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view comments');
          return;
        }
  
        const response = await axios.get(
          `http://localhost:5000/api/groups/${groupId}/discussions/${discussionId}/comments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        console.log("Fetched comments: ", response.data); // Log the response data to check
  
        // Fetch student names for each comment
        const commentsWithNames = await Promise.all(
          response.data.map(async (comment) => {
            const studentName = await fetchStudentName(comment.studentId);
            return { ...comment, studentName };
          })
        );
  
        setComments((prevState) => ({ ...prevState, [discussionId]: commentsWithNames }));
      } else {
        setShowComments((prevState) => ({
          ...prevState,
          [discussionId]: !prevState[discussionId],
        }));
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    }
  };
  
  const handleCommentTextChange = (discussionId, text) => {
    setCommentText((prevState) => ({ ...prevState, [discussionId]: text }));
  };

  const handleAddComment = async (discussionId) => {
    const text = commentText[discussionId];
    if (!text?.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/groups/${groupId}/discussions/${discussionId}/comments`,
        { text },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const studentName = await fetchStudentName(response.data.studentId);
      const newComment = { ...response.data, studentName };

      setComments((prevState) => ({
        ...prevState,
        [discussionId]: [...(prevState[discussionId] || []), newComment],
      }));
      setCommentText((prevState) => ({ ...prevState, [discussionId]: '' }));
    } catch (err) {
      setAddError('Failed to add comment');
    }
  };

  // Function to bookmark a discussion
  const handleBookmark = async (discussionId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to bookmark a discussion');
      return;
    }
  
    try {
      // Perform the API call to bookmark the discussion
      await axios.post(
        'http://localhost:5000/api/students/bookmark-discussion',
        { discussionId, groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Add to bookmarked discussions if successful
      setBookmarkedDiscussions((prevState) => new Set(prevState).add(discussionId));
    } catch (err) {
      // Check if the error response indicates already bookmarked
      if (err.response && err.response.status === 400 && err.response.data.message === 'Discussion is already bookmarked') {
        setError('This discussion is already bookmarked');
      } else {
        // Handle generic error case
        setError('Failed to bookmark discussion. Please try again.');
      }
    }
  };
  
  

  if (loading) return <p>Loading group details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="group-details-container">
      <h2>{group.name}</h2>
      <p>{group.description || 'No description available'}</p>

      {/* Adding a New Discussion */}
      <h3>Create a New Discussion</h3>
      <form onSubmit={handleDiscussionSubmit} className="create-discussion-form">
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

      {/* Displaying Discussions and Comments */}
      <h3>Discussions:</h3>
      <ul>
        {group.discussions.map((discussion) => (
          <li key={discussion._id} className="discussion-item">
            <h4>{discussion.title}</h4>
            <p>{discussion.body}</p>

            {/* Bookmark Button */}
            <button
              onClick={() => handleBookmark(discussion._id)}
              disabled={bookmarkedDiscussions.has(discussion._id)}
            >
              {bookmarkedDiscussions.has(discussion._id) ? 'Bookmarked' : 'Bookmark'}
            </button>

            {/* Add Comment Input */}
            <div className="add-comment">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText[discussion._id] || ''}
                onChange={(e) => handleCommentTextChange(discussion._id, e.target.value)}
              />
              <button onClick={() => handleAddComment(discussion._id)}>Add Comment</button>
            </div>

            {/* Show Comments */}
            <button onClick={() => handleShowComments(discussion._id)}>
              {showComments[discussion._id] ? 'Hide Comments' : 'Show Comments'}
            </button>
            {showComments[discussion._id] && (
              <div className="comments-list">
                {comments[discussion._id]?.length > 0 ? (
                  comments[discussion._id].map((comment) => (
                    <div key={comment._id} className="comment-item">
                      <p>{comment.comment}</p>
                      <small> {comment.studentName}</small>
                    </div>
                  ))
                ) : (
                  <p>No comments yet.</p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupDetails;
