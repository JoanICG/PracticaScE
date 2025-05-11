import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button,
  Box,
  Chip
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
// Esta pagina se encarga de mostrar los repuestos que hay en la tienda de cada coche radio control


const SparePart = ({ sparePart }) => {
  // Devuelve un valor booleano que indica si el usuario esta logueado o no
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    // Si el usuario no esta logueado lo redirigimos a la pagina de login
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Si el usuario esta logueado lo que hacemos es añadir el repuesto al carrito
    try {
      await api.post('/cart/add', {
        sparePartId: sparePart.id,
        quantity: 1
      });
      // Si la respuesta es correcta, mostramos un mensaje de exito
      alert('Repuesto añadido al carrito');
    } catch (error) {
      console.error('Error al añadir repuesto al carrito:', error);
      alert(error.response?.data?.message || 'Error al añadir al carrito');
    }
  };
  // Estilo de la tarjeta del repuesto
  return (
    <Card sx={{ display: 'flex', mb: 2, height: '140px' }}>
      {sparePart.imageUrl && (
        <CardMedia
          component="img"
          sx={{ width: 140, objectFit: 'contain' }}
          image={sparePart.imageUrl}
          alt={sparePart.name}
        />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent sx={{ flex: '1 0 auto', py: 1 }}>
          <Typography variant="subtitle1" component="div" fontWeight="bold">
            {sparePart.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {sparePart.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Box>
              <Typography component="span" variant="h6" color="primary.main" fontWeight="bold">
                {Number(sparePart.price).toFixed(2)}€
              </Typography>
              <Chip 
                label={sparePart.stock > 0 ? `${sparePart.stock} disponibles` : 'Agotado'} 
                color={sparePart.stock > 0 ? 'success' : 'error'}
                size="small"
                sx={{ ml: 1 }}
              />
            </Box>
            <Button 
              size="small" 
              variant="contained" 
              startIcon={<AddShoppingCartIcon />} 
              onClick={handleAddToCart}
              disabled={sparePart.stock <= 0}
            >
              Añadir
            </Button>
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
};

export default SparePart;