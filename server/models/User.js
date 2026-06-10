const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  profile: {
    height: Number,
    weight: Number,
    targetWeight: Number,

    // Added calorie goal
    calorieGoal: {
      type: Number,
      default: 2500
    },

    // Added macros object
    macros: {
      protein: {
        type: Number,
        default: 150
      },

      carbs: {
        type: Number,
        default: 250
      },

      fats: {
        type: Number,
        default: 70
      }
    }
  },

  weightHistory: [
    {
      weight: Number,
      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

module.exports = mongoose.model('User', UserSchema);