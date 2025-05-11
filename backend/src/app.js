const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); 
require("reflect-metadata");
const { AppDataSource } = require("./config/database");

// Importar todas las rutas
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');

// Inicializar express
const app = express();
const PORT = process.env.PORT || 4000;

// Configuración CORS con soporte para cookies
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Middleware para parsear cookies
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Crear la base de datos y levantar el servidor
AppDataSource.initialize()
  .then(() => {
    console.log("Database connection established");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => console.log("Error connecting to database:", error));

module.exports = app;