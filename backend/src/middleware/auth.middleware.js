const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware para verificar la autenticación del usuario mediante JWT
 * Únicamente acepta token desde cookie HttpOnly
 */
const authMiddleware = (req, res, next) => {
  try {
    // Intentar obtener token de diferentes fuentes
    let authToken = null;
    
    // 1. Primero buscar en cookies
    if (req.cookies && req.cookies.auth_token) {
      authToken = req.cookies.auth_token;
    } 
    // 2. Si no hay en cookies, buscar en header Authorization
    else if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        authToken = authHeader.substring(7);
      }
    }
    
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