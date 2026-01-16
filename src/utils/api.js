import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication APIs
export const authAPI = {
  sendOTP: (data) => api.post('/auth/send-otp', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  adminLogin: (data) => api.post('/auth/admin-login', data),
};

// Patient APIs
export const patientAPI = {
  submitRequest: (data) => api.post('/requests/submit', data),
  getRequests: (patientId) => api.get(`/requests/patient/${patientId}`),
};

// Admin APIs
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getPatients: () => api.get('/admin/patients'),
  getDoctors: () => api.get('/admin/doctors'),
  approveDoctor: (doctorId) => api.post(`/admin/doctors/approve/${doctorId}`),
  blockDoctor: (doctorId) => api.post(`/admin/doctors/block/${doctorId}`),
  getRequests: () => api.get('/admin/requests'),
  getAppointments: () => api.get('/admin/appointments'),
  getEmailLogs: () => api.get('/admin/email-logs'),
};

// System APIs
export const systemAPI = {
  getStatus: () => api.get('/system/status'),
};

export default api;
