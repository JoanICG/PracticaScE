import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  CircularProgress,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar,
  InputAdornment
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import api from '../../services/api';
// Pagina el cual tiene el administrador para gestionar los pedidos, puede cambiar los estados de los pedidos

// Variables de estado para la pagina de pedidos
const OrdersAdminPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);
  // Funcion que se encarga de pedir al backend la informacion de los pedidos
  const fetchOrders = async () => {
    try {
      // Cambiamos la variable de estado de loading
      setLoading(true);
      // Pedimos al backend que nos de toda la informacion de los pedidos
      const response = await api.get('/admin/orders');
      // Si la respuesta es correcta, guardamos los pedidos en el estado
      setOrders(response.data.data.orders);
      setFilteredOrders(response.data.data.orders);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      setError('Error al cargar los pedidos: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filtrar por término de búsqueda y estado
    let filtered = orders;
    // Filtrar por estado si no es "all"
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    // En caso de que tengamos una busqueda, entramos en el if
    if (searchTerm) {
      // Filtramos los pedidos dependiendo de la busqueda
      filtered = filtered.filter(order => 
        (order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    // Guardamos el array de pedidos filtrados
    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);
  // Modificacion de la variable de busqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  // Modificacion de la variable de busqueda
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };
  // Funcion que se encarga de abrir el dialogo para cambiar el estado del pedido
  const handleOpenStatusDialog = (orderId, currentStatus) => {
    setSelectedOrderId(orderId);
    setSelectedStatus(currentStatus);
    setOpenDialog(true);
  };
  // Funcion que se encarga de cerrar el dialogo para cambiar el estado del pedido
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  // Funcion que se encarga de modificar el estado del pedido
  const handleUpdateOrderStatus = async () => {
    try {
      setLoadingUpdate(true);
      // Cambiamos el estado del pedido
      await api.put('/admin/orders/update-status', {
        orderId: selectedOrderId,
        status: selectedStatus
      });
      
      // Directamente actaulizamos el estado de los pedidos en la interfaz
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === selectedOrderId ? {...order, status: selectedStatus} : order
        )
      );
      // Mostramos un mensaje de exito en el snackbar
      setSnackbarMessage('Estado del pedido actualizado correctamente');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setSnackbarMessage('Error al actualizar estado: ' + (error.response?.data?.message || error.message));
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoadingUpdate(false);
    }
  };
  // Como en los pedidos del usuario no administrador aqui hemos echo lo mismo, 
  // cambiamos el color i el texto dependiendo del estado del pedido
  const getStatusLabel = (status) => {
    switch(status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'En proceso';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Pedidos
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buscar por cliente o ID"
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
          </Grid>
          <Grid container spacing={2}>
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <FormControl fullWidth>
                <InputLabel>Filtrar por estado</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filtrar por estado"
                  onChange={handleStatusFilterChange}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="pending">Pendiente</MenuItem>
                  <MenuItem value="processing">En proceso</MenuItem>
                  <MenuItem value="shipped">Enviado</MenuItem>
                  <MenuItem value="delivered">Entregado</MenuItem>
                  <MenuItem value="cancelled">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {filteredOrders.length > 0 ? (
        filteredOrders.map(order => (
          <Accordion key={order.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Pedido #{order.id.substring(0, 8)}
                  </Typography>
                  <Typography variant="body2">
                    {order.customer.name} ({order.customer.email})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={getStatusLabel(order.status)} 
                    color={getStatusColor(order.status)} 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2">
                    {new Date(order.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Información del Cliente
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" fontWeight="bold">Nombre:</Typography>
                      <Typography variant="body1">{order.customer.name}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" fontWeight="bold">Email:</Typography>
                      <Typography variant="body1">{order.customer.email}</Typography>
                    </Box>
                    {order.shippingAddress && (
                      <Box>
                        <Typography variant="body1" fontWeight="bold">Dirección de envío:</Typography>
                        <Typography variant="body1">{order.shippingAddress}</Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Detalles del Pedido
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Producto</TableCell>
                            <TableCell align="right">Precio</TableCell>
                            <TableCell align="right">Cantidad</TableCell>
                            <TableCell align="right">Subtotal</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {order.orderItems.map(item => (
                            <TableRow key={item.id}>
                              <TableCell>{item.product.name}</TableCell>
                              <TableCell align="right">
                                {parseFloat(item.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                              </TableCell>
                              <TableCell align="right">{item.quantity}</TableCell>
                              <TableCell align="right">
                                {(parseFloat(item.price) * item.quantity).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                              Total:
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                              {parseFloat(order.totalAmount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel>Estado del pedido</InputLabel>
                      <Select
                        value={order.status}
                        label="Estado del pedido"
                        onChange={(e) => handleOpenStatusDialog(order.id, e.target.value)}
                      >
                        <MenuItem value="pending">Pendiente</MenuItem>
                        <MenuItem value="processing">En proceso</MenuItem>
                        <MenuItem value="shipped">Enviado</MenuItem>
                        <MenuItem value="delivered">Entregado</MenuItem>
                        <MenuItem value="cancelled">Cancelado</MenuItem>
                      </Select>
                    </FormControl>
                    <Typography variant="body2" color="text.secondary">
                      ID del pedido: {order.id}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <InfoIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6">No se encontraron pedidos</Typography>
          <Typography variant="body1" color="text.secondary">
            {searchTerm || statusFilter !== 'all' ? 
              'Intenta cambiar tus filtros de búsqueda' : 
              'Aún no hay pedidos en el sistema'}
          </Typography>
        </Paper>
      )}

      {/* Diálogo de confirmación para cambio de estado */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar cambio de estado</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas cambiar el estado del pedido a "{getStatusLabel(selectedStatus)}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loadingUpdate}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateOrderStatus} 
            variant="contained" 
            color="primary"
            disabled={loadingUpdate}
          >
            {loadingUpdate ? <CircularProgress size={24} /> : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrdersAdminPage;