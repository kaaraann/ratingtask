import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Auth endpoints
export const authAPI = {
  signup: (data) => apiClient.post("/auth/signup", data),
  login: (data) => apiClient.post("/auth/login", data),
  adminRegister: (data) => apiClient.post("/auth/admin-register", data),
};

// Admin endpoints
export const adminAPI = {
  getDashboard: () => apiClient.get("/admin/dashboard"),

  // Stores
  createStore: (data) => apiClient.post("/admin/stores", data),
  getStores: (params) => apiClient.get("/admin/stores", { params }),
  getStoreDetails: (id) => apiClient.get(`/admin/stores/${id}`),
  updateStore: (id, data) => apiClient.put(`/admin/stores/${id}`, data),
  deleteStore: (id) => apiClient.delete(`/admin/stores/${id}`),

  // Users
  getUsers: (params) => apiClient.get("/admin/users", { params }),
  getUserDetails: (id) => apiClient.get(`/admin/users/${id}`),
  createUser: (data) => apiClient.post("/admin/users", data),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
};

// User endpoints
export const userAPI = {
  getProfile: () => apiClient.get("/user/profile"),
  updatePassword: (data) => apiClient.put("/user/password", data),
  getStores: (params) => apiClient.get("/user/stores", { params }),
  getStoreDetails: (id) => apiClient.get(`/user/stores/${id}`),
  submitRating: (storeId, data) =>
    apiClient.post(`/user/stores/${storeId}/rate`, data),
  updateRating: (storeId, data) =>
    apiClient.put(`/user/stores/${storeId}/rate`, data),
  getMyRatings: () => apiClient.get("/user/my-ratings"),
};

// Store owner endpoints
export const storeOwnerAPI = {
  getDashboard: () => apiClient.get("/store-owner/dashboard"),
  getStoreRatings: () => apiClient.get("/store-owner/store/ratings"),
  getAverageRating: () => apiClient.get("/store-owner/store/average-rating"),
  getProfile: () => apiClient.get("/store-owner/profile"),
  updatePassword: (data) => apiClient.put("/store-owner/password", data),
};

export default apiClient;
