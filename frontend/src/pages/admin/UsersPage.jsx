import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../services/api';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      
      // Verificar que la respuesta tenga la estructura esperada
      if (response.data && response.data.success && response.data.data && response.data.data.users) {
        setUsers(response.data.data.users);
        setFilteredUsers(response.data.data.users);
      } else {
        // Si la respuesta no tiene la estructura esperada, establecer un array vacío
        setUsers([]);
        setFilteredUsers([]);
        setError('La respuesta del servidor no tiene el formato esperado');
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setError('Error al cargar los usuarios: ' + (error.response?.data?.message || error.message));
      // Establecer arrays vacíos para evitar errores al acceder a 'length'
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Si users es undefined o null, usar un array vacío para evitar errores
    const usersArray = users || [];
    
    if (searchTerm) {
      const filtered = usersArray.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(usersArray);
    }
  }, [users, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Asegurar que filteredUsers siempre sea un array para evitar errores
  const usersToDisplay = Array.isArray(filteredUsers) ? filteredUsers : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Usuarios
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Buscar usuario"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Fecha de registro</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersToDisplay.length > 0 ? (
              usersToDisplay.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role || 'customer'}</TableCell>
                  <TableCell>
                    {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No hay usuarios para mostrar
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default UsersPage;