// routes/ai.js

const express = require('express');
const router = express.Router();

const AIChat = require('../models/AIChat');
const authMiddleware = require('../middleware/authMiddleware');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require('mongoose');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');


/*
|--------------------------------------------------------------------------
| SEND MESSAGE
|--------------------------------------------------------------------------
*/


const MODELS_TO_TRY = [
  
  "gemini-2.5-flash", // BEST FOR SEO
  "gemini-2.5-flash-lite", // BEST BALANCE
  "gemini-3-flash-preview", // BEST FOR SEO
  "gemini-3.1-flash-lite-preview", // BEST BALANCE

  // 3.x
  "gemini-3-pro",
  "gemini-3-pro-preview",
  "gemini-3.1-pro",
  "gemini-3.1-pro-preview",
  "gemini-3-flash", 
  "gemini-3-deep-think",

  // 2.5
  "gemini-2.5-pro",
  "gemini-2.5-pro-preview",
  "gemini-2.5-flash-preview",
  "gemini-2.5-flash-lite-preview",

  // 2.0
  "gemini-2.0-pro",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-exp",
  "gemini-2.0-flash-thinking-exp",
  "gemini-2.0-pro-exp",

  // 1.5
  "gemini-1.5-pro",
  "gemini-1.5-pro-latest",
  "gemini-1.5-pro-experimental",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",

  // 1.0
  "gemini-1.0-pro",
  "gemini-pro",
  "gemini-1.0-ultra",
  "gemini-1.0-nano",

  // nano
  "gemini-nano-1",
  "gemini-nano-2"
];
let activeModel = null;
let genAIInstance = null;

async function initializeGemini(apiKey) {
  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`⚡ Testing: ${modelName}`);

      const model = genAIInstance.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hi");

      if (result.response) {
        console.log(`✅ Using: ${modelName}`);
        activeModel = model;
        return;
      }
    } catch (err) {
      console.log(`❌ Failed: ${modelName}`);
    }
  }

  throw new Error("No Gemini models available");
}

async function generateAIContent(prompt, apiKey) {
  if (!activeModel) {
    await initializeGemini(apiKey);
  }

  const result = await activeModel.generateContent(prompt);
  return result.response.text();
}
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!message) {
      return res.status(400).json({
        error: "MESSAGE_REQUIRED"
      });
    }

    // --- FETCH DATA FOR CONTEXT ---
    // 1. Fetch User Profile
    const user = await User.findById(req.user.id).select("-password");
    
    // 2. Fetch Today's Nutrition Log
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    let todayNutrition = await Nutrition.findOne({ userId: req.user.id, date: { $gte: todayStart } });
    if (!todayNutrition) {
      todayNutrition = { meals: [], waterIntake: 0 };
    }

    // 3. Fetch All Workouts (for total volume & workout count)
    const workouts = await Workout.find({ userId: req.user.id }).sort({ date: -1 });

    // 4. Fetch PRs
    let prs = [];
    try {
      prs = await Workout.aggregate([
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
    } catch (e) {
      console.error("PR_AGGREGATION_AI_CHAT_ERROR", e);
    }

    // Format metrics summaries
    const profileText = user && user.profile ? `
- Height: ${user.profile.height || 'N/A'} cm
- Weight: ${user.profile.weight || 'N/A'} kg
- Target Weight: ${user.profile.targetWeight || 'N/A'} kg
- Daily Calorie Goal: ${user.profile.calorieGoal || 2500} kcal
- Macro Target: Protein: ${user.profile.macros?.protein || 150}g, Carbs: ${user.profile.macros?.carbs || 250}g, Fats: ${user.profile.macros?.fats || 70}g
` : '- No profile setup yet';

    const nutritionCals = todayNutrition.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const nutritionProtein = todayNutrition.meals.reduce((sum, m) => sum + (m.protein || 0), 0);
    const nutritionCarbs = todayNutrition.meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
    const nutritionFats = todayNutrition.meals.reduce((sum, m) => sum + (m.fats || 0), 0);
    const nutritionMealsSummary = todayNutrition.meals.map(m => `- ${m.name}: ${m.calories} kcal (P: ${m.protein}g, C: ${m.carbs}g, F: ${m.fats}g)`).join('\n') || '- No meals logged today';

    const nutritionText = `
- Today's Calorie Intake: ${nutritionCals} / ${user?.profile?.calorieGoal || 2500} kcal
- Today's Water Intake: ${todayNutrition.waterIntake || 0} L
- Today's Macros Logged: Protein: ${nutritionProtein}g, Carbs: ${nutritionCarbs}g, Fats: ${nutritionFats}g
- Today's Meals:
${nutritionMealsSummary}
`;

    // Calculate total lifetime volume
    let totalKg = 0;
    workouts.forEach(session => {
      session.exercises?.forEach(ex => {
        ex.sets?.forEach(set => totalKg += (Number(set.weight) * Number(set.reps)));
      });
    });
    const lifetimeVolumeTons = (totalKg / 1000).toFixed(1);

    const latestWorkoutSummary = workouts.length > 0 ? `
- Date: ${new Date(workouts[0].date).toLocaleDateString()}
- Exercises completed:
${workouts[0].exercises.map(ex => `  * ${ex.name} (${ex.sets.length} sets: ${ex.sets.map(s => `${s.weight}kg x ${s.reps}`).join(', ')})`).join('\n')}
` : '- No workouts logged yet';

    const prsText = prs.map(pr => `- ${pr.exercise}: ${pr.weight} kg (Achieved: ${new Date(pr.date).toLocaleDateString()})`).join('\n') || '- No PRs logged yet';

    const workoutText = `
- Total Workouts Logged: ${workouts.length}
- Lifetime Volume: ${lifetimeVolumeTons} tons
- Latest Session:
${latestWorkoutSummary}
- Personal Records:
${prsText}
`;

    /*
    |--------------------------------------------------------------------------
    | FIND OR CREATE CHAT
    |--------------------------------------------------------------------------
    */

    let chat = await AIChat.findOne({
      userId: req.user.id
    });

    if (!chat) {
      chat = new AIChat({
        userId: req.user.id,
        messages: []
      });
    }

    /*
    |--------------------------------------------------------------------------
    | SAVE USER MESSAGE
    |--------------------------------------------------------------------------
    */

    chat.messages.push({
      role: "user",
      text: message
    });

    /*
    |--------------------------------------------------------------------------
    | BUILD PROMPT (CONTEXT AWARE & ACTION DRIVEN)
    |--------------------------------------------------------------------------
    */

    const contextMessages = chat.messages
      .slice(-10)
      .map(m => `${m.role}: ${m.text}`)
      .join("\n");

    const prompt = `
You are Kinetic AI Coach (fitness + nutrition expert). You have access to the user's real-time body profile, workout history, and nutrition logs:

--- USER BIOMETRIC PROFILE ---
${profileText}

--- NUTRITION LOG (TODAY) ---
${nutritionText}

--- WORKOUT PERFORMANCE HISTORY ---
${workoutText}
-------------------------------

INTEGRATED FUNCTIONALITY:
You can log meals or log water intake directly to the user's database. If the user asks you to log something they ate, log a meal, or log water they drank:
1. Estimate the calories, protein, carbs, and fats (for meals) or volume in Liters (for water) as accurately as possible based on the user's description.
2. Format a command prefix AT THE VERY BEGINNING of your response using EXACTLY this schema:
   - For logging a meal: :::log_meal{"name": "Short Descriptive Name", "calories": 350, "protein": 25, "carbs": 40, "fats": 10}:::
   - For logging water: :::log_water{"amount": 0.5}::: (Note: amount must be in Liters. e.g., 250ml is 0.25, 1L is 1.0)
3. Ensure the JSON inside the ::: delimiters is valid and compact. Do NOT include newlines inside the ::: delimiters.
4. Immediately following the delimiter block, write your user-facing response. In your response, politely inform the user that you have logged it and summarize the estimated values.
5. If the user is NOT asking to log food or water, do NOT output the ::: prefix. Just respond normally.

Keep your response clear, conversational, actionable, and short. Do not mention the raw command codes or JSON in your user-facing message.

Conversation history:
${contextMessages}

User: ${message}
`;

    /*
    |--------------------------------------------------------------------------
    | GENERATE AI RESPONSE
    |--------------------------------------------------------------------------
    */

    let aiReply = await generateAIContent(prompt, apiKey);

    // --- PARSE LOGGING COMMANDS ---
    let mealLogged = false;
    let waterLogged = false;
    let loggedItem = null;

    // Check for meal logging command
    const mealRegex = /:::log_meal(\{.*?\}):::/;
    const mealMatch = aiReply.match(mealRegex);

    if (mealMatch) {
      try {
        const mealData = JSON.parse(mealMatch[1]);
        
        // Save to Database
        let nutritionLog = await Nutrition.findOne({ userId: req.user.id, date: { $gte: todayStart } });
        if (!nutritionLog) {
          nutritionLog = new Nutrition({ userId: req.user.id, waterIntake: 0, meals: [] });
        }
        nutritionLog.meals.push({
          name: mealData.name,
          calories: Number(mealData.calories || 0),
          protein: Number(mealData.protein || 0),
          carbs: Number(mealData.carbs || 0),
          fats: Number(mealData.fats || 0)
        });
        await nutritionLog.save();

        mealLogged = true;
        loggedItem = mealData;
        
        // Strip the command from the reply
        aiReply = aiReply.replace(mealRegex, '').trim();
      } catch (e) {
        console.error("PARSE_MEAL_COMMAND_FAILED", e);
      }
    }

    // Check for water logging command
    const waterRegex = /:::log_water(\{.*?\}):::/;
    const waterMatch = aiReply.match(waterRegex);

    if (waterMatch) {
      try {
        const waterData = JSON.parse(waterMatch[1]);
        
        // Save to Database
        let nutritionLog = await Nutrition.findOne({ userId: req.user.id, date: { $gte: todayStart } });
        if (!nutritionLog) {
          nutritionLog = new Nutrition({ userId: req.user.id, waterIntake: 0, meals: [] });
        }
        nutritionLog.waterIntake = Number(((nutritionLog.waterIntake || 0) + Number(waterData.amount || 0)).toFixed(2));
        await nutritionLog.save();

        waterLogged = true;
        loggedItem = waterData;

        // Strip the command from the reply
        aiReply = aiReply.replace(waterRegex, '').trim();
      } catch (e) {
        console.error("PARSE_WATER_COMMAND_FAILED", e);
      }
    }

    /*
    |--------------------------------------------------------------------------
    | SAVE AI RESPONSE TO HISTORY
    |--------------------------------------------------------------------------
    */

    chat.messages.push({
      role: "assistant",
      text: aiReply
    });

    await chat.save();

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    res.json({
      success: true,
      reply: aiReply,
      mealLogged,
      waterLogged,
      loggedItem,
      messages: chat.messages
    });

  } catch (err) {
    console.error("AI_CHAT_ERROR", err);

    res.status(500).json({
      error: "AI_CHAT_FAILED"
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET CHAT HISTORY
|--------------------------------------------------------------------------
*/

router.get('/history', authMiddleware, async (req, res) => {

  try {

    const chat = await AIChat.findOne({
      userId: req.user.id
    });

    if (!chat) {

      return res.json({
        messages: []
      });
    }

    res.json({
      messages: chat.messages
    });

  } catch (err) {

    console.error('CHAT_HISTORY_ERROR', err);

    res.status(500).json({
      error: 'CHAT_HISTORY_FAILED'
    });
  }
});

/*
|--------------------------------------------------------------------------
| CLEAR CHAT HISTORY
|--------------------------------------------------------------------------
*/

router.delete('/history', authMiddleware, async (req, res) => {

  try {

    await AIChat.findOneAndDelete({
      userId: req.user.id
    });

    res.json({
      success: true,
      message: 'Chat history cleared'
    });

  } catch (err) {

    console.error('CHAT_DELETE_ERROR', err);

    res.status(500).json({
      error: 'CHAT_DELETE_FAILED'
    });
  }
});

module.exports = router;