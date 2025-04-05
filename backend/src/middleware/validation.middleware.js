const preventRoleAssignment = (req, res, next) => {
  // Si un usuario intenta asignar un rol, rechazar la petición
  if (req.body.role) {
    return res.status(403).json({
      success: false,
      message: "No está permitido asignar roles en esta operación"
    });
  }
  next();
};

module.exports = { preventRoleAssignment };