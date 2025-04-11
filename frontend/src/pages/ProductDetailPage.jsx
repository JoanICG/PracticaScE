import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Button, 
  Divider, 
  Paper, 
  CircularProgress,
  Rating, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableRow
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await api.get(`/products/${productId}`);
        setProduct(response.data.data.product);
      } catch (error) {
        console.error('Error al obtener detalles del producto:', error);
        setError('No se pudo cargar la información del producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/cart/add', {
        productId,
        quantity: 1
      });
      alert('Producto añadido al carrito');
    } catch (error) {
      console.error('Error al añadir al carrito:', error);
      alert(error.response?.data?.message || 'Error al añadir al carrito');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{error || 'Producto no encontrado'}</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/products')}>
          Volver a productos
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/products')}
        sx={{ mb: 2 }}
      >
        Volver a productos
      </Button>
      
      <Grid container spacing={4}>
        {/* Imagen del producto */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={1}
            sx={{ 
              p: 2, 
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img 
              src={product.imageUrl || 'https://via.placeholder.com/500x500?text=Coche+Teledirigido'} 
              alt={product.name}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          </Paper>
        </Grid>
        
        {/* Información del producto */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom>
            {product.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={4.5} precision={0.5} readOnly />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              (4.5) - 24 valoraciones
            </Typography>
          </Box>
          
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#B12704',
              fontWeight: 'bold',
              mb: 2
            }}
          >
            {parseFloat(product.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3,
              color: product.stock > 0 ? '#007600' : '#B12704',
              fontWeight: 'medium'
            }}
          >
            {product.stock > 0 ? `${product.stock} unidades disponibles` : 'Agotado'}
          </Typography>
          
          <Button 
            variant="contained"
            size="large"
            fullWidth
            startIcon={<AddShoppingCartIcon />}
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            sx={{
              bgcolor: '#FFD814',
              color: '#0F1111',
              borderColor: '#FCD200',
              '&:hover': {
                bgcolor: '#F7CA00',
                borderColor: '#F2C200'
              }
            }}
          >
            Añadir al carrito
          </Button>
        </Grid>
        
        {/* Descripción detallada */}
        <Grid item xs={12}>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h5" component="h2" gutterBottom>
            Descripción
          </Typography>
          <Typography variant="body1" paragraph>
            {product.description}
          </Typography>
          
          {product.detailedDescription && (
            <Typography variant="body1" paragraph>
              {product.detailedDescription}
            </Typography>
          )}
        </Grid>
        
        {/* Especificaciones técnicas */}
        {product.specifications && (
          <Grid item xs={12}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2 }}>
              Especificaciones técnicas
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                      </TableCell>
                      <TableCell>{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default ProductDetailPage;