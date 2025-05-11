import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions,
  Button,
  CircularProgress,
  Box,
  TextField,
  InputAdornment,
  Rating
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
//En primer lugar esta es la pagina de productos el qual seria la pagina principal de la tienda, donde se mostraran todos los productos disponibles en la tienda.

// Aqui añadimos els hooks de react pedidos para el funcionamiento de la pagina
// Aqui tenemos la variables d'estados que nos ayudaran a gestionar la pagina
// podemos ver que todas estan en null o vacias, ya que no tienen un valor inicial sino 
// que es necessario modificar de forma dinamica su estado en otro momento
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  //Utilizamos este hook para obtener los productos del backend.
  useEffect(() => {
    //esta funcion asincrona nos permite hace solicitudes HTTP al backend para obtener la lista de productos
    const fetchProducts = async () => {
      try {
        // Solicitud GET para obtener la lista
        const response = await api.get('/products');
        // Actualizamos el estado de los productos con la respuesta del backend
        setProducts(response.data.data.products);
        // En caso de haver un filtro o busqueda, actualizamos el estado de los productos filtrados
        setFilteredProducts(response.data.data.products);
        // Cambiamos el estado de carga
        setLoading(false);
        // En caso de haver un error, actualizamos el estado de error
      } catch (error) {
        console.error('Error al obtener productos:', error);
        setError('Error al cargar los productos');
        setLoading(false);
      }
    };

    fetchProducts();
  // Como podemos ver este hook solo se ejecutara una sola vez para cargar los productos
  }, []);
  // Hook para los productos filtrados
  useEffect(() => {
    // Se activa en el momento que el usuario hace una busqueda
    // i almacena el resultado en serchTerm
    if (searchTerm) {
      // Como tenemos filtro, usamos la siguiente metodologia para filtrar
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  // Funcion en caso de querer añadir un producto al carrito
  const handleAddToCart = async (productId) => {
    // En caso de no estar verificada se redirige a la pagina de login
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // En caso de estar verificada se hace una peticion al backend para añadir el producto al carrito del usuario
    try {
      await api.post('/cart/add', {
        productId,
        // Decision de disenyo "Como no podemos añadir la cantidad de producto quiere decir que cada vez que se pulse el boton solo se añadira una vez"
        quantity: 1
      });
      alert('Producto añadido al carrito');
    } catch (error) {
      console.error('Error al añadir al carrito:', error);
      alert(error.response?.data?.message || 'Error al añadir al carrito');
    }
  };
  // En caso de cargar productos tenemos que mostrar un loading que esta echo en Material UI
  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  // En caso de error al cargar los productos, se muestra un mensaje de error
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }
  // Esilo elegido par hacer la pagina de productos al estilo Amazon
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        RC
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Buscar productos"
          // En el campo de busqueda en estas dos variables se alamazenara el valor
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
      <Grid container spacing={2}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={product.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  border: '1px solid #e3e3e3',
                  transition: 'transform 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'scale(1.02)'
                  }
                }}
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <Box sx={{ position: 'relative', pt: '100%' }}>
                  <CardMedia
                    component="img"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      p: 1
                    }}
                    // En caso de tener imagen ponemos la que hay o sino una por defecto
                    image={product.imageUrl || 'https://via.placeholder.com/300x300?text=Coche+Teledirigido'}
                    alt={product.name}
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 1.5, pb: 0 }}>
                  <Typography 
                    gutterBottom 
                    variant="subtitle1" 
                    component="h2" 
                    sx={{
                      fontWeight: 'normal',
                      fontSize: '0.9rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      height: '2.8em',
                      lineHeight: '1.4em'
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Rating value={4.5} precision={0.5} size="small" readOnly />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, fontSize: '0.75rem' }}>
                      (4.5)
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mt: 1, 
                      color: '#B12704',
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}
                  >
                    {parseFloat(product.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block',
                      color: product.stock > 0 ? '#007600' : '#B12704',
                      mt: 0.5
                    }}
                  >
                    {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 1.5, pt: 0.5 }}>
                  <Button 
                    size="small" 
                    fullWidth
                    sx={{
                      bgcolor: '#FFD814',
                      color: '#0F1111',
                      borderColor: '#FCD200',
                      borderRadius: '20px',
                      textTransform: 'none',
                      fontWeight: 'normal',
                      '&:hover': {
                        bgcolor: '#F7CA00',
                        borderColor: '#F2C200'
                      }
                    }}
                    startIcon={<AddShoppingCartIcon />}
                    // Botton para añadir al carrito
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product.id);
                    }}
                    disabled={product.stock <= 0}
                  >
                    Añadir al carrito
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography align="center">No se encontraron productos</Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default ProductsPage;