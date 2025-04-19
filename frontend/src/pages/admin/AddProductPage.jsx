import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import api from "../../services/api";

const AddProductPage = () => {
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await api.post("/admin/products", productData);
      setSuccessMessage("Producto añadido con éxito.");
      setProductData({
        name: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
      });
    } catch (error) {
      console.error("Error al añadir producto:", error);
      setErrorMessage(
        error.response?.data?.message || "Error al añadir el producto."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Añadir Producto
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Nombre del producto"
          name="name"
          value={productData.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Descripción"
          name="description"
          value={productData.description}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          rows={4}
          required
        />
        <TextField
          label="Precio (€)"
          name="price"
          type="number"
          value={productData.price}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Stock"
          name="stock"
          type="number"
          value={productData.stock}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="URL de la imagen"
          name="imageUrl"
          value={productData.imageUrl}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        {successMessage && <Alert severity="success">{successMessage}</Alert>}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Añadir Producto"}
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default AddProductPage;