import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Menu, Dumbbell } from 'lucide-react';

import ProtectedRoute from './hooks/ProtectedRoute';

import { Sidebar } from './components/Sidebar';
import { Dashboard } from './views/Dashboard';
import { LogWorkout } from './views/LogWorkout';
import { History } from './views/History';
import { Settings } from './views/Settings';
import { Register } from './views/Register';
import { Login } from './views/Login';
import { AICoach } from './views/AICoach'; 
import {Library} from "./views/Library";
import { Nutrition } from './views/Nutrition';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("kinetic_token");
    if (token) setIsAuthenticated(true);
  }, []);

  return (
    <Router>
      <div className="flex min-h-screen bg-background text-zinc-100">

        {/* Desktop and Mobile Sidebar Drawer */}
        {isAuthenticated && (
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        )}

        {/* Mobile Navigation Header */}
        {isAuthenticated && (
          <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950 border-b border-white/5 flex items-center justify-between px-6 z-40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center text-black">
                <Dumbbell size={20} strokeWidth={3} />
              </div>
              <span className="text-xl font-black tracking-tighter italic text-white uppercase">Kinetic</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
              title="Open Navigation"
            >
              <Menu size={24} />
            </button>
          </div>
        )}

        <main className={`${isAuthenticated ? "ml-0 md:ml-64 pt-24 md:pt-8" : ""} p-4 md:p-8 w-full`}>
          <Routes>

            {/* Public */}
            <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
            <Route path="/register" element={<Register />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/log" element={<LogWorkout />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/ai-coach" element={<AICoach />} /> 
              <Route path="/library" element={<Library />} />
              <Route path="/nutrition" element={<Nutrition />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;