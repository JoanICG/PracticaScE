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
  Badge,
  Grid,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
// Es la pagina del carrito donde podremos ver que productos hemos añadido para despues comprarlos
// Conjunta de variables d'estado para el carrito
const CartPage = () => {
  const [cart, setCart] = useState({ orderItems: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  // Funcion que se encarga de pedir al backend la informacion del carrito
  const fetchCart = async () => {
    try {
      // Cambiamos la variable de estado de loading
      setLoading(true);
      // Pedimos al backend que nos de la informacion del carrito
      const response = await api.get('/cart');
      // Cogemos la lista de productos que ha añadido el usuario
      setCart(response.data.data.cart);
      // Modificamos la variable d'estado de loading
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener carrito:', error);
      setError('Error al cargar el carrito');
      setLoading(false);
    }
  };
  // Modificacion o eliminacion del producto al carrito
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      // En caso de modificar la cuantidad de un produto o querer eliminar añadimos este put
      // para modificar la cantidad del producto al backend
      const response = await api.put('/cart/update-item', {
        itemId: itemId,       
        quantity: newQuantity 
      });
      
      // Modificamos la lista de productos localmente
      setCart(response.data.data.cart);
    } catch (error) {
      console.error('Error al actualizar la cantidad:', error);
      alert(error.response?.data?.message || 'Error al actualizar el carrito');
    }
  };
  // Funcion que nos redirige a la pagina de checkout para realizar la compra  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  // Funcion que se encarga de que si la variable loading es true nos muestre un loading
  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  // Funciuon que se encarga de que si hay un error nos muestre el error
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }
  // Este es el estilo utilizado para la pagina del carrito
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
                        {/*Boton el qual llama a la funcio para modificar el estado del producto*/}
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
                        {/*Boton el qual llama a la funcio para modificar el estado del producto*/}
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
                      {/*Boton que elimina el producto de la lista*/}
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
            <Grid container spacing={2}>
              <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Productos
                </Typography>
                <List>
                  {cart.orderItems.map((item) => (
                    <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
                      <ListItemText
                        primary={item.product.name}
                        secondary={`Cantidad: ${item.quantity}`}
                      />
                      <Typography variant="body2">
                        {(parseFloat(item.price) * item.quantity).toLocaleString('es-ES', { 
                          style: 'currency', 
                          currency: 'EUR' 
                        })}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
            {/* Botón para finalizar la compra */}
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