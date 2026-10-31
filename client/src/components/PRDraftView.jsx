import React, { useState } from 'react';
import { GitPullRequest, ExternalLink, GitBranch, CheckCircle2, AlertCircle, FileCode, Send, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import DiffViewer from './DiffViewer';

export default function PRDraftView({ prs, onCreatePR, isCreating, onPushToGitHub }) {
  const [activePRId, setActivePRId] = useState(null);

  const selectedPR = prs.find(p => p._id === activePRId) || prs[0];

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitPullRequest className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Pull Request Draft Studio</h2>
          </div>
          <p className="text-sm text-slate-400">
            Autonomous branch isolation, change staging, structured PR descriptions, and one-click GitHub publishing.
          </p>
        </div>

        <button
          onClick={() => onCreatePR({ title: '', pushToGitHub: false })}
          disabled={isCreating}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-purple-600/20"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Drafting PR...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Draft New PR</span>
            </>
          )}
        </button>
      </div>

      {prs.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-2xl">
          <GitPullRequest className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-semibold text-white mb-1">No Pull Request Drafts Yet</h3>
          <p className="text-sm text-slate-400 mb-4">
            Select bugs from the Bug Hunter or docs to synthesize automated pull requests.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* PR Sidebar List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Drafted PRs</h3>
            {prs.map((pr) => {
              const isSelected = selectedPR?._id === pr._id;
              const isSubmitted = pr.status === 'created_on_github';

              return (
                <div
                  key={pr._id}
                  onClick={() => setActivePRId(pr._id)}
                  className={`p-4 rounded-xl cursor-pointer transition border ${
                    isSelected
                      ? 'bg-purple-500/15 border-purple-500/40 text-white shadow-sm'
                      : 'glass-panel hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-semibold text-sm truncate flex-1">{pr.title}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isSubmitted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {isSubmitted ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3 text-purple-400" />
                      {pr.branchName}
                    </span>
                    <span>•</span>
                    <span>{pr.changes?.length || 0} files</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PR Detail Main View */}
          {selectedPR && (
            <div className="lg:col-span-8 glass-panel p-6 rounded-2xl space-y-6">
              {/* PR Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#30363d]">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{selectedPR.title}</h3>
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1 text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      <GitBranch className="w-3.5 h-3.5" />
                      {selectedPR.branchName}
                    </span>
                    <span>into</span>
                    <span className="px-2 py-0.5 rounded bg-[#21262d] text-slate-300">
                      {selectedPR.baseBranch || 'main'}
                    </span>
                  </div>
                </div>

                {/* GitHub Status or Push Button */}
                {selectedPR.githubPrUrl ? (
                  <a
                    href={selectedPR.githubPrUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow"
                  >
                    <span>View on GitHub #{selectedPR.githubPrNumber}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      onPushToGitHub(selectedPR._id);
                      triggerConfetti();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Push & Open GitHub PR</span>
                  </button>
                )}
              </div>

              {/* PR Description Body */}
              <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {selectedPR.body}
              </div>

              {/* Staged Changes & Diffs */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400" /> Staged Changes & Diff Patches ({selectedPR.changes?.length || 0})
                </h4>

                {selectedPR.changes?.map((change, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-300 bg-[#161b22] px-3 py-1.5 rounded-lg border border-[#30363d]">
                      <span className="font-bold text-white">{change.filePath}</span>
                      <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        {change.action}
                      </span>
                    </div>
                    <DiffViewer patch={change.diffPatch} title="" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
