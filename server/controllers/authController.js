const bcrypt = require('bcryptjs');
const User = require('../models/User');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, employeeId, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create staff user (registration is staff only)
    const newUser = new User({
      name,
      employeeId: employeeId || '',
      email,
      password: hashedPassword,
      role: 'staff',
    });

    await newUser.save();

    // Return user without password
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      employeeId: newUser.employeeId,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };

    res.status(201).json({ message: 'Registration successful.', user: userResponse });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.status(200).json({ message: 'Login successful.', user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

module.exports = { register, login };
