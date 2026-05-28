import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, Edit3, Trash2, X, Plus, Save, Calendar } from 'lucide-react';
import api from '../api/axiosConfig';

export const History = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null); // The workout being edited

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('kinetic_token');
      const res = await api.get('/api/workouts/all', {
        headers: { 'x-auth-token': token }
      });
      setWorkouts(res.data);
    } catch (err) {
      console.error("HISTORY_SYNC_FAILED");
    } finally {
      setLoading(false);
    }
  };

  const handlePurge = async (id) => {
    if (!window.confirm("CONFIRM_PURGE: PERMANENTLY_DELETE_SESSION?")) return;
    try {
      const token = localStorage.getItem('kinetic_token');
      await api.delete(`/api/workouts/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setWorkouts(workouts.filter(w => w._id !== id));
    } catch (err) {
      alert("PURGE_FAILED");
    }
  };

  const commitUpdate = async () => {
    try {
      const token = localStorage.getItem('kinetic_token');
      await api.put(`/api/workouts/${editTarget._id}`, 
        { exercises: editTarget.exercises },
        { headers: { 'x-auth-token': token } }
      );
      setEditTarget(null);
      fetchHistory(); // Refresh list
    } catch (err) {
      alert("UPDATE_FAILED");
    }
  };

  if (loading) return <div className="p-20 font-mono text-cyan-400 animate-pulse">Accessing_Archives...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 pb-20 px-2 sm:px-4">
      <header className="px-1">
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Session History</h1>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em] mt-2">Historical Performance Logs</p>
      </header>

      <div className="space-y-6">
        {workouts.length > 0 ? (
          workouts.map((workout) => (
            <motion.div 
              key={workout._id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/40 border border-white/5 p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] backdrop-blur-3xl group"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center mb-6">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="p-3 bg-zinc-800 rounded-2xl text-zinc-500 shrink-0"><Calendar size={20} /></div>
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-lg sm:text-xl uppercase italic tracking-tight truncate">
                      {new Date(workout.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h3>
                    <p className="text-zinc-600 font-mono text-[9px] uppercase tracking-widest">Archive ID: {workout._id.slice(-6)}</p>
                  </div>
                </div>
                {/* Actions: Always visible on touch-screens (opacity-100), hidden by default on desktop (md:opacity-0) and shows on group hover (md:group-hover:opacity-100) */}
                <div className="flex gap-2 self-end sm:self-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditTarget(JSON.parse(JSON.stringify(workout)))} className="p-2.5 sm:p-3 bg-white/5 hover:bg-cyan-400 hover:text-black text-zinc-500 rounded-xl transition-all" title="Edit session"><Edit3 size={18} /></button>
                  <button onClick={() => handlePurge(workout._id)} className="p-2.5 sm:p-3 bg-white/5 hover:bg-red-500 hover:text-white text-zinc-500 rounded-xl transition-all" title="Delete session"><Trash2 size={18} /></button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workout.exercises.map((ex, idx) => (
                  <div key={idx} className="bg-black/40 border border-white/5 p-4 rounded-2xl">
                    <h4 className="text-cyan-400 font-bold text-xs uppercase tracking-tighter mb-2">{ex.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {ex.sets.map((set, sIdx) => (
                        <span key={sIdx} className="text-[10px] font-mono text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-md">
                          {set.weight}kg × {set.reps}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 sm:py-20 bg-zinc-900/20 border border-dashed border-white/5 rounded-3xl sm:rounded-[3rem]">
            <HistoryIcon className="mx-auto text-zinc-800 mb-4" size={48} />
            <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest">No archives found</p>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editTarget && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditTarget(null)} className="absolute inset-0 bg-black/95 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] shadow-2xl max-h-[80vh] overflow-y-auto custom-scrollbar mx-2 z-10">
              <div className="flex justify-between items-center mb-6 sm:mb-10">
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tighter">Recalibrate Session</h2>
                <button onClick={() => setEditTarget(null)} className="text-zinc-500 hover:text-white"><X size={24} /></button>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {editTarget.exercises.map((ex, eIdx) => (
                  <div key={eIdx} className="space-y-4 bg-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                    <h4 className="text-white font-bold uppercase text-xs sm:text-sm tracking-widest">{ex.name}</h4>
                    {ex.sets.map((set, sIdx) => (
                      <div key={sIdx} className="flex gap-4 items-center">
                        <input 
                          type="number" value={set.weight} 
                          onChange={(e) => {
                            const newData = {...editTarget};
                            newData.exercises[eIdx].sets[sIdx].weight = e.target.value;
                            setEditTarget(newData);
                          }}
                          className="w-full bg-black border border-white/5 p-3 rounded-xl text-white text-xs font-bold"
                        />
                        <span className="text-zinc-700 font-mono text-[10px]">X</span>
                        <input 
                          type="number" value={set.reps} 
                          onChange={(e) => {
                            const newData = {...editTarget};
                            newData.exercises[eIdx].sets[sIdx].reps = e.target.value;
                            setEditTarget(newData);
                          }}
                          className="w-full bg-black border border-white/5 p-3 rounded-xl text-white text-xs font-bold"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <button onClick={commitUpdate} className="w-full mt-6 sm:mt-10 bg-cyan-400 text-black font-black py-4 sm:py-5 rounded-2xl uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                <Save size={16} /> Update Archive
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};