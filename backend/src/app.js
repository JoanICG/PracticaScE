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
const systemRoutes = require('./routes/system.routes');

// Inicializar express
const app = express();
const PORT = process.env.PORT || 4000;

// Configuración CORS con soporte para cookies
const allowedOrigins = [
  'http://localhost:3000', // local dev
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (como curl o Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, true); // en desarrollo, permite todo; ajusta en prod
  },
  credentials: true
}));

// Configuración personalizada de CORS
app.use((request, response, next) => {
  // Permitir desde el frontend en docker y localhost
  const requestOrigin = request.headers.origin;
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    response.header('Access-Control-Allow-Origin', requestOrigin);
  } else {
    response.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  }
  response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (request.method === 'OPTIONS') {
    return response.sendStatus(200);
  }
  next();
});

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
app.use('/api/system', systemRoutes);

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