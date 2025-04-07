import axios from 'axios';
import Cookies from 'js-cookie';

// Instancia básica de axios
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true
});

// Interceptor para añadir el token a cada petición
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    console.log('Token enviado en la solicitud:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API específica para autenticación
const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  verifyAuth: () => api.get('/auth/verify')
};

// API para administradores
const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getOrders: () => api.get('/admin/orders')
};

export { api as default, authAPI, adminAPI };