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

const SparePart = ({ sparePart }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/cart/add', {
        sparePartId: sparePart.id,
        quantity: 1
      });
      alert('Repuesto añadido al carrito');
    } catch (error) {
      console.error('Error al añadir repuesto al carrito:', error);
      alert(error.response?.data?.message || 'Error al añadir al carrito');
    }
  };

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