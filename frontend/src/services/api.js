import axios from 'axios';
import Cookies from 'js-cookie';

// Instancia que utilitzaremos para hacer todas las peticiones GET i POST necessarias
// Como podremos obervar sera utilizada en la funcion "authAPI" i "adminAPI"
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  withCredentials: true
});

// Funcion que intercepta todas las peticiones de la API e añade el token de autentificacion para
// /verfy del backend
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    console.log('Token enviado en la solicitud:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (token) {
      // Añadir el prefijo "Bearer" al token
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