import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Bug, GitPullRequest, RefreshCw, Loader2, Sparkles, Code2 } from 'lucide-react';
import DiffViewer from './DiffViewer';

export default function BugHunterView({ bugs, onScan, isScanning, onDraftPR, onUpdateStatus }) {
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [activeBugId, setActiveBugId] = useState(null);

  const filteredBugs = bugs.filter(b => {
    if (filterSeverity === 'all') return true;
    return b.severity === filterSeverity;
  });

  const severityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">Critical</span>;
      case 'high':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">High</span>;
      case 'medium':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">Medium</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-slate-500/20 text-slate-300 border border-slate-500/40">{severity}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Security & Bug Hunter Agent</h2>
          </div>
          <p className="text-sm text-slate-400">
            Autonomous static heuristics, vulnerability patterns, and AI-driven logic audit with automated code fixes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] disabled:opacity-50 text-white font-medium rounded-xl border border-[#30363d] transition text-sm shadow"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Auditing Codebase...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>Trigger Deep Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
              filterSeverity === sev
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-[#161b22] text-slate-400 border border-[#30363d] hover:bg-[#21262d]'
            }`}
          >
            {sev} ({sev === 'all' ? bugs.length : bugs.filter(b => b.severity === sev).length})
          </button>
        ))}
      </div>

      {/* Bugs List */}
      {filteredBugs.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">No Issues Detected in this Category</h3>
          <p className="text-sm text-slate-400">Clean bill of health or scan pending for this repository.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBugs.map((bug) => {
            const isExpanded = activeBugId === bug._id;
            return (
              <div
                key={bug._id}
                className="glass-panel p-5 rounded-2xl border border-[#30363d] hover:border-slate-600 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#30363d]/70">
                  <div className="flex items-center gap-3">
                    <Bug className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-base">{bug.title}</span>
                        {severityBadge(bug.severity)}
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0d1117] text-slate-400 border border-[#30363d]">
                          {bug.category}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-emerald-400 mt-1">
                        {bug.filePath}:{bug.lineStart}-{bug.lineEnd}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDraftPR([bug._id])}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
                    >
                      <GitPullRequest className="w-3.5 h-3.5" />
                      <span>Draft PR Fix</span>
                    </button>
                    <button
                      onClick={() => setActiveBugId(isExpanded ? null : bug._id)}
                      className="px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-300 text-xs font-medium border border-[#30363d] transition"
                    >
                      {isExpanded ? 'Hide Details' : 'View Fix & Diff'}
                    </button>
                  </div>
                </div>

                {/* Bug Description */}
                <div className="py-3 text-sm text-slate-300 leading-relaxed">
                  {bug.description}
                </div>

                {/* Expanded Details: Diff & Explanation */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[#30363d] space-y-4">
                    {bug.explanation && (
                      <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs text-slate-300">
                        <span className="font-bold text-emerald-400 mr-1">Agent Explanation:</span>
                        {bug.explanation}
                      </div>
                    )}

                    {/* Diff Viewer */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-cyan-400" /> Automated Code Fix Diff
                      </h4>
                      <DiffViewer patch={bug.diffPatch} title={`Fix Patch for ${bug.filePath}`} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
