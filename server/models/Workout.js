const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Changed from a single exercise to an array of exercise objects
  exercises: [{
    name: { type: String, required: true },
    muscle: { type: String },
    sets: [{
      reps: { type: Number, required: true },
      weight: { type: Number, required: true }
    }]
  }],
  date: { type: Date, default: Date.now }
});

// Safe Export to prevent OverwriteModelError
module.exports = mongoose.models.Workout || mongoose.model('Workout', WorkoutSchema);