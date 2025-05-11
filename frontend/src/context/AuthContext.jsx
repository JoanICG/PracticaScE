import { createContext, useState, useEffect } from 'react';
import api, { authAPI } from '../services/api';
// Pagina para los formularios de login y registro, es el que envia todas las peticiones al backend
export const AuthContext = createContext();

// Proveedor de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // En primer lugar verificamos si el usuario ya esta logueado, gracias al JWT i sus tokens
        const response = await authAPI.verifyAuth();
        // En caso de ser cierto guardamos el usuario en el estado
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
  // Funcion para registrar un nuevo usuario al backend
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Enviamos el formulario de registro al backend
      const response = await authAPI.register(userData);
      // En caso de ser correcto guardamos el usuario en el estado
      if (response.data.success) {
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
  // Funcion para loguear al usuario
  const login = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Enviamos el formulario de login al backend
      const response = await authAPI.login(userData);
      // En caso de ningun error guardamos el usuario en el estado
      if (response.data.success) {
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
  // Funcion para cerrar sesion
  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };
  // Añadiomos en el authContext el usuario, el loading, el error y las funciones de login, logout y register
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isAuthenticated: !!user,  //Return strict boolean
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};