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
  .map(o => o.trim())
  .filter(Boolean);

console.log('[CORS] Allowed origins:', allowedOrigins);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) return next();
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    return next();
  }
  console.warn(`[CORS] Origin denegado: ${origin}`);
  if (req.method === 'OPTIONS') {
    return res.status(403).end();
  }
  return res.status(403).json({ message: 'CORS: Origin no permitido' });
});

// Preflight adicional (redundante) ya gestionado arriba

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