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
// Pagina del administrador para gestionar los usuarios
// Variables de estado para la pagina de usuarios
const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);
  // Funcion que se encarga de pedir al backend la informacion de los usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Pedimos al backend que nos de toda la informacion de los usuarios
      const response = await api.get('/admin/users');
      
      // Obtenemos la lista de los usuarios i los guardamos en un estado local
      setUsers(response.data.data.users);
      setFilteredUsers(response.data.data.users);

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
  // En caso de que cambie de estado el usuario o la variable de busqueda el que hacemos es mostrar
  // los usuarios dependiendo de la busqueda
  useEffect(() => {
    // Añadimos un array para evitar errors en caso de que haya algun error en los usuarios
    const usersArray = users || [];
    // En caso de tener una busqueda entramos en el if
    if (searchTerm) {
      // Filtramos los usuarios dependiendo de la busqueda
      const filtered = usersArray.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      // Guardamos el array de usuarios filtrados
      setFilteredUsers(filtered);
    } else {
      // En caso de no haver el que hacemos es mostrar una lista vacia
      setFilteredUsers(usersArray);
    }
  }, [users, searchTerm]);
  // Modifiacion de la variable de busqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  // En caso de estar cargando o de haver un error mostramos un loading o un error
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

  // Filtro de usuarios para mostrar solo los que coinciden con la busqueda, utilizamos esto para los errores de renderizado
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
          // Icono de busqueda
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