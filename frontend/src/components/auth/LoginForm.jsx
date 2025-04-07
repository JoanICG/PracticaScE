import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  Paper
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  // Manejar cambio en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpiar error cuando el usuario escribe
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const result = await login(formData);
      if (result) {
        // Navegamos a la página principal solo si el login fue exitoso
        navigate('/');
      }
    } catch (error) {
      console.error('Error de login:', error.message);
      // Los errores deberían manejarse en el contexto de autenticación
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Iniciar Sesión
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Correo Electrónico"
          name="email"
          autoComplete="email"
          autoFocus
          value={formData.email}
          onChange={handleChange}
          error={!!formErrors.email}
          helperText={formErrors.email}
          disabled={isLoading}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Contraseña"
          type="password"
          id="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          error={!!formErrors.password}
          helperText={formErrors.password}
          disabled={isLoading}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Entrar'}
        </Button>
        
        <Box textAlign="center">
          <Typography variant="body2">
            ¿No tienes cuenta?{' '}
            <RouterLink to="/register" style={{ textDecoration: 'none' }}>
              Regístrate
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default LoginForm;