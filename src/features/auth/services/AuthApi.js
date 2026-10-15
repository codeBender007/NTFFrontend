import axios from "axios";
import { getToken } from "../utils/authStorage";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

// Auth routes live under /api/auth, while the rest of the backend lives under
// VITE_BACKEND_URL (e.g. /api/v1). Derive the API root from the backend origin
// so we can reach /api/auth/login and /api/auth/logout.
const getAuthBaseUrl = () => {
  try {
    const { origin } = new URL(backendUrl);
    return `${origin}/api`;
  } catch {
    return "/api";
  }
};

const api = axios.create({
  baseURL: getAuthBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    config.headers = config.headers || {};
    config.headers.Authorization = authHeader;
  }
  return config;
});


const AuthApi = {
  // POST - /api/auth/login
  login: (credentials) => api.post("/auth/login", credentials),

  // POST - /api/auth/logout
  logout: () => api.post("/auth/logout"),
};

export default AuthApi;
