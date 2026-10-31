import React from 'react';

export default function DiffViewer({ patch, title = 'Proposed Fix Diff' }) {
  if (!patch) {
    return (
      <div className="p-4 rounded-lg bg-[#0d1117] border border-[#30363d] text-slate-500 font-mono text-xs">
        No unified diff patch available for this change.
      </div>
    );
  }

  const lines = patch.split('\n');

  return (
    <div className="rounded-xl border border-[#30363d] overflow-hidden bg-[#0d1117] font-mono text-xs">
      {title && (
        <div className="px-3 py-2 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between text-slate-400">
          <span className="font-semibold text-slate-300">{title}</span>
          <span className="text-[10px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
            Git Patch
          </span>
        </div>
      )}
      <div className="max-h-72 overflow-y-auto p-2 space-y-0.5 select-text">
        {lines.map((line, idx) => {
          let lineStyle = 'text-slate-400';
          let bgStyle = '';

          if (line.startsWith('+++') || line.startsWith('---')) {
            lineStyle = 'text-purple-400 font-bold';
            bgStyle = 'bg-purple-500/10';
          } else if (line.startsWith('@@')) {
            lineStyle = 'text-cyan-400 font-semibold';
            bgStyle = 'bg-cyan-500/10';
          } else if (line.startsWith('+')) {
            lineStyle = 'text-emerald-300';
            bgStyle = 'bg-emerald-500/15 border-l-2 border-emerald-500';
          } else if (line.startsWith('-')) {
            lineStyle = 'text-rose-300';
            bgStyle = 'bg-rose-500/15 border-l-2 border-rose-500';
          }

          return (
            <div key={idx} className={`px-2 py-0.5 flex gap-3 ${bgStyle}`}>
              <span className="w-8 text-right text-slate-600 select-none">{idx + 1}</span>
              <pre className={`flex-1 overflow-x-auto m-0 p-0 ${lineStyle}`}>{line}</pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}
