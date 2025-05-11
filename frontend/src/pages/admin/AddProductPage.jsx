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
// Pagina para añadir nuevos productos al backend
// Variables de estado para la pagina de añadir productos
const AddProductPage = () => {
  // Añadimos al productData un array con los datos del producto
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
  // Obtiene los valores ingresados en el formulario y los guarda en el estado
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };
  // Funcion que se encarga de añadir el producto al backend
  const handleSubmit = async (e) => {
    // Evitamos que se recargue la pagina
    e.preventDefault();
    setLoading(true);
    /*
    setSuccessMessage(null);
    setErrorMessage(null);*/

    try {
      // Enviamos con el post el nuevo producto al backend
      await api.post("/admin/products", productData);
      // Menasje de exito
      setSuccessMessage("Producto añadido con éxito.");
      // Limpiamos el formulario
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
  // Formulario para añadir el producto
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