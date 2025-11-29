import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api-extracurricular.onrender.com', 
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('unibalsas_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;