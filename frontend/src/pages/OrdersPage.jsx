import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
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
  CircularProgress,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
//Esta pagina se encarga de mostrar los pedidos que ha realizado el usuario
//Variables de estado sobre la pagina de mis pedidos
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  //Llamada a la API para obtener los pedidos
  useEffect(() => {
    fetchOrders();
  }, []);
  // Funcion para obtener los pedidos que pedios al Backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Pedimos nustros pedidos al backend
      const response = await api.get('/orders/my-orders');
      // Si la respuesta es correcta, guardamos los pedidos en el estado
      setOrders(response.data.data.orders);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      setError('Error al cargar los pedidos');
      setLoading(false);
    }
  };
  // Para hacerlo mas estetico lo que hemos echo es que dependiendo del estado del pedido cambiamos el color dentro de la pagina
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
  // Por otro lado cambiaremos el estado de ingles a español para hacerlo mas estetico
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
  // Como en los otros programas en caso de estar cargando o de algun error hacemos estos dos if
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
  // Estilo elegido para hacer la pagina de mis pedidos estitca
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mis Pedidos
      </Typography>

      {orders.length > 0 ? (
        orders.map((order) => (
          <Accordion key={order.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Typography>
                  Pedido: {order.id.substring(0, 8)}...
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    // En este caso hacemos que dependiendo del estado que nos devuelva el backend, se le asigne un color diferente
                    // y un texto diferente
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
            {/* Para hacerlo mas estetico hacemos que pulsando un boton se vean mas detalles sobre el pedido realizado */}
            <AccordionDetails>
              <Typography variant="subtitle1" gutterBottom>
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
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No tienes pedidos todavía
          </Typography>
          <Typography variant="body1" paragraph>
            Explora nuestra tienda y encuentra los mejores coches teledirigidos para hacer tu primer pedido.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<ShoppingBagIcon />}
            onClick={() => navigate('/')}
          >
            Ir a la tienda
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default OrdersPage;