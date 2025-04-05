import Cookies from 'js-cookie';

// Nombres de cookies
const TOKEN_COOKIE_NAME = 'auth_token';
const USER_COOKIE_NAME = 'user_data';
const COOKIE_EXPIRY = 1; // días

// Guardar token en cookie
export const setAuthToken = (token) => {
  Cookies.set(TOKEN_COOKIE_NAME, token, { expires: COOKIE_EXPIRY });
};

// Obtener token de cookie
export const getAuthToken = () => {
  return Cookies.get(TOKEN_COOKIE_NAME);
};

// Eliminar token de cookie
export const removeAuthToken = () => {
  Cookies.remove(TOKEN_COOKIE_NAME);
};

// Guardar datos de usuario en cookie
export const setUserData = (userData) => {
  Cookies.set(USER_COOKIE_NAME, JSON.stringify(userData), { expires: COOKIE_EXPIRY });
};

// Obtener datos de usuario de cookie
export const getUserData = () => {
  const userData = Cookies.get(USER_COOKIE_NAME);
  return userData ? JSON.parse(userData) : null;
};

// Eliminar datos de usuario de cookie
export const removeUserData = () => {
  Cookies.remove(USER_COOKIE_NAME);
};

// Limpiar todas las cookies de autenticación
export const clearAuthCookies = () => {
  removeAuthToken();
  removeUserData();
};