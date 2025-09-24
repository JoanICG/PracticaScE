import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  TextField, 
  Button, 
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
// Eliminamos Stripe.js: usaremos Stripe Checkout (hosted)
// Esta pagina se encarga de gestionar todo el processo de compra, tanto de la direccions, como la lista de los productos, como la metodologia de pago que en nuestro caso es con Stripe
// Estos son los pasos que seguira el checkout cada vez que pulse el boton de siguiente
const steps = ['Dirección de envío', 'Revisar pedido', 'Pago', 'Pedido completado'];
// Variables d'estado sobre la pagina de checkout
const CheckoutPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [cart, setCart] = useState({ orderItems: [], totalAmount: 0 });
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const navigate = useNavigate();
  // Persistimos dirección para regresar desde Stripe
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  // Llamamos a la API para obtener el carrito
  useEffect(() => {
    const init = async () => {
      await fetchCart();
      // Restaurar dirección si existe en sessionStorage (volviendo de Stripe)
      const savedAddress = sessionStorage.getItem('checkout_shipping_address');
      if (savedAddress) setShippingAddress(savedAddress);

      // Manejo de retorno desde Stripe Checkout
      const params = new URLSearchParams(window.location.search);
      const success = params.get('success');
      const canceled = params.get('canceled');
      const sessionId = params.get('session_id');
      if (success === 'true' && sessionId) {
        await handlePaymentSuccessCheckout(sessionId);
        // Limpiamos query params para evitar reintentos al refrescar
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (canceled === 'true') {
        setError('Pago cancelado. Puedes intentarlo de nuevo.');
        setActiveStep(2);
        // Limpiar params
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    init();
  }, []);

  const fetchCart = async () => {
    try {
      // Cambiamos el estado del loading a true
      setLoading(true);
      // Pedimos al backend el carrito para poder ver sus productos el qual se mostraran por pantalla
      const response = await api.get('/cart');
      //guardamos el carrito a la variable d'estado cart
      setCart(response.data.data.cart);
      
      //En caso de que el usuario acceda a esta pagina sin productos en el carrito, se le redirecciona al carrito para que se de cuenta
      // que no tiene productos
      if (response.data.data.cart.orderItems.length === 0) {
        navigate('/cart');
      }
      // Cambiamos el estado del loading a false
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener carrito:', error);
      setError('Error al cargar el carrito');
      setLoading(false);
    }
  };
  // Funcio que se encarga de gestionar el siguiente paso del checkout
  const handleNext = async () => {
    // La metodologia de pago es al cabo de pular 2 veces el boton de siguiente
    // Asi que en el primer paso no hacemos caso a la metodologia de pago i 
    if (activeStep === 1) { // Antes de ir al paso de pago
      // Con Stripe Checkout hosted, pasamos directamente al paso de pago donde redirigimos
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } else {
      // Pasamos al siguiente paso del checkout
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  // Funcio que se encarga de gestionar el paso anterior del checkout
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  // Funcio que se encarga de gestionar el cambio de la direccion de envio
  const handleShippingAddressChange = (e) => {
    setShippingAddress(e.target.value);
    // Guardar temporalmente por si salimos a Stripe y volvemos
    sessionStorage.setItem('checkout_shipping_address', e.target.value);
  };
  /*
  const handleSubmitOrder = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      await api.post('/orders/create', { shippingAddress });
      
      setOrderCompleted(true);
      handleNext();
    } catch (error) {
      console.error('Error al crear pedido:', error);
      setError(error.response?.data?.message || 'Error al procesar el pedido');
    } finally {
      setSubmitting(false);
    }
  };*/

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Enviar el ID del PaymentIntent para verificación
      await api.post('/orders/create', { 
        shippingAddress,
        paymentIntentId // Incluir el ID del pago
      });
      
      setPaymentSuccess(true);
      setOrderCompleted(true);
      handleNext();
    } catch (error) {
      console.error('Error al crear pedido:', error);
      setError(error.response?.data?.message || 'Error al procesar el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  // Nuevo: finalizar pedido al volver de Stripe Checkout
  const handlePaymentSuccessCheckout = async (checkoutSessionId) => {
    try {
      setSubmitting(true);
      setError(null);
      await api.post('/orders/create', { 
        shippingAddress,
        checkoutSessionId
      });
      setPaymentSuccess(true);
      setOrderCompleted(true);
      setActiveStep(3);
      sessionStorage.removeItem('checkout_shipping_address');
    } catch (error) {
      console.error('Error al crear pedido tras Checkout:', error);
      setError(error.response?.data?.message || 'Error al procesar el pedido');
    } finally {
      setSubmitting(false);
    }
  };
  // Es la funcion donde se siguen todos los pasos comentados anteriormente, cada vez que usamos 
  // setActiveStep dependiendo del paso de la variable acabaremos a una pagina o otra
  const getStepContent = (step) => {
    switch (step) {
      // Paso donde se pide la direccion de envio
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dirección de envío
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <TextField
                  required
                  id="address"
                  name="address"
                  label="Dirección completa"
                  fullWidth
                  variant="outlined"
                  value={shippingAddress}
                  onChange={handleShippingAddressChange}
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!shippingAddress}
              >
                Siguiente
              </Button>
            </Box>
          </Box>
        );
      // Passo el qual nos muestra el resumen del pedido
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resumen del pedido
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
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
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Envío" />
                    <Typography variant="body2">
                      {parseFloat(0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </Typography>
                  </ListItem>
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Total" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {parseFloat(cart.totalAmount).toLocaleString('es-ES', { 
                        style: 'currency', 
                        currency: 'EUR' 
                      })}
                    </Typography>
                  </ListItem>
                </List>
              </Grid>
              <Grid item sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Dirección de envío
                </Typography>
                <Typography variant="body1">{shippingAddress}</Typography>
              </Grid>
            </Grid>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={handleBack}>
                Volver
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={24} /> : 'Siguiente'}
              </Button>
            </Box>
          </Box>
        );
      // Paso del Stripe para hacer el pago
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pago
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Serás redirigido a Stripe para completar el pago de forma segura.
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}
            <Button
              variant="contained"
              color="primary"
              disabled={submitting}
              onClick={async () => {
                try {
                  setSubmitting(true);
                  const response = await api.post('/cart/create-checkout-session', {
                    totalAmount: cart.totalAmount
                  });
                  if (response.data?.url) {
                    window.location.href = response.data.url;
                  } else {
                    setError('No se pudo iniciar la sesión de pago');
                  }
                } catch (e) {
                  console.error('Error iniciando Checkout:', e);
                  setError('Error al iniciar el pago');
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              Ir a pagar
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3 }}>
              <Button onClick={handleBack}>
                Volver
              </Button>
            </Box>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              ¡Gracias por tu pedido!
            </Typography>
            <Typography variant="body1">
              Hemos recibido tu pedido correctamente. Te enviaremos una confirmación cuando esté en camino.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/orders')}
              sx={{ mt: 3 }}
            >
              Ver mis pedidos
            </Button>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Finalizar compra
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {getStepContent(activeStep)}
      </Paper>
    </Container>
  );
};

export default CheckoutPage;