import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm"; // Crearás este componente
import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Divider,
  Badge
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const stripePromise = loadStripe("pk_test_51RMVXe4FE38O7zRrFoDEZ9JKdAdwn9I3jebSGHYr3MgyjyNuROWPyi4UxROyJoFR0PMc9OrLC3ULFJUnO3t4qbeZ006ZtZKmAm");

const CartPage = () => {
  const [cart, setCart] = useState({ orderItems: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data.data.cart);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener carrito:', error);
      setError('Error al cargar el carrito');
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      const response = await api.put('/cart/update-item', {
        itemId: itemId,         // Asegúrate de usar exactamente este nombre
        quantity: newQuantity   // Asegúrate de usar exactamente este nombre
      });
      
      // Actualizar el estado local con la respuesta
      setCart(response.data.data.cart);
    } catch (error) {
      console.error('Error al actualizar la cantidad:', error);
      alert(error.response?.data?.message || 'Error al actualizar el carrito');
    }
  };
  
  const handleCheckout = () => {
    // Solo navegar a la página de checkout
    navigate('/checkout');
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

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tu Carrito
      </Typography>

      <IconButton 
        onClick={() => navigate('/cart')} 
        color="inherit"
        size="large"
      >
        <Badge color="secondary" badgeContent={0}>
          <ShoppingCartIcon />
        </Badge>
      </IconButton>

      {cart.orderItems.length > 0 ? (
        <>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="center">Precio</TableCell>
                  <TableCell align="center">Cantidad</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.orderItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell component="th" scope="row">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          component="img"
                          sx={{ width: 50, height: 50, mr: 2, objectFit: 'cover' }}
                          src={item.product.imageUrl || 'https://via.placeholder.com/50'}
                          alt={item.product.name}
                        />
                        <Typography variant="body1">{item.product.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {parseFloat(item.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={updating}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField
                          size="small"
                          value={item.quantity}
                          disabled
                          sx={{ width: 50, mx: 1, '& input': { textAlign: 'center' } }}
                        />
                        <IconButton 
                          size="small" 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={updating || item.quantity >= item.product.stock}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {(parseFloat(item.price) * item.quantity).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color="error" 
                        onClick={() => handleUpdateQuantity(item.id, 0)}
                        disabled={updating}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Subtotal:</Typography>
              <Typography variant="h6">
                {parseFloat(cart.totalAmount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1">Envío:</Typography>
              <Typography variant="body1">
                {parseFloat(0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold">Total:</Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {parseFloat(cart.totalAmount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              fullWidth 
              size="large" 
              startIcon={<ShoppingCartCheckoutIcon />}
              onClick={handleCheckout}
            >
              Finalizar Compra
            </Button>
          </Paper>
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Tu carrito está vacío
          </Typography>
          <Typography variant="body1" paragraph>
            ¿Aún no has añadido productos? Explora nuestra tienda y encuentra los mejores coches teledirigidos.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
          >
            Ver Productos
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default CartPage;