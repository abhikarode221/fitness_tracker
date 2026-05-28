import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Info, Filter, X, Dumbbell, Target, TrendingUp } from 'lucide-react';

const EXERCISE_DATABASE = [
  { id: 1, name: "Barbell Bench Press", area: "Chest", category: "Strength", difficulty: "Intermediate", desc: "The standard exercise for chest development. Focus on maintaining a slight arch in the lower back and driving the bar vertically while keeping elbows at a 45-degree angle." },
  { id: 2, name: "Barbell Back Squat", area: "Quads", category: "Strength", difficulty: "Intermediate", desc: "The king of all lower body exercises. Place the bar across your upper traps, squat down until hips are below knees, and drive upward through the mid-foot." },
  { id: 3, name: "Conventional Deadlift", area: "Back", category: "Strength", difficulty: "Advanced", desc: "A total body power movement. Pull a heavy barbell from the floor to hip height, engaging the posterior chain while maintaining a neutral spine throughout the pull." },
  { id: 4, name: "Pull-up", area: "Back", category: "Hypertrophy", difficulty: "Intermediate", desc: "An essential upper body pulling movement. Hang from a bar and pull your body up until your chin clears the bar, focusing on lat recruitment and controlled descent." },
  { id: 5, name: "Military Press", area: "Shoulders", category: "Strength", difficulty: "Intermediate", desc: "A strict overhead press performed while standing. Press the bar from your collarbone to a full lockout overhead without using leg drive." },
  { id: 6, name: "Bent Over Row", area: "Back", category: "Strength", difficulty: "Intermediate", desc: "A powerful horizontal pulling movement. Pull a barbell toward your waist while keeping your torso nearly parallel to the floor." },
];

export const Library = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL AREAS");
  // ✅ NEW: State for the selected exercise popup
  const [selectedExercise, setSelectedExercise] = useState(null);

  const categories = ["ALL AREAS", "STRENGTH", "CARDIO", "FLEXIBILITY", "HYPERTROPHY"];

  const filteredData = EXERCISE_DATABASE.filter(ex => 
    (filter === "ALL AREAS" || ex.category.toUpperCase() === filter) &&
    ex.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 md:space-y-10 pb-20 relative px-2 sm:px-4">
      <header className="px-1">
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Kinetic Index</h1>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em] mt-2">Comprehensive Movement Database</p>
      </header>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input 
            type="text" 
            placeholder="Search movements..."
            className="w-full bg-zinc-900/60 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-cyan-400/30 transition-all font-medium"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 flex-wrap justify-start w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 sm:px-6 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all ${
                filter === cat ? 'bg-cyan-400 text-black' : 'bg-zinc-900 text-zinc-500 border border-white/5 hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* EXERCISE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredData.map((ex) => (
          <motion.div 
            layoutId={`card-${ex.id}`}
            onClick={() => setSelectedExercise(ex)} // ✅ Trigger Popup
            key={ex.id}
            className="bg-zinc-900/40 border border-white/5 p-6 sm:p-8 rounded-3xl sm:rounded-[2rem] hover:bg-zinc-900/60 transition-all group relative cursor-pointer"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{ex.category}</span>
              <span className={`text-[8px] font-black px-3 py-1 rounded-md uppercase tracking-tighter ${
                ex.difficulty === 'Advanced' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
              }`}>
                {ex.difficulty}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">{ex.name}</h3>
            <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">{ex.desc}</p>
            
            {/* Actions: Always visible on touch-screens (opacity-100), hidden by default on desktop (md:opacity-0) and shows on group hover (md:group-hover:opacity-100) */}
            <div className="mt-6 flex items-center gap-2 text-cyan-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-bold uppercase tracking-widest">Analyze Details</span>
              <Info size={14} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ✅ POPUP MODAL (Tactical Briefing) */}
      <AnimatePresence>
        {selectedExercise && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExercise(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div 
              layoutId={`card-${selectedExercise.id}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-zinc-950 border border-white/10 w-full max-w-2xl rounded-3xl sm:rounded-[3rem] overflow-hidden shadow-2xl mx-2 z-10"
            >
              {/* Top Banner */}
              <div className="h-auto sm:h-32 bg-gradient-to-br from-cyan-400/20 to-transparent p-6 sm:p-10 flex justify-between items-start gap-4">
                <div>
                   <span className="text-cyan-400 font-mono text-[10px] uppercase tracking-[0.4em]">Movement_Analysis</span>
                   <h2 className="text-xl sm:text-3xl font-black text-white uppercase italic tracking-tighter mt-1 leading-none">{selectedExercise.name}</h2>
                </div>
                <button 
                  onClick={() => setSelectedExercise(null)}
                  className="p-2 sm:p-3 bg-black/40 text-zinc-500 hover:text-white rounded-2xl transition-all shrink-0"
                  title="Close Briefing"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <DetailBox icon={<Target className="text-cyan-400" size={16} />} label="Focus Area" value={selectedExercise.area} />
                  <DetailBox icon={<Dumbbell className="text-cyan-400" size={16} />} label="Category" value={selectedExercise.category} />
                  <DetailBox icon={<TrendingUp className="text-cyan-400" size={16} />} label="Difficulty" value={selectedExercise.difficulty} />
                </div>

                {/* Description Section */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-zinc-500 font-mono text-[9px] uppercase tracking-[0.3em]">Technical Instructions</h4>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-loose bg-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/5">
                    {selectedExercise.desc}
                  </p>
                </div>

                <button 
                  onClick={() => setSelectedExercise(null)}
                  className="w-full bg-cyan-400 py-3.5 rounded-2xl text-black font-black uppercase text-xs tracking-widest hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all mt-2"
                >
                  Close Briefing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-component for clean layout
const DetailBox = ({ icon, label, value }) => (
  <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl">
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-zinc-600 font-mono text-[8px] uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-white font-bold text-xs uppercase">{value}</p>
  </div>
);