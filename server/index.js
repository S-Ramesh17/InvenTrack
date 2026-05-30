require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-user-id', 'x-user-role', 'x-user-name'],
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Inventory Management API is running.' });
});

// Seed default users on startup
const seedDefaultUsers = async () => {
  try {
    // Create admin if not exists
    const adminExists = await User.findOne({ email: 'admin@test.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('1234', 10);
      await User.create({
        name: 'Admin User',
        employeeId: 'EMP001',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Default admin user created: admin@test.com / 1234');
    }

    // Create staff if not exists
    const staffExists = await User.findOne({ email: 'staff@test.com' });
    if (!staffExists) {
      const hashedPassword = await bcrypt.hash('1234', 10);
      await User.create({
        name: 'Staff User',
        employeeId: 'EMP002',
        email: 'staff@test.com',
        password: hashedPassword,
        role: 'staff',
      });
      console.log('Default staff user created: staff@test.com / 1234');
    }
  } catch (error) {
    console.error('Error seeding default users:', error.message);
  }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedDefaultUsers();
});
