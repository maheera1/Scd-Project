// components/Notifications/NotificationsList.js
import React, { useEffect, useState } from 'react';
import { fetchNotifications } from '../../api'; // Import the fetchNotifications function
import './NotificationsList.css'; // Import the CSS file

const NotificationsList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getNotifications = async () => {
      try {
        const response = await fetchNotifications();
        setNotifications(response.data); // Set the notifications state
      } catch (err) {
        setError('Failed to fetch notifications');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getNotifications();
  }, []);

  return (
    <div className="notifications-list-container">
      {loading ? (
        <p>Loading notifications...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="notifications">
          <h2>Notifications</h2>
          <ul>
            {notifications.map((notification) => (
              <li key={notification._id} className="notification-item">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <p>{new Date(notification.timestamp).toLocaleString()}</p>
                {notification.link && <a href={notification.link}>View Details</a>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
