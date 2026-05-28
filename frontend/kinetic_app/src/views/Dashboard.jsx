import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Calendar, Target, Zap, 
  Plus, ArrowUpRight, ChevronRight, Terminal 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [latestSession, setLatestSession] = useState(null);
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [personalRecords, setPersonalRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 📡 DATA ACQUISITION ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('kinetic_token');
      const headers = { headers: { 'x-auth-token': token } };

      try {
        const [userRes, latestRes, allRes, prRes] = await Promise.all([
          api.get('/api/auth/me', headers),
          api.get('/api/workouts/latest', headers),
          api.get('/api/workouts/all', headers),
          api.get('/api/workouts/prs', headers)
        ]);

        setUserData(userRes.data);
        setLatestSession(latestRes.data);
        setAllWorkouts(allRes.data);
        setPersonalRecords(prRes.data);
      } catch (err) {
        console.error("PERFORMANCE_HUB_SYNC_FAILURE", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- 🧮 CALCULATION ENGINES ---
  const calculateTotalVolumeTons = () => {
    let totalKg = 0;
    allWorkouts.forEach(session => {
      session.exercises?.forEach(ex => {
        ex.sets?.forEach(set => totalKg += (Number(set.weight) * Number(set.reps)));
      });
    });
    return (totalKg / 1000).toFixed(1);
  };

  const getTimeAgo = (date) => {
    const diffTime = Math.abs(new Date() - new Date(date));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "TODAY";
    if (diffDays === 1) return "YESTERDAY";
    if (diffDays < 7) return `${diffDays} DAYS AGO`;
    return `${Math.floor(diffDays / 7)} WEEK AGO`;
  };

  const chartData = allWorkouts.slice(0, 7).reverse().map(session => ({
    date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: session.exercises?.reduce((acc, ex) => 
      acc + ex.sets?.reduce((sAcc, set) => sAcc + (Number(set.weight) * Number(set.reps)), 0), 0)
  }));

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-cyan-400 font-mono animate-pulse uppercase tracking-[0.5em]">Initializing_Hub...</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 pb-20 px-2 sm:px-4">
      
      {/* 1. PERFORMANCE HUB HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3 sm:space-y-4"
      >
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
          Performance Hub
        </h1>
        <p className="text-zinc-500 font-medium text-sm sm:text-lg px-2">
          Welcome back, {userData?.name || 'Athlete'}. Here's your current standing.
        </p>
        <button 
          onClick={() => navigate('/log')}
          className="mt-4 sm:mt-6 flex items-center gap-3 mx-auto bg-cyan-400 text-black font-black px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs"
        >
          <Plus size={18} strokeWidth={3} /> Start Tracking
        </button>
      </motion.div>

      {/* 2. CORE METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          icon={<TrendingUp size={20} />} 
          label="Total Volume" 
          value={`${calculateTotalVolumeTons()}t`} 
          subtext="Lifetime Load" 
          color="text-cyan-400"
          bgColor="bg-cyan-400/10"
        />
        <StatCard 
          icon={<Calendar size={20} />} 
          label="Workouts" 
          value={allWorkouts.length} 
          subtext="Completed Sessions" 
          color="text-blue-400"
          bgColor="bg-blue-400/10"
        />
        <StatCard 
          icon={<Target size={20} />} 
          label="Current Weight" 
          value={`${userData?.profile?.weight || 0}kg`} 
          subtext="Latest Check-in" 
          color="text-indigo-400"
          bgColor="bg-indigo-400/10"
        />
        <StatCard 
          icon={<Zap size={20} />} 
          label="Last Session" 
          value={latestSession ? new Date(latestSession.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None'} 
          subtext={latestSession?.exercises?.[0]?.name || 'No Data'} 
          color="text-purple-400"
          bgColor="bg-purple-400/10"
        />
      </div>

      {/* 3. TRENDS & PR ARCHIVE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* VOLUME TREND VISUALIZER */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-zinc-900/40 border border-white/5 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-3xl"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center mb-6 sm:mb-10">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-cyan-400" size={20} />
              <h3 className="text-lg sm:text-xl font-bold text-white uppercase italic">Volume Trend</h3>
            </div>
            <select className="bg-zinc-800 border border-white/10 text-zinc-400 text-[10px] uppercase font-mono rounded-xl px-4 py-2 outline-none w-full sm:w-auto">
              <option>Last 7 Sessions</option>
            </select>
          </div>
          
          <div className="h-[250px] sm:h-[350px] w-full flex items-center justify-center">
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '16px', color: '#fff' }}
                    itemStyle={{ color: '#22d3ee' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#22d3ee" 
                    fillOpacity={1} 
                    fill="url(#colorVol)" 
                    strokeWidth={4} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-zinc-600 font-mono text-sm italic uppercase tracking-widest">Insufficient Data</p>
                <p className="text-zinc-800 text-[10px] uppercase">Complete 2+ sessions to generate trend</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* AUTOMATED PR MATRIX */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-zinc-900/40 border border-white/5 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-3xl flex flex-col"
        >
          <h3 className="text-lg sm:text-xl font-bold text-white mb-6 sm:mb-8 uppercase italic">Recent PRs</h3>
          <div className="space-y-4 flex-grow overflow-y-auto pr-2 custom-scrollbar max-h-[300px] lg:max-h-[350px]">
            {personalRecords.length > 0 ? (
              personalRecords.slice(0, 6).map((pr, idx) => (
                <PRItem 
                  key={idx}
                  exercise={pr.exercise} 
                  date={getTimeAgo(pr.date)} 
                  weight={pr.weight} 
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-48 lg:h-full text-center space-y-4 opacity-20">
                <Target size={48} />
                <p className="text-zinc-500 font-mono text-xs uppercase">No PRs archived</p>
              </div>
            )}
          </div>
          <button className="w-full mt-6 sm:mt-10 flex items-center justify-center gap-2 text-zinc-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest">
            View All Achievements <ChevronRight size={14} />
          </button>
        </motion.div>

      </div>
    </div>
  );
};

// --- 🧩 COMPONENTS ---

const StatCard = ({ icon, label, value, subtext, color, bgColor }) => (
  <div className="relative group bg-zinc-900/40 border border-white/5 p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] hover:border-white/10 transition-all overflow-hidden">
    <div className={`w-10 h-10 ${bgColor} ${color} rounded-xl flex items-center justify-center mb-4 sm:mb-6`}>
      {icon}
    </div>
    <ArrowUpRight className="absolute top-6 sm:top-8 right-6 sm:right-8 text-zinc-800 group-hover:text-zinc-500 transition-colors" size={18} />
    <p className="text-zinc-500 text-sm font-medium">{label}</p>
    <h2 className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">{value}</h2>
    <p className="text-zinc-600 font-mono text-[9px] uppercase tracking-[0.2em] mt-2">{subtext}</p>
  </div>
);

const PRItem = ({ exercise, date, weight }) => (
  <div className="bg-white/5 border border-white/5 p-4 sm:p-5 rounded-2xl flex justify-between items-center group hover:bg-white/10 hover:border-cyan-400/20 transition-all cursor-pointer">
    <div className="min-w-0 flex-1 pr-2">
      <h4 className="text-white font-bold uppercase text-sm tracking-tight truncate">{exercise}</h4>
      <p className="text-zinc-600 text-[9px] font-mono uppercase mt-1">{date}</p>
    </div>
    <div className="text-right shrink-0">
      <span className="text-cyan-400 font-black text-xl leading-none">{weight}</span>
      <span className="text-zinc-600 text-[9px] font-bold ml-1 uppercase">kg</span>
    </div>
  </div>
);