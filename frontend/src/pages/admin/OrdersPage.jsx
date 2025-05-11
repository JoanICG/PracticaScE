import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  TextField,
  Box,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../../services/api';
// Pagina el qual tiene el administrador para gestionar los pedidos, puede cambiar los estados de los pedidos

// Variables de estado para la pagina de pedidos
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);
  // Funcion que se encarga de pedir al backend la informacion de los pedidos
  const fetchOrders = async () => {
    try {
      // Pedimos al backend que nos de toda la informacion de los pedidos
      const response = await api.get('/admin/orders');
      // Añadimos la lista de pedidos a un estado local
      setOrders(response.data.data.orders);
      setFilteredOrders(response.data.data.orders);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      setError('Error al cargar los pedidos');
      setLoading(false);
    }
  };
  // En caso de que haya un cambio en la busqueda o en los pedidos accedemos
  useEffect(() => {
    // En caso de que el administrador busque un pedido
    if (searchTerm) {
      // Filtramos los pedidos dependiendo de la busqueda
      const filtered = orders.filter(order => 
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.includes(searchTerm)
      );
      // Guardamos el array de pedidos filtrados
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchTerm, orders]);
  // Cambiamos el estado de la busqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  // Cambiamos el estado del pedido, de forma local
  const handleStatusChange = (orderId, status) => {
    setSelectedOrderId(orderId);
    setNewStatus(status);
    setDialogOpen(true);
  };
  // Cambiamos el estado del pedido en el backend i en caso de error lo mostramos en un popup
  const handleConfirmStatusChange = async () => {
    try {

      setStatusUpdateLoading(true);
      // Enviamos la peticion al backend para cambiar el estado del pedido
      await api.put('/admin/orders/update-status', {
        orderId: selectedOrderId,
        status: newStatus
      });
      // Como hemos cambiado el estado volvemos a pedir al backend la lista de pedidos ya que el estado de ese pedido
      // debera de cambiar
      await fetchOrders();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert(error.response?.data?.message || 'Error al actualizar el estado');
    } finally {
      setStatusUpdateLoading(false);
    }
  };
  // Como en los pedidos del usuario no administrador aqui hemos echo lo mismo, 
  // cambiamos el color i el texto dependiendo del estado del pedido
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'En proceso';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
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
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }
  // Estilo ultilidado en la pagina de pedidos del administrador
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Pedidos
      </Typography>
      {/* Campo de búsqueda */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Buscar por cliente o ID de pedido"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Box>
      {/* Mostrar pedidos filtrados */}
      {filteredOrders.length > 0 ? (
        filteredOrders.map((order) => (
          <Accordion key={order.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Typography>
                  Pedido: {order.id.substring(0, 8)}... - Cliente: {order.customer.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {/* Dependiendo del estado se modificara el CSS */}
                  <Chip 
                    label={getStatusLabel(order.status)} 
                    color={getStatusColor(order.status)} 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            {/* En el caso de que el administrador quiera ver mas detalles accederiamos aqui
            para ver todos los detalles del pedido*/}
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Información del cliente:
                </Typography>
                <Typography>Nombre: {order.customer.name}</Typography>
                <Typography>Email: {order.customer.email}</Typography>
                {order.shippingAddress && (
                  <Typography>Dirección: {order.shippingAddress}</Typography>
                )}
              </Box>

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Detalles del pedido:
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Precio unitario</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.orderItems.map((item) => (
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
                      <TableCell colSpan={3} align="right">
                        <Typography variant="subtitle1">Total:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1">
                          {parseFloat(order.totalAmount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Box para cambiar el estado del pedido */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">Cambiar estado:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormControl sx={{ minWidth: 200, mr: 2 }}>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={order.status}
                      label="Estado"
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      <MenuItem value="pending">Pendiente</MenuItem>
                      <MenuItem value="processing">En proceso</MenuItem>
                      <MenuItem value="shipped">Enviado</MenuItem>
                      <MenuItem value="delivered">Entregado</MenuItem>
                      <MenuItem value="cancelled">Cancelado</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Paper sx={{ p: 2 }}>
          <Typography align="center">No se encontraron pedidos</Typography>
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Dirección de envío</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customer?.email || 'N/A'}</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  {parseFloat(order.totalAmount).toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                  })}
                </TableCell>
                <TableCell>
                  {order.shippingAddress || 'No especificada'}
                </TableCell>
                <TableCell>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de confirmación */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirmar cambio de estado</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas cambiar el estado del pedido a "{getStatusLabel(newStatus)}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={statusUpdateLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmStatusChange} 
            color="primary" 
            disabled={statusUpdateLoading}
            variant="contained"
          >
            {statusUpdateLoading ? <CircularProgress size={24} /> : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrdersPage;