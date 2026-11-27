import axios from "axios";
import { getToken, clearSession } from "../features/auth/utils/authStorage.js";

const api = axios.create({
  baseURL: (typeof import.meta !== "undefined" && import.meta.env?.VITE_BACKEND_URL) || "",
  timeout: 4000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach bearer token using authStorage.getToken()
api.interceptors.request.use(
  (config) => {
    try {
      const token = getToken();
      if (token) {
        const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        config.headers = config.headers || {};
        config.headers.Authorization = authHeader;
      }
    } catch {
      // Ignore storage access errors in non-browser/restricted environments
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession();
      if (typeof window !== "undefined" && !window.location.pathname.endsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
