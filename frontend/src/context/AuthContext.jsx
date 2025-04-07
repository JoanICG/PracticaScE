import { createContext, useState, useEffect } from 'react';
import api, { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await authAPI.verifyAuth();
        if (response.data.success) {
          setUser(response.data.data.user);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Registrar usuario
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(userData);
      if (response.data.success) {
        // Con cookies HttpOnly, no necesitamos manejar el token aquí
        setUser(response.data.data.customer);
        return response.data.data.customer;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error en el registro';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Login de usuario
  const login = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(userData);
      if (response.data.success) {
        // Con cookies HttpOnly, solo necesitamos los datos del usuario
        setUser(response.data.data.customer);
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
  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
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