router.post('/weight-checkin', async (req, res) => {
  try {
    const { userId, weight } = req.body;
    const user = await User.findById(userId);
    user.weightHistory.push({ weight, date: new Date() });
    user.profile.weight = weight; // Update current weight
    await user.save();
    res.json({ status: 'BIOMETRICS_UPDATED', history: user.weightHistory });
  } catch (err) {
    res.status(500).json({ error: 'UPDATE_FAILED' });
  }
});