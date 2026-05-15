import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Save, Plus, X, Trash2 } from 'lucide-react';
import axios from 'axios';

export const LogWorkout = () => {
  // --- State Management ---
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isNewExModalOpen, setIsNewExModalOpen] = useState(false);
  
  const [sessionData, setSessionData] = useState([]);
  const [currentSets, setCurrentSets] = useState([{ reps: '', weight: '' }]);
  const [newExForm, setNewExForm] = useState({ name: '', muscle: '' });
  
  const currentDate = new Date().toLocaleDateString('en-US');

  // --- 📡 Data Synchronization ---
  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const token = localStorage.getItem('kinetic_token');
        const res = await axios.get('http://localhost:5000/api/exercises', {
          headers: { 'x-auth-token': token }
        });
        setLibrary(res.data);
      } catch (err) {
        console.error("LIBRARY_SYNC_FAILED");
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  // --- 🛠️ Logic Handlers ---
  const openEntryModal = (exercise) => {
    setSelectedExercise(exercise);
    setCurrentSets([{ reps: '', weight: '' }]);
  };

  const commitExercise = () => {
    setSessionData([...sessionData, { ...selectedExercise, sets: currentSets }]);
    setSelectedExercise(null);
  };

  const handleCreateNewModule = async () => {
    if (newExForm.name && newExForm.muscle) {
      try {
        const token = localStorage.getItem('kinetic_token');
        const res = await axios.post('http://localhost:5000/api/exercises/add', 
          newExForm,
          { headers: { 'x-auth-token': token } }
        );
        setLibrary([...library, res.data]);
        setNewExForm({ name: '', muscle: '' });
        setIsNewExModalOpen(false);
      } catch (err) {
        alert(err.response?.data?.error || "MODULE_CREATION_FAILED");
      }
    }
  };

  const handleDeleteModule = async (e, exId) => {
    e.stopPropagation(); // Prevents opening the "Log Workout" modal
    
    if (!window.confirm("CONFIRM_DECOMMISSION: PERMANENTLY_REMOVE_MODULE?")) return;

    try {
      const token = localStorage.getItem('kinetic_token');
      await axios.delete(`http://localhost:5000/api/exercises/${exId}`, {
        headers: { 'x-auth-token': token }
      });
      
      // Update local state to remove the module immediately
      setLibrary(library.filter(ex => ex._id !== exId));
    } catch (err) {
      alert(err.response?.data?.error || "DECOMMISSION_ERROR");
    }
  };

  const saveFullSession = async () => {
    try {
      const token = localStorage.getItem('kinetic_token');
      await axios.post('http://localhost:5000/api/workouts/log', 
        { exercises: sessionData },
        { headers: { 'x-auth-token': token } }
      );
      alert("SYSTEM_SYNC: SESSION_ARCHIVED");
      setSessionData([]);
    } catch (err) {
      alert("SYNC_ERROR: UNABLE_TO_REACH_DATABASE");
    }
  };

  if (loading) return <div className="p-20 text-cyan-400 font-mono animate-pulse uppercase tracking-widest">Booting_Library...</div>;

  return (
    <div className="space-y-10 min-h-screen pb-20">
      {/* HEADER */}
      <header className="flex justify-between items-center">
        <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">
          Session <span className="text-zinc-500">— {currentDate}</span>
        </h1>
        <button 
          onClick={saveFullSession}
          disabled={sessionData.length === 0}
          className="flex items-center gap-3 bg-cyan-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black px-8 py-4 rounded-2xl transition-all uppercase tracking-widest text-[10px]"
        >
          <Save size={16} /> Save Session ({sessionData.length})
        </button>
      </header>

      {/* SELECTION MATRIX */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-12 backdrop-blur-3xl">
        <div className="flex justify-between items-center mb-12">
          <h3 className="font-mono text-[10px] text-cyan-400 uppercase tracking-[0.4em]">
            Append Exercise Module
          </h3>
          <button 
            onClick={() => setIsNewExModalOpen(true)}
            className="flex items-center gap-2 text-zinc-500 hover:text-white font-mono text-[9px] uppercase tracking-widest transition-all border border-white/5 hover:border-white/20 px-4 py-2 rounded-full"
          >
            <Plus size={12} /> Create New Module
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {library.map((ex, idx) => (
            <motion.button
              key={ex._id || idx}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.02)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openEntryModal(ex)}
              className="relative bg-zinc-950/50 border border-white/5 p-12 rounded-[2rem] flex flex-col items-center gap-5 hover:border-cyan-400/40 transition-all group"
            >
              {/* 🗑️ DELETE ICON: Only visible for custom modules */}
              {ex.owner && (
                <button
                  onClick={(e) => handleDeleteModule(e, ex._id)}
                  className="absolute top-6 right-6 p-2 text-zinc-700 hover:text-red-500 transition-colors z-10"
                >
                  <Trash2 size={16} />
                </button>
              )}

              <div className="bg-zinc-900 p-5 rounded-2xl text-zinc-600 group-hover:text-cyan-400 transition-colors shadow-inner">
                <Dumbbell size={32} strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <h4 className="text-white font-black text-xl uppercase italic tracking-tight">{ex.name}</h4>
                <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mt-1">{ex.muscle}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* MODAL 1: CREATE NEW MODULE */}
      <AnimatePresence>
        {isNewExModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsNewExModalOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-md" />
            
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 p-10 rounded-[3rem] shadow-2xl"
            >
              <div className="mb-8 text-left">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">New Module</h2>
                <p className="text-cyan-400 font-mono text-[9px] uppercase tracking-[0.3em] mt-1">Expansion Sequence</p>
              </div>

              <div className="space-y-6">
                <div className="text-left">
                  <label className="block font-mono text-[9px] text-zinc-500 uppercase mb-2 ml-1">Module Name</label>
                  <input 
                    type="text" placeholder="e.g. LAT PULLDOWN" 
                    className="w-full bg-black border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-cyan-400/40 transition-all text-sm font-bold uppercase"
                    value={newExForm.name}
                    onChange={(e) => setNewExForm({...newExForm, name: e.target.value})}
                  />
                </div>
                <div className="text-left">
                  <label className="block font-mono text-[9px] text-zinc-500 uppercase mb-2 ml-1">Target Muscle</label>
                  <input 
                    type="text" placeholder="e.g. BACK" 
                    className="w-full bg-black border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-cyan-400/40 transition-all text-sm font-bold uppercase"
                    value={newExForm.muscle}
                    onChange={(e) => setNewExForm({...newExForm, muscle: e.target.value})}
                  />
                </div>
                <button 
                  onClick={handleCreateNewModule}
                  className="w-full bg-white text-black font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-[10px]"
                >
                  Authorize Module
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: PERFORMANCE DATA ENTRY */}
      <AnimatePresence>
        {selectedExercise && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedExercise(null)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-white/10 p-10 rounded-[3rem] shadow-2xl"
            >
              <div className="flex justify-between items-start mb-10">
                <div className="text-left">
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">{selectedExercise.name}</h2>
                  <p className="text-cyan-400 font-mono text-[9px] uppercase tracking-[0.3em] mt-1">Data Entry Sequence</p>
                </div>
                <button onClick={() => setSelectedExercise(null)} className="text-zinc-600 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {currentSets.map((set, idx) => (
                  <div key={idx} className="flex items-center gap-4 group">
                    <span className="font-mono text-zinc-700 text-[10px] w-8 italic">S.{idx + 1}</span>
                    <input 
                      type="number" placeholder="KG" 
                      className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-cyan-400/40 transition-all text-sm font-bold"
                      value={set.weight}
                      onChange={(e) => { const n = [...currentSets]; n[idx].weight = e.target.value; setCurrentSets(n); }}
                    />
                    <input 
                      type="number" placeholder="REPS" 
                      className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-cyan-400/40 transition-all text-sm font-bold"
                      value={set.reps}
                      onChange={(e) => { const n = [...currentSets]; n[idx].reps = e.target.value; setCurrentSets(n); }}
                    />
                    <button onClick={() => setCurrentSets(currentSets.filter((_, i) => i !== idx))} className="text-zinc-800 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-10 grid grid-cols-1 gap-3">
                <button onClick={() => setCurrentSets([...currentSets, { reps: '', weight: '' }])} className="w-full flex items-center justify-center gap-2 border border-white/5 hover:bg-white/5 text-zinc-500 py-4 rounded-2xl font-mono text-[9px] uppercase tracking-widest transition-all">
                  <Plus size={14} /> Add Set Module
                </button>
                <button onClick={commitExercise} className="w-full bg-white text-black font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-[10px]">
                  Confirm & Append
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};