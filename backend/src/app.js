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

// Configuración CORS con soporte para cookies y dominios configurables
// Permite definir múltiples orígenes separados por coma en CORS_ALLOWED_ORIGINS
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // peticiones server-to-server
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV === 'development') {
      // En desarrollo, permitir cualquier origen para facilitar pruebas
      return callback(null, true);
    }
    return callback(new Error('CORS: Origin no permitido')); // en producción, bloquear
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Responder rápidamente preflight OPTIONS
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
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