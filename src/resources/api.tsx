import axios from 'axios';
import mockApi from './mock.ts';

const useMock = import.meta.env.VITE_USE_MOCK_API === 'true';
const realApi = axios.create({
  baseURL: 'http://10.1.91.71:5000/',
});

realApi.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const api = useMock ? mockApi : realApi;

if (useMock) {
  console.warn('%cATENÇÃO: A APLICAÇÃO ESTÁ USANDO DADOS MOCADOS.', 'color: orange; font-weight: bold; font-size: 14px;');
}

export default api; 