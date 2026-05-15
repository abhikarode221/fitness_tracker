import React, { useState } from 'react';
import axios from 'axios';

import {
  Sparkles,
  Send,
  Zap,
  Activity,
  Heart
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

  /*
  |--------------------------------------------------------------------------
  | SEND MESSAGE
  |--------------------------------------------------------------------------
  */

  const sendMessage = async () => {

    if (!message.trim()) return;

    const userMessage = {
      role: 'user',
      text: message
    };

    // Add user message instantly
    setMessages(prev => [...prev, userMessage]);

    const currentMessage = message;

    setMessage('');
    setLoading(true);

    try {

      const token = localStorage.getItem('kinetic_token');

      const res = await axios.post(
        'http://localhost:5000/api/ai/chat',
        {
          message: currentMessage
        },
        {
          headers: {
            'x-auth-token': token
          }
        }
      );

      // Add AI response
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: res.data.reply
        }
      ]);

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

  /*
  |--------------------------------------------------------------------------
  | ENTER KEY
  |--------------------------------------------------------------------------
  */

  const handleKeyDown = (e) => {

    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[80vh] flex flex-col">

      {/* HEADER */}
      <header className="flex justify-between items-center mb-10">

        <div className="flex items-center gap-4">

          <div className="w-12 h-12 bg-cyan-400 rounded-xl flex items-center justify-center text-black">
            <Sparkles size={24} strokeWidth={2.5} />
          </div>

          <div>
            <h1 className="text-3xl font-black text-white uppercase italic">
              Kinetic AI Coach
            </h1>

            <p className="text-zinc-600 font-mono text-[9px] uppercase tracking-[0.3em]">
              Neural Performance Integration
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />

          <span className="text-green-500 font-mono text-[9px] uppercase font-bold tracking-widest">
            System Online
          </span>
        </div>

      </header>

      

      {/* CHAT WINDOW */}
      <div className="flex-grow bg-zinc-900/40 border border-white/5 rounded-[3rem] p-8 backdrop-blur-3xl flex flex-col">

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">

          {messages.map((msg, index) => (

            <div
              key={index}
              className={`flex ${
                msg.role === 'user'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >

              <div
                className={`max-w-2xl p-5 rounded-[2rem] text-sm leading-relaxed border ${
                  msg.role === 'user'
                    ? 'bg-cyan-400 text-black border-cyan-400 rounded-br-none'
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

              <div className="bg-zinc-800/50 text-zinc-400 border border-white/5 p-5 rounded-[2rem] rounded-tl-none text-sm animate-pulse">
                Kinetic AI processing...
              </div>

            </div>
          )}

        </div>

        {/* INPUT AREA */}
        <div className="mt-8 relative">

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for advice, routines, or analysis..."
            className="w-full bg-black border border-white/10 rounded-2xl py-6 px-8 pr-20 text-white outline-none focus:border-cyan-400/40 transition-all font-medium text-sm"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-zinc-800 text-zinc-400 rounded-xl hover:text-cyan-400 transition-all disabled:opacity-50"
          >
            <Send size={18} />
          </button>

        </div>

      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| QUICK ACTION BUTTON
|--------------------------------------------------------------------------
*/

const CoachAction = ({ icon, label }) => (

  <button className="flex items-center gap-2 bg-zinc-900/60 border border-white/5 px-5 py-2 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:border-cyan-400/30 hover:text-white transition-all">

    <span className="text-cyan-400">
      {icon}
    </span>

    {label}

  </button>
);