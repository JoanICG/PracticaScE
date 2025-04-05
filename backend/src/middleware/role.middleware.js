const checkRole = (roles) => {
  return (req, res, next) => {
    console.log("Verificando roles. Usuario:", req.user);
    console.log("Roles requeridos:", roles);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "No autenticado"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere: ${roles.join(', ')}, tiene: ${req.user.role || 'ninguno'}`
      });
    }

    next();
  };
};

module.exports = { checkRole };