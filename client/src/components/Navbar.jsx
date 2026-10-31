import React from 'react';
import { Bot, GitBranch, Github, Sparkles, Terminal, Settings } from 'lucide-react';

export default function Navbar({ activeRepo, isAgentRunning, onOpenSettings }) {
  return (
    <header className="border-b border-[#30363d] bg-[#0d1117]/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                AI Developer Assistant
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Agent Suite
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Code Analysis, Bug Fixing & PR Engine</p>
          </div>
        </div>

        {/* Center - Active Repo Info */}
        {activeRepo && (
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#161b22] border border-[#30363d]">
            <Github className="w-4 h-4 text-slate-400" />
            <a
              href={activeRepo.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-slate-200 hover:text-emerald-400 transition flex items-center gap-1.5"
            >
              {activeRepo.fullName}
            </a>
            <span className="text-slate-500 text-xs">|</span>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activeRepo.defaultBranch}</span>
            </div>
            {activeRepo.stars > 0 && (
              <span className="text-xs bg-[#21262d] text-amber-400 px-1.5 py-0.5 rounded font-mono">
                ★ {activeRepo.stars.toLocaleString()}
              </span>
            )}
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Agent Activity Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border bg-[#161b22] border-[#30363d]">
            <span className={`w-2 h-2 rounded-full ${isAgentRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            <span className={isAgentRunning ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
              {isAgentRunning ? 'Agent Working...' : 'Agents Idle'}
            </span>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-slate-300 hover:text-white transition"
            title="API Keys & Tokens"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
