const jwt = require('jsonwebtoken');
const { AppDataSource } = require("../config/database");
const { hashPassword, comparePasswords } = require("../utils/password.util");

// Registro de usuarios
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const customerRepository = AppDataSource.getRepository("Customer");
    
    // Verificar si el email ya existe
    const existingCustomer = await customerRepository.findOne({ where: { email } });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado"
      });
    }
    
    // Crear nuevo usuario con contraseña hasheada
    const hashedPassword = await hashPassword(password);
    const customer = customerRepository.create({
      name,
      email,
      password: hashedPassword,
      role: "customer" // Por defecto, todos los registros son clientes regulares
    });
    
    await customerRepository.save(customer);
    
    // Excluir password de la respuesta
    const { password: _, ...customerData } = customer;
    
    return res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente",
      data: {
        customer: customerData
      }
    });
  } catch (error) {
    console.error("Error en registro:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor durante el registro"
    });
  }
};

// Login de usuarios
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const customerRepository = AppDataSource.getRepository("Customer");
    
    // Buscar usuario por email
    const customer = await customerRepository.findOne({ where: { email } });
    
    if (!customer || !(await comparePasswords(password, customer.password))) {
      return res.status(401).json({ 
        success: false, 
        message: "Credenciales inválidas" 
      });
    }
    
    // Excluir password de los datos de usuario
    const { password: _, ...userData } = customer;
    
    // Generar token JWT con sub igual al ID de usuario y expiración de 1 hora
    const token = jwt.sign(
      { 
        sub: customer.id,    // Usar ID como subject, no el nombre
        role: customer.role  // Solo mantener el rol para autorización
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    // SOLO establecer cookie HttpOnly, NO establecer user_data
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000, // 1 hora en milisegundos
      sameSite: 'strict'
    });
    
    // Retornar datos de usuario sin incluir el token en la respuesta
    return res.json({
      success: true,
      message: "Login successful",
      data: {
        customer: userData
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error del servidor durante el login" 
    });
  }
};

// Logout de usuarios
const logout = (req, res) => {
  // Solo limpiar la cookie auth_token
  res.clearCookie('auth_token');
  
  // También limpiar explícitamente user_data si existe
  res.clearCookie('user_data');
  
  return res.json({
    success: true,
    message: "Logout successful"
  });
};

// Obtener perfil de usuario
const getProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const customerRepository = AppDataSource.getRepository("Customer");
    
    const customer = await customerRepository.findOne({ where: { id } });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }
    
    // Excluir password de la respuesta
    const { password: _, ...userData } = customer;
    
    return res.json({
      success: true,
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor al obtener perfil"
    });
  }
};

// Verificar autenticación
const verifyAuth = (req, res) => {
  return res.json({
    success: true,
    data: {
      user: req.user
    }
  });
};

// Agregar endpoint de renovación de token
const refreshToken = (req, res) => {
  // El usuario ya está autenticado en este punto (gracias al middleware)
  const newToken = jwt.sign(
    { sub: req.user.id, role: req.user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  res.cookie('auth_token', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000,
    sameSite: 'strict'
  });
  
  return res.json({
    success: true,
    message: "Token renovado correctamente"
  });
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  verifyAuth,
  refreshToken
};