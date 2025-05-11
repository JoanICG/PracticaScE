import { Box, Container, Typography } from '@mui/material';
import RegisterForm from '../components/auth/RegisterForm';
// Pagina de registro del usuario donde llamaremos al formulario de registros llamado "RegisterForm"
const RegisterPage = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          Crear una cuenta
        </Typography>
        <RegisterForm />
      </Box>
    </Container>
  );
};

export default RegisterPage;