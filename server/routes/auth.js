const bcrypt = require("bcryptjs");
const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

// ======================================================
// REGISTER ROUTE
// ======================================================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, height, weight, targetWeight } = req.body;

    const normalizedEmail = email.toLowerCase();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ error: "IDENTIFICATION_EXISTS" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      profile: {
        height: Number(height),
        weight: Number(weight),
        targetWeight: Number(targetWeight),
        calorieGoal: 0,
        macros: {}
      },
      weightHistory: [
        {
          weight: Number(weight),
          date: new Date(),
        },
      ],
    });

    await newUser.save();

    res.json({
      status: "SUCCESS",
      message: "PROFILE_INITIALIZED",
    });
  } catch (err) {
    console.error("REGISTRATION_ERROR:", err);
    res.status(500).json({
      error: "SYSTEM_FAILURE_DURING_REGISTRATION",
    });
  }
});


// ======================================================
// LOGIN ROUTE
// ======================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ error: "INVALID_CREDENTIALS" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "INVALID_CREDENTIALS" });
    }

    const token = jwt.sign(
      { id: user._id },
      "kinetic_access_key_2026_abhishek",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("LOGIN_ERROR:", err);
    res.status(500).json({ error: "SERVER_ERROR_DURING_LOGIN" });
  }
});


// ======================================================
// GET CURRENT USER
// ======================================================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });

    res.json(user);
  } catch (err) {
    console.error("DATA_FETCH_ERROR:", err);
    res.status(500).json({ error: "SYSTEM_FAILURE_DURING_DATA_FETCH" });
  }
});


// ======================================================
// UPDATE USER PROFILE METRICS (MERGED ROUTE)
// ======================================================
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const {
      weight,
      height,
      targetWeight,
      calorieGoal,
      macros
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          "profile.weight": weight,
          "profile.height": height,
          "profile.targetWeight": targetWeight,
          "profile.calorieGoal": calorieGoal,
          "profile.macros": macros
        }
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    res.json(user);

  } catch (err) {
    console.error("PROFILE_UPDATE_ERROR:", err);
    res.status(500).json({ error: "PROFILE_SYNC_FAILED" });
  }
});


// ======================================================
// BASIC PROFILE UPDATE (kept for minimal updates)
// ======================================================
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { weight, height } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });

    user.profile.weight = weight || user.profile.weight;
    user.profile.height = height || user.profile.height;

    await user.save();

    res.json({
      status: "SUCCESS",
      message: "BIO_METRICS_UPDATED",
      profile: user.profile
    });

  } catch (err) {
    console.error("PROFILE_SYNC_FAILED:", err);
    res.status(500).json({ error: "PROFILE_SYNC_FAILED" });
  }
});

module.exports = router;