import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const registerUser = (data) => api.post("/users/register/", data);
export const loginUser = (data) => api.post("/users/login/", data);
export const logoutUser = () => api.post("/users/logout/");

export const getItems = (params) => api.get("/items/", { params });
export const getStats = () => api.get("/items/stats/");
export const getBootstrap = () => api.get("/bootstrap/");
export const createItem = (data) => api.post("/items/", data);
export const getItemDetail = (id) => api.get(`/items/${id}/`);
export const getSuggestedMatches = (id) => api.get(`/items/${id}/suggested_matches/`);

export const getClaims = () => api.get("/claims/");
export const createClaim = (data) => api.post("/claims/", data);
export const approveClaim = (id) => api.post(`/claims/${id}/approve/`);
export const rejectClaim = (id) => api.post(`/claims/${id}/reject/`);

export const getMessages = (params) => api.get("/messages/", { params });
export const sendMessage = (data) => api.post("/messages/", data);
export const markMessageRead = (id) => api.post(`/messages/${id}/mark_read/`);

export const getNotifications = () => api.get("/notifications/");
export const markNotificationRead = (id) => api.post(`/notifications/${id}/mark_read/`);
export const deleteNotification = (id) => api.delete(`/notifications/${id}/`);
export const deleteItem = (id) => api.delete(`/items/${id}/`);
export const deleteMessage = (id) => api.delete(`/messages/${id}/`);
export const deleteClaim = (id) => api.delete(`/claims/${id}/`);

export default api;
