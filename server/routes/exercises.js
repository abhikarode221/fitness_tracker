const router = require('express').Router();
const Exercise = require('../models/Exercise');
const authMiddleware = require('../middleware/authMiddleware');

// ✅ GET: FETCH COMBINED LIBRARY
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Find all exercises that are either system-default (null) OR owned by this user
    const library = await Exercise.find({
      $or: [{ owner: null }, { owner: req.user.id }]
    });
    res.json(library);
  } catch (err) {
    res.status(500).json({ error: "LIBRARY_SYNC_FAILED" });
  }
});

// ✅ POST: CREATE NEW MODULE
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { name, muscle } = req.body;
    const normalizedName = name.trim().toUpperCase();

    // Check if it already exists for this user or globally
    const exists = await Exercise.findOne({
      name: normalizedName,
      $or: [{ owner: null }, { owner: req.user.id }]
    });

    if (exists) return res.status(400).json({ error: "MODULE_ALREADY_EXISTS" });

    const newEx = new Exercise({
      name: normalizedName,
      muscle: muscle.toUpperCase(),
      owner: req.user.id
    });

    await newEx.save();
    res.json(newEx);
  } catch (err) {
    res.status(500).json({ error: "MODULE_AUTHORIZATION_FAILED" });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.id || req.params.id);

    if (!exercise) {
      return res.status(404).json({ error: "MODULE_NOT_FOUND" });
    }

    // 🔒 Security Check: Only the owner can delete
    if (exercise.owner?.toString() !== req.user.id) {
      return res.status(401).json({ error: "ACCESS_DENIED: UNAUTHORIZED_DECOMMISSION" });
    }

    await Exercise.findByIdAndDelete(req.params.id);
    res.json({ status: "SUCCESS", message: "MODULE_DECOMMISSIONED" });
  } catch (err) {
    res.status(500).json({ error: "DECOMMISSION_SEQUENCE_FAILED" });
  }
});

module.exports = router;