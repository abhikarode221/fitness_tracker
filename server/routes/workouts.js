const router = require('express').Router();
const mongoose = require('mongoose');

const Workout = require('../models/Workout');
const authMiddleware = require('../middleware/authMiddleware');


// ✅ POST: LOG A FULL SESSION (Array of Exercises)
router.post('/log', authMiddleware, async (req, res) => {
  try {
    const { exercises } = req.body;

    const newSession = new Workout({
      userId: req.user.id,
      exercises,
      date: new Date()
    });

    await newSession.save();

    res.json({
      status: "SUCCESS",
      message: "SESSION_SYNC_COMPLETE"
    });

  } catch (err) {
    console.error("SESSION_LOG_ERROR:", err);
    res.status(500).json({ error: "SESSION_LOGGING_FAILED" });
  }
});


// ✅ GET: FETCH ALL SESSIONS
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const history = await Workout
      .find({ userId: req.user.id })
      .sort({ date: -1 });

    res.json(history);

  } catch (err) {
    console.error("HISTORY_FETCH_ERROR:", err);
    res.status(500).json({ error: "HISTORY_RETRIEVAL_FAILED" });
  }
});


// ✅ GET: FETCH ONLY THE LATEST SESSION
router.get('/latest', authMiddleware, async (req, res) => {
  try {
    const latestSession = await Workout
      .findOne({ userId: req.user.id })
      .sort({ date: -1 });

    res.json(latestSession);

  } catch (err) {
    console.error("LATEST_SESSION_ERROR:", err);
    res.status(500).json({ error: "COACH_SYNC_FAILED" });
  }
});


// ✅ GET: CALCULATE PERSONAL RECORDS (PRs)
router.get('/prs', authMiddleware, async (req, res) => {
  try {
    const prs = await Workout.aggregate([
      
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },

      { $unwind: "$exercises" },
      { $unwind: "$exercises.sets" },

      {
        $group: {
          _id: "$exercises.name",
          maxWeight: {
            $max: { $toDouble: "$exercises.sets.weight" }
          },
          achievedDate: { $max: "$date" }
        }
      },

      {
        $project: {
          exercise: "$_id",
          weight: "$maxWeight",
          date: "$achievedDate",
          _id: 0
        }
      },

      { $sort: { date: -1 } }
    ]);

    res.json(prs);

  } catch (err) {
    console.error("PR_AGGREGATION_ERROR:", err);
    res.status(500).json({
      error: "FAILED_TO_CALCULATE_PR_MATRIX"
    });
  }
});


// ✅ GET: AI COACH ANALYTICS
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await Workout.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: thirtyDaysAgo }
        }
      },

      { $unwind: "$exercises" },

      {
        $group: {
          _id: "$exercises.muscle",

          frequency: { $sum: 1 },

          totalVolume: {
            $sum: {
              $reduce: {
                input: "$exercises.sets",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    {
                      $multiply: [
                        { $toDouble: "$$this.weight" },
                        { $toDouble: "$$this.reps" }
                      ]
                    }
                  ]
                }
              }
            }
          }
        }
      },

      { $sort: { totalVolume: -1 } }
    ]);

    res.json(stats);

  } catch (err) {
    console.error("ANALYTICS_ERROR:", err);
    res.status(500).json({ error: "ANALYTICS_FETCH_FAILED" });
  }
});


// ✅ PUT: UPDATE ARCHIVED SESSION
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );

    if (!workout) {
      return res.status(404).json({ error: "SESSION_NOT_FOUND" });
    }

    res.json(workout);

  } catch (err) {
    console.error("UPDATE_ERROR:", err);
    res.status(500).json({ error: "ARCHIVE_UPDATE_FAILED" });
  }
});


// ✅ DELETE: PURGE SESSION
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!workout) {
      return res.status(404).json({ error: "SESSION_NOT_FOUND" });
    }

    res.json({ message: "SESSION_PURGED" });

  } catch (err) {
    console.error("DELETE_ERROR:", err);
    res.status(500).json({ error: "PURGE_SEQUENCE_FAILED" });
  }
});


module.exports = router;