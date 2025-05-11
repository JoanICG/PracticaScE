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
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";

const steps = ['Dirección de envío', 'Revisar pedido', 'Pago', 'Pedido completado'];

const CheckoutPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [cart, setCart] = useState({ orderItems: [], totalAmount: 0 });
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const navigate = useNavigate();
  const stripePromise = loadStripe("pk_test_51RMVXe4FE38O7zRrFoDEZ9JKdAdwn9I3jebSGHYr3MgyjyNuROWPyi4UxROyJoFR0PMc9OrLC3ULFJUnO3t4qbeZ006ZtZKmAm");
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data.data.cart);
      
      // Si el carrito está vacío, redireccionar
      if (response.data.data.cart.orderItems.length === 0) {
        navigate('/cart');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener carrito:', error);
      setError('Error al cargar el carrito');
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (activeStep === 1) { // Antes de ir al paso de pago
      try {
        // Crear intent de pago
        const response = await api.post("/cart/create-payment-intent", {
          totalAmount: cart.totalAmount,
        });
        setClientSecret(response.data.clientSecret);
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      } catch (error) {
        console.error("Error al iniciar el pago:", error);
        setError("Error al iniciar el pago");
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleShippingAddressChange = (e) => {
    setShippingAddress(e.target.value);
  };

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
  };

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

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dirección de envío
            </Typography>
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
              <Grid item xs={12} md={6}>
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
      case 2: // Nuevo paso de pago
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pago
            </Typography>
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm 
                  clientSecret={clientSecret} 
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </Elements>
            ) : (
              <CircularProgress />
            )}
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