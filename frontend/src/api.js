import axios from 'axios';

const API = axios.create({ 
  baseURL: 'http://localhost:5000/api' 
});


API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
      req.headers.Authorization = `Bearer ${token}`; 
    }
    return req;
});

const registerUser = (userData) => API.post('/auth/signup', userData); 
const loginUser = (userData) => API.post('/auth/login', userData);     
const fetchGroups = () => API.get('/groups');
const fetchGroupDetails = (groupId) => API.get(`/groups/${groupId}`);
const joinGroup = (groupId) => API.post(`/groups/${groupId}/join`);
const fetchResources = () => API.get('/students/resources');
const fetchDiscussions = (groupId) => API.get(`/groups/${groupId}/discussions`);
const createDiscussion = (groupId, data) => API.post(`/groups/${groupId}/discussions`, data);
const fetchNotifications = () => API.get('/notification/see');
const fetchBookmarks = () => API.get('students/bookmarks');
const bookmarkResource = (data) => API.post('/students/bookmarks', data);


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
