// routes/ai.js

const express = require('express');
const router = express.Router();

const AIChat = require('../models/AIChat');
const authMiddleware = require('../middleware/authMiddleware');
const { GoogleGenerativeAI } = require("@google/generative-ai");


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
    | BUILD PROMPT (CONTEXT AWARE)
    |--------------------------------------------------------------------------
    */

    const contextMessages = chat.messages
      .slice(-10)
      .map(m => `${m.role}: ${m.text}`)
      .join("\n");

    const prompt = `
You are Kinetic AI Coach (fitness + nutrition expert).

Conversation history:
${contextMessages}

User: ${message}

Give a short, clear, actionable response.
`;

    /*
    |--------------------------------------------------------------------------
    | GENERATE AI RESPONSE
    |--------------------------------------------------------------------------
    */

    const aiReply = await generateAIContent(prompt, apiKey);

    /*
    |--------------------------------------------------------------------------
    | SAVE AI RESPONSE
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