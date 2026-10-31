import React, { useState } from 'react';
import { X, Key, Github, Sparkles, Check, ShieldCheck, Database } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, onSaveTokens, initialTokens }) {
  const [githubToken, setGithubToken] = useState(initialTokens?.githubToken || '');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveTokens({ githubToken });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel p-6 rounded-2xl w-full max-w-lg border border-[#30363d] relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#21262d] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Assistant Integrations & Keys</h3>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Github className="w-4 h-4 text-slate-400" />
              GitHub Personal Access Token (PAT)
            </label>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (Optional for public repos)"
              className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-emerald-500 transition"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Provides higher rate limits (5,000 req/hr) and enables direct branch commits and PR creation on GitHub.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2 text-xs">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> System Engine Status
            </div>
            <div className="text-slate-400 flex items-center justify-between">
              <span>OpenAI API / Agents Engine:</span>
              <span className="text-emerald-400 font-mono">Configured via .env</span>
            </div>
            <div className="text-slate-400 flex items-center justify-between">
              <span>MongoDB Persistence:</span>
              <span className="text-emerald-400 font-mono">Active (Mongoose + Auto Memory Fallback)</span>
            </div>
            <div className="text-slate-400 flex items-center justify-between">
              <span>Real-Time Event Stream:</span>
              <span className="text-emerald-400 font-mono">Server-Sent Events (SSE) Enabled</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#30363d]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-emerald-600/20"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
