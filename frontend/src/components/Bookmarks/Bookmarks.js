import React, { useEffect, useState } from 'react';
import { fetchBookmarks } from '../../api'; // Import the fetchBookmarks function
import './Bookmarks.css'; // Ensure you have a CSS file for styling

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchBookmarks(); // Fetch bookmarks using the updated API call
        setBookmarks(response.data.bookmarks); // Update state with bookmarks
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
      {bookmarks.length === 0 ? (
        <p>You have no bookmarks yet.</p>
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
    </div>
  );
};

export default Bookmarks;
