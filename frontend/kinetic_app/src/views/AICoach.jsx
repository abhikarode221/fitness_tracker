import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig';

import {
  Sparkles,
  Send,
  Zap,
  Activity,
  Heart,
  Trash2
} from 'lucide-react';

export const AICoach = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text:
        "Mission Control initialized. I am Kinetic AI. I've analyzed your training data, nutrition, and profile. How can I optimize your performance today?"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // --- 📡 PERSISTENT HISTORY SYNC ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('kinetic_token');
        const res = await api.get('/api/ai/history', {
          headers: { 'x-auth-token': token }
        });
        if (res.data && res.data.messages && res.data.messages.length > 0) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error("HISTORY_FETCH_ERROR", err);
      }
    };
    fetchHistory();
  }, []);

  const showSuccessToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast('');
    }, 4000);
  };

  /*
  |--------------------------------------------------------------------------
  | SEND MESSAGE ENGINE
  |--------------------------------------------------------------------------
  */
  const submitMessage = async (textVal) => {
    if (!textVal.trim()) return;

    const userMessage = {
      role: 'user',
      text: textVal
    };

    // Add user message instantly
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const token = localStorage.getItem('kinetic_token');

      const res = await api.post(
        '/api/ai/chat',
        { message: textVal },
        { headers: { 'x-auth-token': token } }
      );

      // Add AI response
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: res.data.reply
        }
      ]);

      // Trigger premium success toasts for smart actions
      if (res.data.mealLogged) {
        showSuccessToast(`Logged Meal: ${res.data.loggedItem?.name || "Food"} (${res.data.loggedItem?.calories || 0} kcal)`);
      } else if (res.data.waterLogged) {
        showSuccessToast(`Logged Hydration: +${((res.data.loggedItem?.amount || 0) * 1000).toFixed(0)}ml`);
      }

    } catch (err) {
      console.error('AI_CHAT_ERROR', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'System malfunction. Unable to process request.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    const msgCopy = message;
    setMessage('');
    submitMessage(msgCopy);
  };

  const sendQuickMessage = (textVal) => {
    submitMessage(textVal);
  };

  // --- 🧹 MEMORY PURGING ---
  const clearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your conversation history?")) return;
    try {
      const token = localStorage.getItem('kinetic_token');
      await api.delete('/api/ai/history', {
        headers: { 'x-auth-token': token }
      });
      setMessages([
        {
          role: 'assistant',
          text: "Mission Control re-initialized. Memory purged. How can I optimize your performance today?"
        }
      ]);
      showSuccessToast("Memory Purged Successfully");
    } catch (err) {
      console.error("HISTORY_CLEAR_ERROR", err);
      alert("Failed to clear history.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[80vh] flex flex-col px-1 sm:px-4 relative">
      
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center mb-6 sm:mb-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-400 rounded-xl flex items-center justify-center text-black shrink-0">
            <Sparkles size={20} className="sm:hidden" strokeWidth={2.5} />
            <Sparkles size={24} className="hidden sm:block" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic leading-none">
              Kinetic AI Coach
            </h1>
            <p className="text-zinc-600 font-mono text-[9px] uppercase tracking-[0.3em] mt-1">
              Neural Performance Integration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-auto">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-500 font-mono text-[9px] uppercase font-bold tracking-widest">
              System Online
            </span>
          </div>
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 bg-zinc-900 border border-white/5 hover:border-red-500/20 hover:text-red-400 px-4 py-2.5 rounded-full text-[9px] font-bold text-zinc-500 uppercase tracking-widest transition-all"
            title="Clear Chat History"
          >
            <Trash2 size={12} /> Clear Chat
          </button>
        </div>
      </header>

      {/* CHAT WINDOW */}
      <div className="flex-grow bg-zinc-900/40 border border-white/5 rounded-3xl sm:rounded-[3rem] p-4 sm:p-8 backdrop-blur-3xl flex flex-col min-h-0">
        
        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pr-2 custom-scrollbar">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-2xl p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] text-xs sm:text-sm leading-relaxed border ${
                  msg.role === 'user'
                    ? 'bg-cyan-400 text-black border-cyan-400 rounded-br-none font-medium'
                    : 'bg-zinc-800/50 text-zinc-300 border-white/5 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* LOADING */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800/50 text-zinc-400 border border-white/5 p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] rounded-tl-none text-xs sm:text-sm animate-pulse">
                Kinetic AI processing...
              </div>
            </div>
          )}
        </div>

        {/* QUICK SUGGESTIONS */}
        <div className="mt-4 flex flex-wrap gap-2.5">
          <CoachAction icon={<Sparkles size={12} />} label="Log meal: 3 eggs & oats" onClick={() => sendQuickMessage("Log meal: 3 eggs and oatmeal")} />
          <CoachAction icon={<Sparkles size={12} />} label="Log 500ml water" onClick={() => sendQuickMessage("Log 500ml water")} />
          <CoachAction icon={<Sparkles size={12} />} label="Analyze progress" onClick={() => sendQuickMessage("Please analyze my weight, workouts, and calorie targets, and give me a progress report.")} />
          <CoachAction icon={<Sparkles size={12} />} label="Suggest workout" onClick={() => sendQuickMessage("Can you suggest a workout routine for today based on my history?")} />
        </div>

        {/* INPUT AREA */}
        <div className="mt-4 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask advice, routines, analysis..."
            className="w-full bg-black border border-white/10 rounded-2xl py-4 sm:py-6 pl-4 sm:pl-8 pr-16 sm:pr-20 text-white outline-none focus:border-cyan-400/40 transition-all font-medium text-xs sm:text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 bg-zinc-800 text-zinc-400 rounded-xl hover:text-cyan-400 transition-all disabled:opacity-50"
          >
            <Send size={16} className="sm:hidden" />
            <Send size={18} className="hidden sm:block" />
          </button>
        </div>

      </div>

      {/* SUCCESS TOAST ALERT */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-cyan-400 text-black font-black uppercase text-xs tracking-wider px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.5)] z-50 flex items-center gap-2 border border-cyan-300"
          >
            <Sparkles size={16} strokeWidth={3} className="animate-pulse" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

/*
|--------------------------------------------------------------------------
| QUICK ACTION BUTTON COMPONENT
|--------------------------------------------------------------------------
*/
const CoachAction = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 bg-zinc-900/60 border border-white/5 px-4 py-2.5 rounded-full text-[9px] font-bold text-zinc-400 uppercase tracking-widest hover:border-cyan-400/30 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
  >
    <span className="text-cyan-400">
      {icon}
    </span>
    {label}
  </button>
);