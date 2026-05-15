import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';

export const WeightChart = ({ history, target }) => {
  // Format data for Recharts
  const chartData = history.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: entry.weight
  }));

  return (
    <div className="glass-card p-8 bg-surface border border-white/5 rounded-3xl h-[400px]">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Weight Progress vs Target</h3>
        <span className="text-accent font-mono text-xs tracking-tighter uppercase font-bold">Goal: {target} KG</span>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#52525b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            domain={['dataMin - 5', 'dataMax + 5']} 
            stroke="#52525b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111114', border: '1px solid #ffffff10', borderRadius: '12px' }}
            itemStyle={{ color: '#22d3ee', fontFamily: 'monospace', fontSize: '12px' }}
          />
          {/* Target Reference Line */}
          <ReferenceLine y={target} stroke="#22d3ee" strokeDasharray="5 5" label={{ value: 'TARGET', position: 'right', fill: '#22d3ee', fontSize: 10 }} />
          
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="#ffffff" 
            strokeWidth={3} 
            dot={{ fill: '#22d3ee', strokeWidth: 2, r: 4 }} 
            activeDot={{ r: 6, stroke: '#22d3ee', strokeWidth: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};