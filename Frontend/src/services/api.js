import axios from 'axios';

const API = axios.create({
  // Configure via Vite env var if needed, otherwise default to backend's typical dev port.
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api',
});

// Optional dev override (avoid hard-coding secrets in source): set `VITE_DEV_TOKEN` if you need one.
const DEV_TOKEN = import.meta.env.VITE_DEV_TOKEN;

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    // Prefer the real token from login; fall back to optional dev token.
    return localStorage.getItem('token') || DEV_TOKEN;
  }
  return DEV_TOKEN;
};

export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }
};

API.interceptors.request.use((req) => {
  // Don't add token to auth endpoints
  const authEndpoints = [
    '/users/register',
    '/users/login',
    '/users/verify-email',
    '/users/resend-otp',
    '/users/forgot-password',
    '/users/reset-password',
    '/admin/register',
    '/admin/login',
    '/admin/verify-email',
    '/admin/resend-otp',
    '/admin/forgot-password',
    '/admin/reset-password',
  ];

  const url = req.url || '';
  const isAuthEndpoint = authEndpoints.some((endpoint) => url.includes(endpoint));

  if (!isAuthEndpoint) {
    const token = getAuthToken();
    if (token) {
      req.headers = req.headers || {};
      req.headers.authorization = `Bearer ${token}`;
    }
  }

  return req;
});

// ================= USER AUTH APIs =================
export const userRegister = (data) => API.post('/users/register', data);
export const userLogin = (data) => API.post('/users/login', data);
export const userVerifyEmail = (data) => API.post('/users/verify-email', data);
export const userResendOtp = (data) => API.post('/users/resend-otp', data);
export const userForgotPassword = (data) => API.post('/users/forgot-password', data);
export const userResetPassword = (data) => API.post('/users/reset-password', data);
export const getUserProfile = () => API.get('/users/me');
export const userLogout = () => API.post('/users/logout');

// ================= ANALYTICS APIs =================
export const getOverview = (period = 'all_time') =>
  API.get(`/analytics/overview?period=${period}`);
export const getMonthlyTrend = (months = 6) =>
  API.get(`/analytics/monthly-trend?months=${months}`);
export const getCategoryDistribution = () => API.get('/analytics/category-distribution');
export const getLeaderboard = () => API.get('/analytics/leaderboard?limit=5');
export const getSriLankaHolidays = (year, month) =>
  API.get(`/holidays?year=${year}${month ? `&month=${month}` : ""}`);

export const getNextSriLankaHoliday = () =>
  API.get("/holidays/next");

export const getHolidayComparison = (year = new Date().getFullYear()) =>
  API.get(`/analytics/holiday-comparison?year=${year}`);

// ================= IMPACT LOGS & SETTINGS APIs =================
export const getImpactLogs = (filters = {}) => API.get('/impact-logs', { params: filters });
export const getSettings = () => API.get('/settings');
export const updateSettings = (data) => API.put('/settings', data);

// ================= EWASTE APIs =================
export const createEwasteItem = (data) =>
  API.post("/ewaste", data);

// USER gets ONLY their items (backend handles filtering)
export const getMyEwasteItems = () =>
  API.get("/ewaste");

// ADMIN or RECYCLER may also use same endpoint depending on role logic

export const getEwasteItemById = (id) =>
  API.get(`/ewaste/${id}`);

export const updateEwasteItem = (id, data) =>
  API.put(`/ewaste/${id}`, data);

export const deleteEwasteItem = (id) =>
  API.delete(`/ewaste/${id}`);

export default API;

// ================= PICKUP REQUEST APIs =================

// USER: create pickup request from ewaste item
export const createPickupRequest = (data) => API.post("/pickups", data);

// RECYCLER / ADMIN: get all pickup requests
export const getAllPickupRequests = () => API.get("/pickups");

// RECYCLER / ADMIN: get single pickup request details
export const getPickupRequestById = (id) => API.get(`/pickups/${id}`);

// RECYCLER: accept pickup request
export const acceptPickupRequest = (id) => API.put(`/pickups/${id}/accept`);

// RECYCLER: get accepted pickup requests
export const getAcceptedPickupRequests = () => API.get("/pickups/accepted/my");

// RECYCLER / ADMIN: update pickup status
export const updatePickupRequestStatus = (id, status) =>
  API.put(`/pickups/${id}/status`, { status });

// ADMIN: delete pickup request
export const deletePickupRequest = (id) => API.delete(`/pickups/${id}`);