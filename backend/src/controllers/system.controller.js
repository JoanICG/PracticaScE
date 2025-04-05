const { AppDataSource } = require("../config/database");
const { hashPassword } = require("../utils/password.util");
require("dotenv").config();

// Este endpoint es solo para ser llamado con Postman o similar
// No exponer en la interfaz de usuario
const createInitialAdmin = async (req, res) => {
  try {
    const { name, email, password, secretToken } = req.body;
    
    // Verificar token secreto de sistema (definido en .env)
    const systemSecretToken = process.env.SYSTEM_SECRET_TOKEN;
    if (!systemSecretToken || secretToken !== systemSecretToken) {
      return res.status(403).json({ 
        success: false, 
        message: "Token de sistema no válido" 
      });
    }
    
    // Validar datos
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Datos incompletos" 
      });
    }
    
    const customerRepository = AppDataSource.getRepository("Customer");
    
    // Verificar si el email ya existe
    const existingCustomer = await customerRepository.findOne({ where: { email } });
    if (existingCustomer) {
      return res.status(400).json({ 
        success: false, 
        message: "El email ya está en uso" 
      });
    }
    
    // Crear administrador
    const hashedPassword = await hashPassword(password);
    const admin = customerRepository.create({
      name,
      email,
      password: hashedPassword,
      role: "admin"
    });
    
    await customerRepository.save(admin);
    
    const { password: _, ...adminData } = admin;
    return res.status(201).json({
      success: true,
      message: "Administrador creado con éxito",
      data: {
        admin: adminData
      }
    });
  } catch (error) {
    console.error("Error al crear administrador:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error del servidor" 
    });
  }
};

module.exports = { createInitialAdmin };