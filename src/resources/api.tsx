import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.1.91.71:5000',
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
