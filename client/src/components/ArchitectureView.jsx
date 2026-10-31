import React, { useState } from 'react';
import { Layers, Folder, FileCode, Cpu, CheckCircle2, FileText, ChevronRight, ChevronDown, Eye, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function ArchitectureView({ repo, analysis }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  if (!analysis) {
    return (
      <div className="glass-panel p-12 text-center rounded-2xl">
        <Layers className="w-12 h-12 text-slate-500 mx-auto mb-3 animate-pulse" />
        <h3 className="text-lg font-semibold text-white mb-1">Architecture Analysis Pending</h3>
        <p className="text-sm text-slate-400">Launch an analysis to inspect project structure, tech stack, and module maps.</p>
      </div>
    );
  }

  const handleOpenFile = async (path) => {
    try {
      setSelectedFile(path);
      setIsLoadingFile(true);
      const res = await api.getFileContent(repo._id, path);
      setFileContent(res.content || '');
    } catch (err) {
      setFileContent(`// Error loading file: ${err.message}`);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const filteredTree = (analysis.fileTree || []).filter(item =>
    item.path.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Overview & Architecture Header */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#30363d]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Pattern: {analysis.architectureType || 'Modular Architecture'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">System Architecture Overview</h2>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
              <span className="text-slate-400">Total Scanned: </span>
              <span className="text-white font-bold">{analysis.metrics?.totalFiles || analysis.fileTree?.length} files</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
              <span className="text-slate-400">Est. LOC: </span>
              <span className="text-emerald-400 font-bold">{analysis.metrics?.estimatedLinesOfCode?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Technical Summary */}
        <p className="text-slate-300 text-sm leading-relaxed mt-4">
          {analysis.summary}
        </p>

        {/* Tech Stack Grid */}
        <div className="mt-6">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Detected Technologies</h4>
          <div className="flex flex-wrap gap-2">
            {(analysis.techStack || []).map((tech, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-xs font-mono"
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-200 font-semibold">{tech.name}</span>
                <span className="text-slate-500 text-[10px]">({tech.category})</span>
                {tech.version && (
                  <span className="px-1.5 py-0.2 rounded bg-[#21262d] text-emerald-400 text-[10px]">
                    {tech.version}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Interactive File Tree & Code Previewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: File Explorer Tree */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Repository File Explorer</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">{filteredTree.length} paths</span>
          </div>

          {/* Search tree filter */}
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter files by name or path..."
            className="w-full mb-3 px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />

          <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs pr-1">
            {filteredTree.map((item, idx) => {
              const isSelected = selectedFile === item.path;
              return (
                <div
                  key={idx}
                  onClick={() => item.type === 'file' && handleOpenFile(item.path)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'hover:bg-[#21262d] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {item.type === 'dir' ? (
                      <Folder className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    ) : (
                      <FileCode className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    )}
                    <span className="truncate">{item.path}</span>
                  </div>

                  <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">
                    {item.importance}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Viewer */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-2xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#30363d]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-mono font-bold text-slate-200 truncate">
                {selectedFile || 'Select a file from the explorer to preview'}
              </span>
            </div>
            {selectedFile && (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#21262d] text-slate-400">
                Source Code
              </span>
            )}
          </div>

          <div className="flex-1 overflow-auto rounded-xl bg-[#0d1117] border border-[#30363d] p-3 font-mono text-xs">
            {isLoadingFile ? (
              <div className="h-full flex items-center justify-center text-slate-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                <span>Fetching file from GitHub...</span>
              </div>
            ) : selectedFile ? (
              <pre className="text-slate-300 leading-relaxed whitespace-pre font-mono">
                {fileContent}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <FileText className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-xs">Click any file node to inspect source contents and AST structure.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Architectural Components */}
      {analysis.keyComponents && analysis.keyComponents.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Key Architectural Modules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analysis.keyComponents.map((comp, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d]">
                <div className="font-bold text-white text-sm mb-1">{comp.name}</div>
                <div className="text-xs font-mono text-emerald-400 mb-2">{comp.path}</div>
                <div className="text-xs text-slate-400 leading-relaxed">{comp.role}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
