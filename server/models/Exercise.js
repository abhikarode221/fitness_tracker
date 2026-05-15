const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  muscle: { type: String, required: true },
  // If owner is null, it's a "System" exercise visible to everyone.
  // If owner has an ID, it's a private custom exercise for that user.
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});

// Avoid duplicates by name (case-insensitive check handled in route)
module.exports = mongoose.models.Exercise || mongoose.model('Exercise', ExerciseSchema);