import React, { useEffect, useState } from 'react';
import { fetchBookmarks } from '../../api'; 
import axios from 'axios';
import './Bookmarks.css'; 

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkedDiscussions, setBookmarkedDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token'); 
        
        if (!token) {
          setError('You must be logged in to view bookmarks');
          setLoading(false);
          return;
        }

        // Fetching Bookmarked Resources
        const response = await fetchBookmarks(); 
        setBookmarks(response.data.bookmarks); 

       
        const discussionResponse = await axios.get(
          'http://localhost:5000/api/students/bookmarked-discussions',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBookmarkedDiscussions(discussionResponse.data.bookmarkedDiscussions); 
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching bookmarks');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="bookmarks-container">
      <h2>Your Bookmarks</h2>

      
      <h3>Bookmarked Resources</h3>
      {bookmarks.length === 0 ? (
        <p>You have no bookmarked resources yet.</p>
      ) : (
        <ul className="bookmarks-list">
          {bookmarks.map((bookmark, index) => (
            <li key={index} className="bookmark-item">
              <h3>{bookmark.groupName}</h3>
              <p>{bookmark.resource?.description || 'No description'}</p>
              {bookmark.resource?.url && (
                <a href={bookmark.resource.url} target="_blank" rel="noopener noreferrer">
                  Open Resource
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      
      <h3>Bookmarked Discussions</h3>
      {bookmarkedDiscussions.length === 0 ? (
        <p>You have no bookmarked discussions yet.</p>
      ) : (
        <ul className="bookmarked-discussions-list">
          {bookmarkedDiscussions.map((discussion, index) => (
            <li key={index} className="bookmarked-discussion-item">
              <h4>{discussion.discussionTitle}</h4>
              <p>{discussion.discussionBody || 'No body content available'}</p>
              <small>Group: {discussion.groupName}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Bookmarks;
