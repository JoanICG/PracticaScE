const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  try {
    // Buscar token en authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("No token provided o formato incorrecto");
      return res.status(401).json({ 
        success: false, 
        message: "Token no proporcionado" 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");
    
    // Guardar datos de usuario en req para uso en otros middlewares
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error("Error en auth middleware:", error);
    return res.status(401).json({ 
      success: false, 
      message: "No autorizado: token inválido o expirado" 
    });
  }
};

module.exports = { authMiddleware };