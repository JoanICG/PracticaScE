const express = require('express');
const { AppDataSource } = require('./src/config/database');

const app = express();
const PORT = 4000;

// Configuración manual de CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Permitir solicitudes desde este origen
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Permitir estos encabezados
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Métodos permitidos
  res.header('Access-Control-Allow-Credentials', 'true'); // Permitir cookies y credenciales
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // Responder rápidamente a las solicitudes OPTIONS
  }
  next();
});

app.use(express.json());

// Rutas mínimas
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Initialize database and start server
AppDataSource.initialize()
  .then(() => {
    console.log("Database connection established");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => console.log("Error connecting to database:", error));