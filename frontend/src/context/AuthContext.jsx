import { createContext, useState, useEffect } from 'react';
import { getAuthToken, setAuthToken, clearAuthCookies, setUserData, getUserData } from '../utils/cookies';
import api, { authAPI } from '../services/api';
import Cookies from 'js-cookie'; // Asegúrate de que Cookies esté importado

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si el usuario ya está logueado (desde cookie)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = getAuthToken();
        const userData = getUserData();
        
        if (token && userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error al verificar estado de autenticación:', error);
        clearAuthCookies();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Registrar un nuevo usuario
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(userData);
      const { token, customer } = response.data.data;
      
      setAuthToken(token);
      setUserData(customer);
      setUser(customer);
      return customer;
    } catch (error) {
      const message = error.response?.data?.message || 'Error en el registro';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Modifica tu función login:
  const login = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(userData);
      
      if (response.data.success) {
        const { token, customer } = response.data.data;
        
        console.log('Token recibido:', token ? token.substring(0, 20) + '...' : 'No token');
        console.log('Usuario recibido:', customer);
        
        setAuthToken(token);
        setUserData(customer);
        setUser(customer);
        
        return true;
      }
    } catch (error) {
      console.error("Error de login:", error);
      setError(error.response?.data?.message || "Error al iniciar sesión");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout de usuario
  const logout = () => {
    clearAuthCookies();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isAuthenticated: !!user,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};