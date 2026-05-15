const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ 1. CORS CONFIGURATION
app.use(cors({
  origin: [
    'http://localhost:5173', // Local development
    'https://your-kinetic-frontend.vercel.app' // Live frontend URL
  ],
  credentials: true
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