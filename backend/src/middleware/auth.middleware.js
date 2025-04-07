const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware para verificar la autenticación del usuario mediante JWT
 * Únicamente acepta token desde cookie HttpOnly
 */
const authMiddleware = (req, res, next) => {
  try {
    // Obtener token únicamente de la cookie HttpOnly
    const token = req.cookies.auth_token;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No autenticado" 
      });
    }

    // Verificar token con la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");
    
    // Verificar que el token no ha expirado
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp <= currentTime) {
      // Si el token ha expirado, limpiar la cookie
      res.clearCookie('auth_token');
      
      return res.status(401).json({
        success: false,
        message: "Token expirado"
      });
    }
    
    // Guardar datos de usuario decodificados para uso en los controladores
    req.user = decoded;
    
    // Continuar con la siguiente función en la cadena de middleware
    next();
  } catch (error) {
    console.error("Error en auth middleware:", error);
    
    // Si hay un error de verificación, limpiar la cookie
    res.clearCookie('auth_token');
    
    return res.status(401).json({ 
      success: false, 
      message: "No autorizado: token inválido o expirado" 
    });
  }
};

module.exports = { authMiddleware };