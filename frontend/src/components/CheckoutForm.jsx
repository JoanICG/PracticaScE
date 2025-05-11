import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
  Alert,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const CheckoutForm = ({ clientSecret, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      setError(error.message);
    } else if (paymentIntent.status === "succeeded") {
      setSuccess(true);
      if (onPaymentSuccess) {
        onPaymentSuccess(paymentIntent.id); // Pasar el ID del pago exitoso
      }
    }

    setLoading(false);
  };

  // Modificar el renderizado para checkout integrado
  if (success && !onPaymentSuccess) {
    // Mostrar el mensaje de éxito solo si no hay función onPaymentSuccess
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
        <CheckCircleIcon sx={{ fontSize: 60, color: "green", mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          ¡Pago realizado con éxito!
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Gracias por tu compra. Hemos recibido tu pago y estamos procesando tu pedido.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.href = "/"}
        >
          Volver a la tienda
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Introduce los datos de tu tarjeta
      </Typography>
      <Divider sx={{ my: 2 }} />
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
              defaultValues: {
                link: {
                  enabled: false, // Deshabilita Link
                },
              },
            }}
          />
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={!stripe || loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? "Procesando..." : "Pagar"}
        </Button>
      </form>
    </Paper>
  );
};

export default CheckoutForm;