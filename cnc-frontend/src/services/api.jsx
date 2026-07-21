import axios from 'axios';

const rawApiBaseUrl =
    import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '');

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        Accept: 'application/json',
    },
});

// Interceptor: Otomatis menyisipkan token dari sessionStorage ke header Authorization
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;