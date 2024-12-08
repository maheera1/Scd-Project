import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { API } from '../../api';  // Import API functions
import './NotesPage.css';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');  // New state for search input
  const [searchBy, setSearchBy] = useState('word'); // Whether to search by word or tags
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // Retrieve the token from localStorage

  useEffect(() => {
    if (!token) {
      console.error("User not authenticated, redirecting to login...");
      navigate('/login');  // Redirect to login if no token is found
      return;
    }

    const fetchNotes = async () => {
      try {
        const response = await API.get('/notes/getNotes', {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the token to the Authorization header
          },
        });
        console.log('Fetched notes:', response.data.notes);
        setNotes(response.data.notes);
      } catch (error) {
        console.error('Error fetching notes:', error);
        if (error.response && error.response.status === 401) {
          console.error("Unauthorized! Please log in.");
          navigate('/login');  // Redirect to login if the token is invalid
        }
      }
    };

    fetchNotes();
  }, [token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNote((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddNote = async () => {
    if (!newNote.title || !newNote.content || !newNote.tags) {
      console.error('All fields must be filled');
      return;
    }

    try {
      const response = await API.post('/notes/createNote', newNote, {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token in the header
        },
      });

      setNotes((prevNotes) => [...prevNotes, response.data.note]);
      setNewNote({ title: '', content: '', tags: '' });
    } catch (error) {
      console.error('Error adding note:', error);
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized! Please log in.");
        navigate('/login');  // Redirect to login if the token is invalid
      }
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!noteId) {
      console.error('Note ID is undefined or invalid');
      return;
    }

    try {
      const response = await API.delete(`/notes/deleteNote/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in header
        },
      });

      if (response.status === 200) {
        setNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
      } else {
        console.error('Failed to delete the note:', response.data.message);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized! Please log in.");
        navigate('/login');
      }
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      tags: note.tags,
    });
  };

  const handleUpdateNote = async () => {
    if (!newNote.title || !newNote.content || !newNote.tags) {
      console.error('All fields must be filled');
      return;
    }

    try {
      const response = await API.put(`/notes/updateNote/${editingNote._id}`, newNote, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === editingNote._id ? response.data.note : note
        )
      );
      setEditingNote(null);
      setNewNote({ title: '', content: '', tags: '' });
    } catch (error) {
      console.error('Error updating note:', error);
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized! Please log in.");
        navigate('/login');
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      // If search query is empty, fetch all notes again
      try {
        const response = await API.get('/notes/getNotes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotes(response.data.notes); // Reset the notes list to all notes
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
      return; // Exit the function if no search query
    }

    const endpoint =
      searchBy === 'word'
        ? '/notes/searchNotesByWord'
        : '/notes/searchNotes';

    try {
      const response = await API.get(endpoint, {
        params: {
          query: searchQuery,
          tags: searchQuery, // If searching by tags, pass it as tags param
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotes(response.data.notes); // Update notes based on search results
    } catch (error) {
      console.error('Error searching notes:', error);
    }
  };

  return (
    <div className="notes-page">
      <h2>Your Notes</h2>

      {/* Search bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <button onClick={handleSearch}>Search</button>
        <select
          onChange={(e) => setSearchBy(e.target.value)}
          value={searchBy}
          className="search-dropdown"
        >
          <option value="word">Search by word</option>
          <option value="tags">Search by tags</option>
        </select>
      </div>

      {/* New Note Form or Edit Form */}
      <div className="note-form">
        <h3>{editingNote ? 'Edit Note' : 'Add New Note'}</h3>
        <input
          type="text"
          name="title"
          value={newNote.title}
          placeholder="Title"
          onChange={handleInputChange}
        />
        <textarea
          name="content"
          value={newNote.content}
          placeholder="Content"
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="tags"
          value={newNote.tags}
          placeholder="Tags"
          onChange={handleInputChange}
        />
        <button onClick={editingNote ? handleUpdateNote : handleAddNote}>
          {editingNote ? 'Save Changes' : 'Add Note'}
        </button>
      </div>

      {/* Notes List */}
      <div className="notes-list">
        <h3>Your Notes</h3>
        {notes.length === 0 ? (
          <p>No notes available</p>
        ) : (
          notes.map((note) => (
            <div key={note._id} className="note-card">
              <h4>{note.title}</h4>
              <p>{note.content}</p>
              <small>{note.tags}</small>
              <div className="button-group">
                <button className="edit-btn" onClick={() => handleEditNote(note)}>
                  <FaEdit /> Edit
                </button>
                <button className="delete-btn" onClick={() => handleDeleteNote(note._id)}>
                  <FaTrashAlt /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesPage;
