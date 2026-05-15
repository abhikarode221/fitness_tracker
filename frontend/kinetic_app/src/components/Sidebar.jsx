import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Dumbbell, History, Library, Utensils,
  Sparkles, Settings, LogOut 
} from 'lucide-react';

export const Sidebar = () => {
  const navigate = useNavigate();
  // ✅ ADDED: State to store user data
  const [user, setUser] = useState(null);

  // ✅ ADDED: Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('kinetic_token');
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { 'x-auth-token': token }
        });
        setUser(res.data);
      } catch (err) {
        console.error("SIDEBAR_SYNC_ERROR");
      }
    };
    fetchUser();
  }, []);

  // ✅ HELPER: Get initials from name (e.g., "Abhishek Karode" -> "AK")
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem("kinetic_token");
    window.location.href = "/login"; 
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-950 border-r border-white/5 flex flex-col p-6 z-50">
      {/* LOGO SECTION */}
      <div className="flex items-center gap-3 px-2 mb-12">
        <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center text-black">
          <Dumbbell size={20} strokeWidth={3} />
        </div>
        <span className="text-2xl font-black tracking-tighter italic text-white uppercase">Kinetic</span>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-grow space-y-2">
        <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <NavItem to="/log" icon={<Dumbbell size={20} />} label="Log Workout" />
        <NavItem to="/history" icon={<History size={20} />} label="History" />
        <NavItem to="/library" icon={<Library size={20} />} label="Library" />
        <NavItem to="/nutrition" icon={<Utensils size={20} />} label="Nutrition" />
        <NavItem to="/ai-coach" icon={<Sparkles size={20} />} label="AI Coach" />
        <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
      </nav>

      {/* USER PROFILE & LOGOUT */}
      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between group">
        <div className="flex items-center gap-3">
          {/* ✅ UPDATED: Dynamic Initials */}
          <div className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center text-cyan-400 font-bold text-xs shadow-inner">
            {user ? getInitials(user.name) : "..."}
          </div>
          <div className="text-left">
            {/* ✅ UPDATED: Dynamic Name */}
            <p className="text-white font-bold text-sm leading-none mb-1 truncate w-24">
              {user ? user.name : "Athlete"}
            </p>
            <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">Pro Member</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          title="Terminate Session"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group
      ${isActive ? 'bg-zinc-900 text-cyan-400 shadow-xl border border-white/5' : 'text-zinc-500 hover:text-zinc-200'}
    `}
  >
    <span className="transition-transform duration-300 group-hover:scale-110">{icon}</span>
    <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
  </NavLink>
);