const express = require('express');
const cors = require('cors');
const { AppDataSource } = require('./src/config/database');

const app = express();
const PORT = 4000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

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