const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware para verificar la autenticación del usuario mediante JWT
 * Únicamente acepta token desde cookie HttpOnly
 */
const authMiddleware = (req, res, next) => {
  try {
    // Obtener token únicamente de cookies HttpOnly
    const authToken = req.cookies && req.cookies.auth_token;
    
    if (!authToken) {
      return res.status(401).json({ 
        success: false, 
        message: "No autenticado" 
      });
    }

    // Verificar token con la clave secreta
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET || "your_jwt_secret_key");
    
    // IMPORTANTE: Mapear los datos del token al formato que espera la aplicación
    req.user = {
      id: decoded.sub,      // Mapear sub a id
      role: decoded.role,   // Mantener el rol
      name: decoded.name,   // Incluir nombre si está en el token
      email: decoded.email  // Incluir email si está en el token
    };
    
    next();
  } catch (error) {
    console.error("Error en auth middleware:", error);
    res.clearCookie('auth_token');
    
    return res.status(401).json({ 
      success: false, 
      message: "No autorizado: token inválido o expirado" 
    });
  }
};

module.exports = { authMiddleware };