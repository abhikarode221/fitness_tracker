import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Droplets, Trash2, Utensils, X } from 'lucide-react';

export const Nutrition = () => {

  // ===============================
  // STATE
  // ===============================
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState({ meals: [], waterIntake: 0 });
  
  // ✅ NEW: State for User Profile (Calorie Goals)
  const [userProfile, setUserProfile] = useState({ calorieGoal: 2500 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: '', calories: '', protein: '', carbs: '', fats: ''
  });

  // ✅ DYNAMIC GOAL: Derives from profile or defaults to 2500
  const activeCalorieGoal = userProfile.calorieGoal || 2500;

  // ===============================
  // DATA SYNC (Combined Fetch)
  // ===============================
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('kinetic_token');
      const headers = { 'x-auth-token': token };

      // 1. Fetch Today's Fuel Log
      const fuelRes = await api.get('/api/nutrition/today', { headers });
      setLog(fuelRes.data);

      // 2. Fetch Profile Metrics (The Bio-Sync)
      const profileRes = await api.get('/api/auth/me', { headers });
      if (profileRes.data.profile) {
        setUserProfile(profileRes.data.profile);
      }

    } catch (err) {
      console.error("SYSTEM_SYNC_ERROR", err);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // WATER UPDATE
  // ===============================
  const updateWater = async (amount) => {
    try {
      const token = localStorage.getItem('kinetic_token');
      const newTotal = Number((log.waterIntake + amount).toFixed(2));

      const res = await api.put(
        '/api/nutrition/water',
        { intake: newTotal },
        { headers: { 'x-auth-token': token } }
      );
      setLog(res.data);
    } catch (err) {
      console.error("WATER_SYNC_ERROR", err);
    }
  };

  // ===============================
  // ADD MEAL
  // ===============================
  const handleAddMeal = async () => {
    try {
      const token = localStorage.getItem('kinetic_token');
      const res = await api.post(
        '/api/nutrition/log-meal',
        newMeal,
        { headers: { 'x-auth-token': token } }
      );

      setLog(res.data);
      setIsModalOpen(false);
      setNewMeal({ name: '', calories: '', protein: '', carbs: '', fats: '' });
    } catch (err) {
      alert("SYSTEM_REJECTION: Check input values.");
    }
  };

  // ===============================
  // DELETE MEAL
  // ===============================
  const deleteMeal = async (mealId) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this meal?");
      if (!confirmed) return;

      const token = localStorage.getItem('kinetic_token');
      const res = await api.delete(
        `/api/nutrition/meal/${mealId}`,
        { headers: { 'x-auth-token': token } }
      );

    //   setLog(res.data); // Directly update state with returned log
    console.log("DELETE_RESPONSE", res.data);
    fetchAllData(); // Re-fetch to ensure sync after deletion
    } catch (err) {
      console.error("MEAL_DELETE_ERROR", err);
    }
  };

  // ===============================
  // TOTALS CALCULATION
  // ===============================
  const totals = log.meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + Number(meal.calories || 0),
      protein: acc.protein + Number(meal.protein || 0),
      carbs: acc.carbs + Number(meal.carbs || 0),
      fats: acc.fats + Number(meal.fats || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  if (loading) {
    return (
      <div className="p-20 font-mono text-cyan-400 animate-pulse uppercase">
        Syncing_Fuel_Center...
      </div>
    );
  }  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-10 pb-20 px-2 sm:px-4">
      
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Fuel Center</h1>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em] mt-2">Precise Intake Tracking</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-cyan-400 text-black font-black px-8 py-3.5 rounded-xl uppercase tracking-widest text-xs shadow-[0_0_20px_cyan]"
        >
          <Plus size={18} strokeWidth={3} /> Log Meal
        </button>
      </header>

      {/* ENERGY + HYDRATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 bg-zinc-900/40 border border-white/5 p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] backdrop-blur-3xl">
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-6">Energy Intake</p>
          <div className="flex flex-wrap items-baseline gap-2 sm:gap-4">
            <h2 className="text-5xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">{totals.calories}</h2>
            <span className="text-zinc-600 font-mono text-xs sm:text-sm uppercase">/ {activeCalorieGoal} KCAL</span>
          </div>

          <div className="w-full h-3 bg-zinc-800 rounded-full mt-6 sm:mt-8 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min((totals.calories / activeCalorieGoal) * 100, 100)}%`
              }}
              className="h-full bg-cyan-400 shadow-[0_0_15px_cyan]"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-8 sm:mt-10">
            <MacroMini label="Protein" value={`${totals.protein}g`} color="bg-cyan-400" />
            <MacroMini label="Carbs" value={`${totals.carbs}g`} color="bg-blue-500" />
            <MacroMini label="Fats" value={`${totals.fats}g`} color="bg-indigo-500" />
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] flex flex-col justify-between gap-6">
          <div>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-4 sm:mb-6">Hydration</p>
            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-none">{log.waterIntake.toFixed(2)} L</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 sm:mt-12">
            <button onClick={() => updateWater(0.25)} className="bg-white/5 py-4 rounded-xl text-[10px] font-bold text-zinc-400 uppercase hover:bg-white/10 transition-colors">+250ml</button>
            <button onClick={() => updateWater(0.5)} className="bg-white/5 py-4 rounded-xl text-[10px] font-bold text-zinc-400 uppercase hover:bg-white/10 transition-colors">+500ml</button>
          </div>
        </div>
      </div>

      {/* FEED LOG */}
      <div className="space-y-4">
        {log.meals.map(meal => (
          <div key={meal._id} className="bg-zinc-900/40 border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] flex justify-between items-center group">
            <div className="flex gap-3 sm:gap-6 items-center min-w-0">
               <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 shrink-0">
                 <Utensils size={18} className="sm:hidden" />
                 <Utensils size={20} className="hidden sm:block" />
               </div>
               <div className="min-w-0">
                 <h4 className="text-white font-bold text-sm sm:text-xl truncate">{meal.name}</h4>
                 <p className="text-zinc-600 font-mono text-[9px] uppercase">{meal.time}</p>
               </div>
            </div>
            <div className="flex gap-3 sm:gap-8 items-center shrink-0">
              <p className="text-cyan-400 font-black text-sm sm:text-xl">{meal.calories} KCAL</p>
              <button onClick={() => deleteMeal(meal._id)} className="p-2 text-zinc-700 hover:text-red-500 transition-colors" title="Delete meal">
                <Trash2 size={18} className="sm:hidden" />
                <Trash2 size={20} className="hidden sm:block" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-zinc-950 border border-white/10 p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] w-full max-w-md mx-2 z-10 shadow-2xl">
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tighter">Log Fuel</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button>
              </div>
              <div className="space-y-4">
                <input type="text" placeholder="Meal Name" className="w-full bg-black border border-white/5 p-4 rounded-xl text-white text-sm" value={newMeal.name} onChange={e => setNewMeal({...newMeal, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Cals" className="bg-black border border-white/5 p-4 rounded-xl text-white text-sm" value={newMeal.calories} onChange={e => setNewMeal({...newMeal, calories: e.target.value})} />
                  <input type="number" placeholder="Protein (g)" className="bg-black border border-white/5 p-4 rounded-xl text-white text-sm" value={newMeal.protein} onChange={e => setNewMeal({...newMeal, protein: e.target.value})} />
                  <input type="number" placeholder="Carbs (g)" className="bg-black border border-white/5 p-4 rounded-xl text-white text-sm" value={newMeal.carbs} onChange={e => setNewMeal({...newMeal, carbs: e.target.value})} />
                  <input type="number" placeholder="Fats (g)" className="bg-black border border-white/5 p-4 rounded-xl text-white text-sm" value={newMeal.fats} onChange={e => setNewMeal({...newMeal, fats: e.target.value})} />
                </div>
                <button onClick={handleAddMeal} className="w-full bg-cyan-400 py-3.5 rounded-2xl text-black font-black uppercase text-xs tracking-widest mt-2">Save Meal</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper Component for Macros
const MacroMini = ({ label, value, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest">
      <span className="text-zinc-500">{label}</span><span className="text-white">{value}</span>
    </div>
    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
      <div className={`h-full ${color} w-1/3 shadow-[0_0_8px_rgba(34,211,238,0.4)]`} />
    </div>
  </div>
);