import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig'; // ✅ NEW: centralized axios instance

export const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // ✅ CLEAN API CALL (no localhost, no manual URL)
      const res = await api.post('/api/auth/login', {
        email,
        password
      });

      // Save token
      localStorage.setItem('kinetic_token', res.data.token);

      // Update auth state
      setAuth(true);

      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || "AUTHENTICATION_FAILED");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="w-full max-w-md space-y-8 bg-zinc-900/40 border border-white/5 p-10 rounded-[3rem] backdrop-blur-3xl">

        {/* HEADER */}
        <div className="text-center">
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            Access System
          </h2>
          <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-[0.4em] mt-2">
            Initialize Session
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-6">

          <input
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-cyan-400 transition-all text-sm font-mono"
            required
          />

          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-cyan-400 transition-all text-sm font-mono"
            required
          />

          <button
            type="submit"
            className="w-full bg-cyan-400 text-black font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform"
          >
            Authorize Entry
          </button>
        </form>

        {/* REGISTER LINK */}
        <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest text-center pt-4">
          New Operator?{" "}
          <Link
            to="/register"
            className="text-cyan-400 hover:text-white transition-colors underline underline-offset-4"
          >
            Create Account
          </Link>
        </p>

      </div>
    </div>
  );
};