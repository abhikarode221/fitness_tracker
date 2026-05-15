import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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

  useEffect(() => {
    const token = localStorage.getItem("kinetic_token");
    if (token) setIsAuthenticated(true);
  }, []);

  return (
    <Router>
      <div className="flex min-h-screen bg-background text-zinc-100">

        {isAuthenticated && <Sidebar />}

        <main className={`${isAuthenticated ? "ml-20 md:ml-64" : ""} p-8 w-full`}>
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