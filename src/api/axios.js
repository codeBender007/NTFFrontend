import axios from "axios";
import { getToken, clearSession } from "../features/auth/utils/authStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT issued by /api/auth/login to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      config.headers = config.headers || {};
      config.headers.Authorization = authHeader;
    }

    // Allow axios and the browser to set the multipart boundary automatically for FormData
    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession();
    }
    return Promise.reject(error);
  }
);

export default api;

