import React, { useEffect, useState } from 'react';
import { fetchResources } from '../../api'; // Import the fetchResources function
import './ResourceList.css';

const ResourceList = () => {
  const [notDoneResources, setNotDoneResources] = useState([]);
  const [doneResources, setDoneResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentResources = async () => {
      try {
        const response = await fetchResources();
        const updatedResources = await Promise.all(
          response.data.map(async (resource) => {
            const status = await fetchResourceStatus(resource.resourceId); // Fetch resource status
            return { ...resource, ...status };
          })
        );

        // Separate resources into "not done" and "done" categories
        const notDone = updatedResources.filter((res) => res.studentDoneStatus === 'not done');
        const done = updatedResources.filter((res) => res.studentDoneStatus === 'done');
        setNotDoneResources(notDone);
        setDoneResources(done);
      } catch (err) {
        setError('Error fetching resources');
        console.error('Error fetching resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentResources();
  }, []);

  const fetchResourceStatus = async (resourceId) => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('You are not logged in.');
      return { studentDoneStatus: 'not done', groupDoneStatus: 'not done' };
    }

    try {
      const response = await fetch(`http://localhost:5000/api/students/resources/${resourceId}/status`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch resource status');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching resource status:', err);
      return { studentDoneStatus: 'not done', groupDoneStatus: 'not done' };
    }
  };

  const handleDownload = (groupId, resourceId) => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('You are not logged in.');
      return;
    }

    const downloadUrl = `http://localhost:5000/api/groups/${groupId}/resources/${resourceId}/download`;

    fetch(downloadUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to download resource');
        }
        return response.blob();
      })
      .then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'resource.pdf';
        link.click();
      })
      .catch((err) => {
        console.error('Download error:', err);
        alert('An error occurred while downloading.');
      });
  };

  const handleMarkAsDone = async (resourceId) => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('You are not logged in.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/students/resources/${resourceId}/done`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark resource as done');
      }

      setNotDoneResources((prev) => prev.filter((resource) => resource.resourceId !== resourceId));
      const resource = notDoneResources.find((res) => res.resourceId === resourceId);
      setDoneResources((prev) => [...prev, { ...resource, studentDoneStatus: 'done' }]);
    } catch (err) {
      console.error('Error marking resource as done:', err);
      alert('An error occurred while marking the resource as done.');
    }
  };

  const handleMarkAsNotDone = async (resourceId) => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('You are not logged in.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/students/resources/${resourceId}/notdone`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark resource as not done');
      }

      setDoneResources((prev) => prev.filter((resource) => resource.resourceId !== resourceId));
      const resource = doneResources.find((res) => res.resourceId === resourceId);
      setNotDoneResources((prev) => [...prev, { ...resource, studentDoneStatus: 'not done' }]);
    } catch (err) {
      console.error('Error marking resource as not done:', err);
      alert('An error occurred while marking the resource as not done.');
    }
  };

  const handleBookmark = async (resourceId, groupId) => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('You are not logged in.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/students/bookmark', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resourceId, groupId }),
      });

      if (!response.ok) {
        throw new Error('Failed to bookmark resource');
      }

      alert('Resource bookmarked successfully!');
    } catch (err) {
      console.error('Bookmark error:', err);
      alert('An error occurred while bookmarking the resource.');
    }
  };

  if (loading) {
    return <div>Loading resources...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="resource-list">
      <h2>Resources</h2>
      <section>
        <h3>Not Done Resources</h3>
        <ul>
          {notDoneResources.map((resource) => (
            <li key={resource.resourceId}>
              <div className="resource-item">
                <h4>{resource.groupName}</h4>
                <p>{resource.description}</p>
                {resource.type === 'link' ? (
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    View Resource
                  </a>
                ) : (
                  <button
                    className="download-button"
                    onClick={() => handleDownload(resource.groupId, resource.resourceId)}
                  >
                    Download Resource
                  </button>
                )}
                <button
                  className="mark-done-button"
                  onClick={() => handleMarkAsDone(resource.resourceId)}
                >
                  Mark as Done
                </button>
                <button
                  className="bookmark-button"
                  onClick={() => handleBookmark(resource.resourceId, resource.groupId)}
                >
                  Bookmark
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Done Resources</h3>
        <ul>
          {doneResources.map((resource) => (
            <li key={resource.resourceId}>
              <div className="resource-item">
                <h4>{resource.groupName}</h4>
                <p>{resource.description}</p>
                {resource.type === 'link' ? (
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    View Resource
                  </a>
                ) : (
                  <button
                    className="download-button"
                    onClick={() => handleDownload(resource.groupId, resource.resourceId)}
                  >
                    Download Resource
                  </button>
                )}
                <button
                  className="mark-not-done-button"
                  onClick={() => handleMarkAsNotDone(resource.resourceId)}
                >
                  Mark as Not Done
                </button>
                <button
                  className="bookmark-button"
                  onClick={() => handleBookmark(resource.resourceId, resource.groupId)}
                >
                  Bookmark
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ResourceList;
