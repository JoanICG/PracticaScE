import { Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Button 
      color="inherit" 
      onClick={handleLogout}
      startIcon={<LogoutIcon />}
    >
      Cerrar Sesión
    </Button>
  );
};

export default LogoutButton;

// En AuthContext.jsx asegúrate de que tienes esto:
const logout = () => {
  clearAuthCookies(); // Asegúrate de que esta función elimine todas las cookies
  setUser(null);
};