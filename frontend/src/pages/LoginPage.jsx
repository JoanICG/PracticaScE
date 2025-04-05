import { Box, Container, Typography } from '@mui/material';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          Bienvenido de nuevo
        </Typography>
        <LoginForm />
      </Box>
    </Container>
  );
};

export default LoginPage;