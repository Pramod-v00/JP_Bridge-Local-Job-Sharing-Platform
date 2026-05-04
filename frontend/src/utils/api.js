import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('jpb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('jpb_token');
      localStorage.removeItem('jpb_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (formData) => API.post('/auth/register', formData);
export const login = (phone, password) => API.post('/auth/login', { phone, password });
export const adminLogin = (phone, password) => API.post('/auth/admin-login', { phone, password });

// Jobs
export const getJobFeed = (lat, lng, radius) =>
  API.get(`/jobs/feed?lat=${lat}&lng=${lng}&radius=${radius || 10}`);
export const getJob = (id) => API.get(`/jobs/${id}`);
export const getMyJobs = () => API.get('/jobs/my-jobs');
export const createJob = (formData) => API.post('/jobs', formData);
export const updateJobStatus = (id, jobStatus) =>
  API.patch(`/jobs/${id}/status`, { jobStatus });
export const deleteJob = (id) => API.delete(`/jobs/${id}`);

// Users
export const getMyProfile = () => API.get('/users/me');
export const getProfile = (id) => API.get(`/users/profile/${id}`);
export const updateProfile = (formData) => API.put('/users/profile', formData);
export const updateLocation = (lat, lng, area) =>
  API.patch('/users/location', { lat, lng, area });
export const searchWorkers = (params) => API.get('/users/search', { params });
export const blockUser = (id) => API.post(`/users/block/${id}`);

// Chat
export const getRoom = (userId) => API.get(`/chat/room/${userId}`);
export const getMessages = (roomId) => API.get(`/chat/messages/${roomId}`);
export const saveMessage = (data) => API.post('/chat/messages', data);
export const getConversations = () => API.get('/chat/conversations');

// Reviews
export const createReview = (data) => API.post('/reviews', data);
export const getReviews = (userId) => API.get(`/reviews/user/${userId}`);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markNotificationsRead = () => API.patch('/notifications/read');

// Reports
export const createReport = (data) => API.post('/reports', data);

// Admin
export const adminDashboard = () => API.get('/admin/dashboard');
export const adminPendingJobs = () => API.get('/admin/jobs/pending');
export const adminAllJobs = () => API.get('/admin/jobs/all');
export const adminApproveJob = (id) => API.patch(`/admin/jobs/${id}/approve`);
export const adminRejectJob = (id, reason) =>
  API.patch(`/admin/jobs/${id}/reject`, { reason });
export const adminGetUsers = () => API.get('/admin/users');
export const adminGetReports = () => API.get('/admin/reports');

export default API;
