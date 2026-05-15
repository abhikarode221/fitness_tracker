import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', 
    height: '', weight: '', targetWeight: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert("SYSTEM UPDATE: PROFILE CREATED. INITIALIZING LOGIN.");
      navigate('/login');
    } catch (err) {
      alert("REGISTRATION_FAILED: CHECK INPUT PARAMETERS");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10 w-full max-w-2xl border border-white/5 bg-surface rounded-3xl"
      >
        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8 text-white">Create Profile</h2>
        
        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block font-mono text-[10px] text-zinc-500 uppercase mb-2 tracking-widest">Enter Name</label>
            <input 
              type="text" required
              className="w-full bg-background border border-white/10 rounded-xl p-4 text-white focus:border-accent outline-none"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] text-zinc-500 uppercase mb-2 tracking-widest">Email Address</label>
            <input 
              type="email" required
              className="w-full bg-background border border-white/10 rounded-xl p-4 text-white focus:border-accent outline-none"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] text-zinc-500 uppercase mb-2 tracking-widest">Passkey</label>
            <input 
              type="password" required
              className="w-full bg-background border border-white/10 rounded-xl p-4 text-white focus:border-accent outline-none"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 md:col-span-2 grid grid-cols-3 gap-4">
            <div>
              <label className="block font-mono text-[8px] text-accent uppercase mb-2">Height (CM)</label>
              <input 
                type="number" required
                className="w-full bg-transparent border-b border-white/20 p-2 text-white outline-none focus:border-accent"
                onChange={(e) => setFormData({...formData, height: e.target.value})}
              />
            </div>
            <div>
              <label className="block font-mono text-[8px] text-accent uppercase mb-2">Weight (KG)</label>
              <input 
                type="number" required
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                className="w-full bg-transparent border-b border-white/20 p-2 text-white outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block font-mono text-[8px] text-accent uppercase mb-2">Goal (KG)</label>
              <input 
                type="number" required
                onChange={(e) => setFormData({...formData, targetWeight: e.target.value})}
                className="w-full bg-transparent border-b border-white/20 p-2 text-white outline-none focus:border-accent"
              />
            </div>
          </div>

          <button className="md:col-span-2 w-full bg-accent text-black font-bold py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-cyan-300 transition-colors">
            Initialize Profile
          </button>
        </form>

        <p className="mt-8 text-center font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
          Existing user? <Link to="/login" className="text-accent hover:underline">Return to Access Portal</Link>
        </p>
      </motion.div>
    </div>
  );
};