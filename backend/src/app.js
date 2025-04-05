const express = require("express");
const cors = require("cors");
require("reflect-metadata");
const { AppDataSource } = require("./config/database");
const routes = require("./routes");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 4000;

// Configuración simplificada de CORS (como en server-basic.js)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply routes
app.use("/api", routes);

// Initialize database and start server
AppDataSource.initialize()
  .then(() => {
    console.log("Database connection established");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => console.log("Error connecting to database:", error));

module.exports = app;