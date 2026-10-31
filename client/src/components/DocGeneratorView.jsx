import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Sparkles, Copy, Download, GitPullRequest, Check, Edit3, Eye, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function DocGeneratorView({ docs, onGenerate, isGenerating, onDraftPR, onSaveDoc }) {
  const [activeType, setActiveType] = useState('readme');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [copied, setCopied] = useState(false);

  const docTypes = [
    { key: 'readme', label: 'README.md', file: 'README.md' },
    { key: 'api_reference', label: 'API Reference', file: 'docs/API.md' },
    { key: 'architecture', label: 'Architecture Guide', file: 'docs/ARCHITECTURE.md' },
    { key: 'contributing', label: 'Contributing Guide', file: 'CONTRIBUTING.md' }
  ];

  const currentDoc = docs.find(d => d.type === activeType);

  useEffect(() => {
    if (currentDoc) {
      setEditedContent(currentDoc.markdownContent || '');
      setIsEditing(false);
    } else {
      setEditedContent('');
    }
  }, [currentDoc, activeType]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent || currentDoc?.markdownContent || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const activeMeta = docTypes.find(d => d.key === activeType);
    const blob = new Blob([editedContent || currentDoc?.markdownContent || ''], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeMeta ? activeMeta.file.split('/').pop() : 'documentation.md';
    a.click();
  };

  const handleSave = () => {
    if (currentDoc && onSaveDoc) {
      onSaveDoc(currentDoc._id, { markdownContent: editedContent, title: currentDoc.title });
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Living Documentation Studio</h2>
          </div>
          <p className="text-sm text-slate-400">
            Synthesize developer READMEs, API catalogs, and Architecture Decision Records (ADRs) with autonomous AI writer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onGenerate(activeType)}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl transition text-sm shadow-lg shadow-emerald-600/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate {docTypes.find(d => d.key === activeType)?.label}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Doc Type Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#30363d] pb-2">
        <div className="flex items-center gap-2">
          {docTypes.map((type) => {
            const hasDoc = docs.some(d => d.type === type.key);
            return (
              <button
                key={type.key}
                onClick={() => setActiveType(type.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition ${
                  activeType === type.key
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-[#161b22] text-slate-400 border border-[#30363d] hover:bg-[#21262d]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{type.label}</span>
                {hasDoc && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>
            );
          })}
        </div>

        {currentDoc && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-300 text-xs border border-[#30363d] transition"
            >
              {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>{isEditing ? 'Preview' : 'Edit Raw'}</span>
            </button>

            {isEditing && (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Edits</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-300 border border-[#30363d] transition"
              title="Copy Markdown"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-300 border border-[#30363d] transition"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => onDraftPR([], [{
                filePath: currentDoc.targetPath || 'README.md',
                action: 'modify',
                content: editedContent || currentDoc.markdownContent
              }])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>Draft PR for Doc</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      {!currentDoc ? (
        <div className="glass-panel p-16 text-center rounded-2xl">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-semibold text-white mb-1">
            No {docTypes.find(d => d.key === activeType)?.label} Generated Yet
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Click the button below to have the AI Technical Writer Agent generate comprehensive, production-ready documentation.
          </p>
          <button
            onClick={() => onGenerate(activeType)}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-600/20"
          >
            Generate Now
          </button>
        </div>
      ) : isEditing ? (
        <div className="glass-panel p-4 rounded-2xl">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-[550px] p-4 bg-[#0d1117] border border-[#30363d] rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500 leading-relaxed resize-none"
          />
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl prose prose-invert max-w-none prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-[#30363d] text-slate-300">
          <ReactMarkdown>{currentDoc.markdownContent}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
