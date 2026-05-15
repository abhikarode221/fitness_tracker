const router = require('express').Router();
const Nutrition = require('../models/Nutrition');
const authMiddleware = require('../middleware/authMiddleware');

// ✅ POST: LOG A NEW MEAL
router.post('/log-meal', authMiddleware, async (req, res) => {
  try {
    const { name, calories, protein, carbs, fats } = req.body;
    const today = new Date().setHours(0,0,0,0);

    // Find today's log or create a new one
    let log = await Nutrition.findOne({ userId: req.user.id, date: { $gte: today } });

    if (!log) {
      log = new Nutrition({ userId: req.user.id, meals: [] });
    }

    log.meals.push({ name, calories, protein, carbs, fats });
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: "FUEL_LOG_FAILED" });
  }
});

// ✅ GET: FETCH TODAY'S INTAKE
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const today = new Date().setHours(0,0,0,0);
    const log = await Nutrition.findOne({ userId: req.user.id, date: { $gte: today } });
    res.json(log || { meals: [], waterIntake: 0 });
  } catch (err) {
    res.status(500).json({ error: "DATA_SYNC_FAILED" });
  }
});

router.delete('/meal/:id', authMiddleware, async (req, res) => {
  try {
    const mealId = req.params.id;

    const log = await Nutrition.findOne({
      userId: req.user.id,
      "meals._id": mealId,
    });

    if (!log) {
      return res.status(404).json({
        error: "MEAL_NOT_FOUND",
      });
    }

    log.meals = log.meals.filter(
      (meal) => meal._id.toString() !== mealId
    );

    await log.save();

    res.json({
      success: true,
      message: "Meal deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      error: "DELETE_MEAL_FAILED",
    });
  }
});

// UPDATE WATER INTAKE

router.put('/water', authMiddleware, async (req, res) => {
  try {

    const { intake } = req.body;

    if (intake === undefined || intake === null) {
      return res.status(400).json({
        error: 'WATER_INTAKE_REQUIRED'
      });
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's nutrition log
    let log = await Nutrition.findOne({
      userId: req.user.id,
      date: { $gte: today }
    });

    // Create log if not exists
    if (!log) {

      log = new Nutrition({
        userId: req.user.id,
        waterIntake: intake,
        meals: []
      });

    } else {

      // Update water intake
      log.waterIntake = intake;
    }

    await log.save();

    res.json(log);

  } catch (err) {

    console.error('WATER_UPDATE_ERROR', err);

    res.status(500).json({
      error: 'WATER_UPDATE_FAILED'
    });
  }
});

module.exports = router;