import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
});

let token = null;

export const setAuthToken = (newToken) => {
  token = newToken;
};

api.interceptors.request.use(
  (config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh-token') &&
      !originalRequest.url.includes('/auth/me')
    ) {
      originalRequest._retry = true;
      try {
        const res = await api.post('/auth/refresh-token');
        const newToken = res.data.data.accessToken;
        setAuthToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        setAuthToken(null);
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
