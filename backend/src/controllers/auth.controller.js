const { AppDataSource } = require("../config/database");
const { hashPassword, comparePasswords } = require("../utils/password.util");
const { generateToken } = require("../utils/jwt.util");
const jwt = require('jsonwebtoken'); // Añadir esta importación

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const customerRepository = AppDataSource.getRepository("Customer");

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide name, email and password" 
      });
    }

    // Check if user already exists
    const existingCustomer = await customerRepository.findOne({ where: { email } });
    if (existingCustomer) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already in use" 
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new customer (always with role customer)
    const customer = customerRepository.create({
      name,
      email,
      password: hashedPassword,
      role: "customer"  // Force role to customer
    });

    await customerRepository.save(customer);

    // Generate token
    const token = generateToken({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      role: customer.role
    });

    // Return success without password
    const { password: _, ...customerData } = customer;
    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        customer: { ...customerData, role: customer.role },
        token
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during registration" 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const customerRepository = AppDataSource.getRepository("Customer");

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide email and password" 
      });
    }

    // Buscar usuario sin filtrar por rol
    const customer = await customerRepository.findOne({ 
      where: { email } 
    });
    if (!customer) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Validate password
    const isPasswordValid = await comparePasswords(password, customer.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Tras verificar el password:
    console.log("Login exitoso para:", email, "con rol:", customer.role);
    
    // Verifica que esta información se incluya en el token
    const token = jwt.sign(
      { 
        id: customer.id, 
        email: customer.email,
        name: customer.name,
        role: customer.role  // Asegúrate de que esto se incluya
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Return token and user data without password
    const { password: _, ...customerData } = customer;
    return res.json({
      success: true,
      message: "Login successful",
      data: {
        customer: { ...customerData, role: customer.role },
        token
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during login" 
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const customerRepository = AppDataSource.getRepository("Customer");
    
    const customer = await customerRepository.findOne({ where: { id: userId } });
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Return user data without password
    const { password: _, ...customerData } = customer;
    return res.json({
      success: true,
      data: {
        customer: customerData
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error retrieving profile" 
    });
  }
};

module.exports = { register, login, getProfile };