import React, { useState } from 'react';
import { Utensils } from 'lucide-react';

export const CalorieTracker = () => {
  const [consumed, setConsumed] = useState(1850);
  const target = 2500;
  const percentage = (consumed / target) * 100;

  return (
    <div className="glass-card p-6 bg-surface border border-white/5 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Energy Intake</h4>
        <Utensils size={18} className="text-accent" />
      </div>
      
      <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden mb-4">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${percentage}%` }}
          className="absolute h-full bg-accent"
        />
      </div>
      
      <div className="flex justify-between items-end">
        <div>
          <p className="text-2xl font-bold font-mono">{consumed}</p>
          <p className="font-mono text-[10px] text-zinc-500 uppercase">KCAL CONSUMED</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-zinc-500">{target}</p>
          <p className="font-mono text-[10px] text-zinc-500 uppercase">DAILY TARGET</p>
        </div>
      </div>
    </div>
  );
};