import axios from "axios";
import { getToken } from "../features/auth/utils/authStorage";

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Attach the JWT issued by /api/auth/login to every outgoing request
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
