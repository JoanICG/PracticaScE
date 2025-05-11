import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Box, CircularProgress } from '@mui/material';
// Es parte del route el qual consiste en que accedemos al authContext que tiene un valor booleanos
// para comprobar si hay algun usuario logueado o no, i luego en esta funcion dejaremos que los usuarios accedan o no 
// a unas rutas otras dependiendo de si hay un usuario logueado o no
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;