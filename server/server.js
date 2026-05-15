const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ 1. MIDDLEWARE
app.use(cors());
app.use(express.json());

// ✅ 2. DATABASE CONNECTION
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ SYSTEM ONLINE: DATABASE CONNECTED'))
  .catch(err => console.error('❌ DATABASE CONNECTION ERROR:', err.message));

// ✅ 3. ROUTE DELEGATION
// Ensure these files exist in your /routes folder
app.use('/api/auth', require('./routes/auth'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/nutrition', require('./routes/nutrition')); 
app.use('/api/ai', require('./routes/ai'));

// ✅ 4. SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 KINETIC SERVER RUNNING ON PORT ${PORT}`);
});