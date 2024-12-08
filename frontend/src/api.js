import axios from 'axios';

// Create an axios instance with the base URL
const API = axios.create({ 
  baseURL: 'http://localhost:5000/api' // Your backend API URL
});

// Add token to requests for protected routes
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
      req.headers.Authorization = `Bearer ${token}`; // Attach token to the Authorization header
    }
    return req;
});

// Authentication API Calls
const registerUser = (userData) => API.post('/auth/signup', userData); // Register user
const loginUser = (userData) => API.post('/auth/login', userData);     // Login user

// Group-related API Calls
const fetchGroups = () => API.get('/groups');
const fetchGroupDetails = (groupId) => API.get(`/groups/${groupId}`);
const joinGroup = (groupId) => API.post(`/groups/${groupId}/join`);
const fetchResources = () => API.get('/students/resources');
const fetchDiscussions = (groupId) => API.get(`/groups/${groupId}/discussions`);
const createDiscussion = (groupId, data) => API.post(`/groups/${groupId}/discussions`, data);
const fetchNotifications = () => API.get('/notification/see');
const fetchBookmarks = () => API.get('students/bookmarks');

// Student-related API Calls
const bookmarkResource = (data) => API.post('/students/bookmarks', data); // Bookmark resource

// Export API instance and functions as named exports
export {
  API,
  fetchBookmarks,
  fetchNotifications,
  registerUser,
  loginUser,
  fetchGroups,
  fetchGroupDetails,
  joinGroup,
  fetchResources,
  fetchDiscussions,
  createDiscussion,
  bookmarkResource
};
