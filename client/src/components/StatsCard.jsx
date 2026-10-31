import React from 'react';

export default function StatsCard({ icon: Icon, title, value, subtext, color = 'emerald' }) {
  const colorMap = {
    emerald: 'from-emerald-500/10 to-teal-500/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/10 to-yellow-500/5 text-amber-400 border-amber-500/20',
    rose: 'from-rose-500/10 to-red-500/5 text-rose-400 border-rose-500/20',
    blue: 'from-blue-500/10 to-cyan-500/5 text-blue-400 border-blue-500/20',
    purple: 'from-purple-500/10 to-indigo-500/5 text-purple-400 border-purple-500/20'
  };

  return (
    <div className={`p-4 rounded-xl border bg-gradient-to-br ${colorMap[color] || colorMap.emerald} backdrop-blur`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <div className="p-2 rounded-lg bg-[#161b22]/70 border border-[#30363d]">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      {subtext && <div className="text-xs text-slate-400 mt-1">{subtext}</div>}
    </div>
  );
}
