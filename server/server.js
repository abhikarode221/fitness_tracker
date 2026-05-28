const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ 1. UPDATED CORS CONFIGURATION
app.use(cors({
  origin: [
    'http://localhost:5173', // Local React/Vite development server
    'https://fitnesstracker-delta-two.vercel.app' // Live Vercel frontend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed REST methods
  allowedHeaders: ['Content-Type', 'x-auth-token'], // Allow JWT auth headers
  credentials: true // Allow cookies/auth headers
}));

// ✅ 2. MIDDLEWARE
app.use(express.json());

// ✅ 3. DATABASE CONNECTION
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ SYSTEM ONLINE: DATABASE CONNECTED'))
  .catch(err => console.error('❌ DATABASE CONNECTION ERROR:', err.message));

// ✅ 4. ROUTE DELEGATION
app.use('/api/auth', require('./routes/auth'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/nutrition', require('./routes/nutrition'));
app.use('/api/ai', require('./routes/ai'));

// ✅ 5. SERVER START
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 KINETIC SERVER RUNNING ON PORT ${PORT}`);
});