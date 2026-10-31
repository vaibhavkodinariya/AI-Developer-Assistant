import React, { useState, useEffect } from 'react';
import { Search, Github, Sparkles, Loader2, History } from 'lucide-react';

export default function RepoSelector({ activeRepo, onAnalyze, isLoading, recentRepos, onSelectRepo }) {
  const [repoInput, setRepoInput] = useState('expressjs/express');

  useEffect(() => {
    if (activeRepo) {
      setRepoInput(activeRepo.fullName || `${activeRepo.owner}/${activeRepo.name}`);
    }
  }, [activeRepo]);

  const presetRepos = [
    { label: 'Express.js', value: 'expressjs/express' },
    { label: 'React', value: 'facebook/react' },
    { label: 'FastAPI', value: 'fastapi/fastapi' },
    { label: 'Axios', value: 'axios/axios' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (repoInput.trim()) {
      onAnalyze(repoInput.trim());
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Github className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="Enter GitHub URL or owner/repo (e.g., expressjs/express, facebook/react)"
              className="w-full pl-11 pr-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-sm transition"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !repoInput.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Repository...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Launch Analysis</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Presets & History */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#30363d]/60 text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Presets:
          </span>
          {presetRepos.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => {
                setRepoInput(preset.value);
                onAnalyze(preset.value);
              }}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-300 border border-[#30363d] transition font-mono"
            >
              {preset.label}
            </button>
          ))}

          {recentRepos && recentRepos.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-slate-400 flex items-center gap-1">
                <History className="w-3.5 h-3.5 text-emerald-400" /> Recent:
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {recentRepos.slice(0, 3).map((r) => (
                  <button
                    key={r._id}
                    type="button"
                    onClick={() => onSelectRepo(r)}
                    className="px-2 py-0.5 rounded bg-[#161b22] hover:bg-[#21262d] text-emerald-400 border border-emerald-500/20 font-mono"
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
