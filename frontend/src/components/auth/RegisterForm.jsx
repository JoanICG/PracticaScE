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
// Formulario para el registro de un usuario

const RegisterForm = () => {
  // Variables de estado para el formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const { register, login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  // Para el cambio de valores en el formulario tenemos esta funcion
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpiar error cuando el usuario escribe
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  // Funcion para validor el formulario
  const validateForm = () => {
    const errors = {};
    // Comprobamos si han puesto nombre
    if (!formData.name) {
      errors.name = 'El nombre es obligatorio';
    }
    // Comprobamos si han puesto email
    if (!formData.email) {
      errors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    // Comprobamos si han puesto contraseña
    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    // Comprobamos si han puesto confirmación de contraseña
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Por favor confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Funcion para enviar el formulario de registro
  const handleSubmit = async (e) => {
    // Evitamos que se recargue la pagina
    e.preventDefault();
    // Primero validamos si el usuario ha puesto correctamente los datos
    if (!validateForm()) return;
    
    // Ya que no necessitamos el confirmPassword para el registro lo eliminamos
    const { confirmPassword, ...registerData } = formData;
    
    try {
      // Enviamos el formulario de registro al backend
      await register(registerData);
      // Para que el usuario despues no se tenga que logear, directamente lo logeamos
      // Cogemos los datos que el usuario nos ha facilitado para logearlo
      const loginData = {
        email: registerData.email,
        password: registerData.password
      };
      try {
        const loginResponse = await login(loginData);
        console.log('Inicio de sesión exitoso:', loginResponse);
      } catch (error) {
        console.error('Error de inicio de sesión:', error.message);
      }
      navigate('/');
    } catch (error) {
      console.error('Error de registro:', error.message);
    }
  };
  // Formulario utilizado para el registro
  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Registro
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Nombre Completo"
          name="name"
          autoComplete="name"
          autoFocus
          value={formData.name}
          onChange={handleChange}
          error={!!formErrors.name}
          helperText={formErrors.name}
          disabled={isLoading}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Correo Electrónico"
          name="email"
          autoComplete="email"
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
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          error={!!formErrors.password}
          helperText={formErrors.password}
          disabled={isLoading}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirmar Contraseña"
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={!!formErrors.confirmPassword}
          helperText={formErrors.confirmPassword}
          disabled={isLoading}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Registrarse'}
        </Button>
        
        <Box textAlign="center">
          <Typography variant="body2">
            ¿Ya tienes cuenta?{' '}
            <RouterLink to="/login" style={{ textDecoration: 'none' }}>
              Iniciar Sesión
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default RegisterForm;