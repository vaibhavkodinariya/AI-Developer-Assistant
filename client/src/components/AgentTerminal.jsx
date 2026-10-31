import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, Cpu, Wrench, ArrowRight, CheckCircle2, AlertOctagon, Trash2 } from 'lucide-react';

export default function AgentTerminal({ logs, onClear }) {
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const getStageIcon = (stage) => {
    switch (stage) {
      case 'tool_call':
        return <Cpu className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />;
      case 'tool_result':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />;
      case 'completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-teal-300 flex-shrink-0" />;
      case 'error':
        return <AlertOctagon className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />;
      default:
        return <Terminal className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />;
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-[#30363d] flex flex-col h-[520px]">
      {/* Terminal Bar */}
      <div className="px-4 py-3 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-300 ml-2">
            AI Agent Telemetry & Reasoning Stream
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            SSE Live
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-[#0d1117] border-[#30363d] text-emerald-500 focus:ring-0"
            />
            <span>Auto-scroll</span>
          </label>
          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-[#21262d] text-slate-400 hover:text-white transition"
            title="Clear Terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 p-4 overflow-y-auto bg-[#090d16] font-mono text-xs space-y-2 select-text">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
            <Terminal className="w-8 h-8 opacity-40" />
            <p className="text-xs">Agent telemetry stream active. Waiting for task execution events...</p>
          </div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg flex items-start gap-2.5 transition border ${
                log.stage === 'error'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  : log.stage === 'tool_call'
                  ? 'bg-cyan-500/5 border-cyan-500/20 text-cyan-200'
                  : 'bg-[#10141f] border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="mt-0.5">{getStageIcon(log.stage)}</div>
              <div className="flex-1 space-y-1 overflow-hidden">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                  <span className="text-purple-400 font-semibold">{log.agent || 'Agent'}</span>
                  <span>•</span>
                  <span className="uppercase text-slate-400 font-semibold">{log.stage}</span>
                  <span>•</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-xs leading-relaxed break-words font-mono">
                  {log.message}
                </div>
                {log.details && (
                  <pre className="mt-1 p-2 rounded bg-[#070a10] border border-slate-800 text-[11px] text-slate-400 overflow-x-auto">
                    {typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : String(log.details)}
                  </pre>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
