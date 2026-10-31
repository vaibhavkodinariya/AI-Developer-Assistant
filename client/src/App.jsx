import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import RepoSelector from './components/RepoSelector';
import StatsCard from './components/StatsCard';
import ArchitectureView from './components/ArchitectureView';
import BugHunterView from './components/BugHunterView';
import DocGeneratorView from './components/DocGeneratorView';
import PRDraftView from './components/PRDraftView';
import AgentTerminal from './components/AgentTerminal';
import SettingsModal from './components/SettingsModal';

import {
  Layers,
  Bug,
  BookOpen,
  GitPullRequest,
  Terminal,
  FolderGit2,
  FileCode2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('structure');
  const [recentRepos, setRecentRepos] = useState([]);
  const [activeRepo, setActiveRepo] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [bugs, setBugs] = useState([]);
  const [docs, setDocs] = useState([]);
  const [prs, setPrs] = useState([]);
  const [agentLogs, setAgentLogs] = useState([]);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [isLoadingRepo, setIsLoadingRepo] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customTokens, setCustomTokens] = useState({ githubToken: '' });

  const activeRepoRef = useRef(activeRepo);
  useEffect(() => {
    activeRepoRef.current = activeRepo;
  }, [activeRepo]);

  // Initial Data Load & SSE Subscription
  useEffect(() => {
    loadRecentRepos();
    setupSSE();
  }, []);

  const setupSSE = () => {
    try {
      const eventSource = new EventSource('/api/agent/stream');

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'agent_log') {
            setAgentLogs((prev) => [...prev.slice(-200), data]);
            setIsAgentRunning(true);
          } else if (data.type === 'session_started') {
            setIsAgentRunning(true);
          } else if (data.type === 'session_completed') {
            setIsAgentRunning(false);
            const targetId = data.repositoryId || activeRepoRef.current?._id;
            if (targetId) {
              refreshRepoData(targetId);
            }
            api.listRepos().then((repos) => setRecentRepos(repos)).catch(() => { });
          } else if (data.type === 'session_error') {
            setIsAgentRunning(false);
          }
        } catch (err) {
          console.warn('Error parsing SSE event:', err);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setTimeout(setupSSE, 5000); // Reconnect after 5s
      };

      return () => eventSource.close();
    } catch (e) {
      console.warn('SSE not supported or connection failed:', e);
    }
  };

  const loadRecentRepos = async () => {
    try {
      const repos = await api.listRepos();
      setRecentRepos(repos);
      if (repos.length > 0 && !activeRepoRef.current) {
        selectRepo(repos[0]);
      }
    } catch (err) {
      console.warn('Could not load repos:', err);
    }
  };

  const selectRepo = async (repo) => {
    setActiveRepo(repo);
    activeRepoRef.current = repo;
    await refreshRepoData(repo._id);
  };

  const refreshRepoData = async (repoId) => {
    try {
      const [analysisData, bugsData, docsData, prsData] = await Promise.all([
        api.getAnalysis(repoId),
        api.getBugs(repoId),
        api.getDocs(repoId),
        api.getPRs(repoId)
      ]);

      setAnalysis(analysisData);
      setBugs(bugsData);
      setDocs(docsData);
      setPrs(prsData);
    } catch (err) {
      console.error('Error refreshing repo data:', err);
    }
  };

  // Analyze Repository
  const handleAnalyzeRepo = async (repoInput) => {
    try {
      setIsLoadingRepo(true);
      setIsAgentRunning(true);
      const res = await api.ingestRepo(repoInput, customTokens.githubToken);
      const repo = res.repository;
      setActiveRepo(repo);
      activeRepoRef.current = repo;
      await refreshRepoData(repo._id);
      const repos = await api.listRepos();
      setRecentRepos(repos);
    } catch (err) {
      alert(`Analysis error: ${err.message}`);
      setIsAgentRunning(false);
    } finally {
      setIsLoadingRepo(false);
    }
  };

  // Trigger Bug Scan
  const handleScanBugs = async () => {
    if (!activeRepo) return;
    try {
      setIsAgentRunning(true);
      await api.triggerBugScan(activeRepo._id, customTokens.githubToken);
    } catch (err) {
      alert(`Bug scan error: ${err.message}`);
      setIsAgentRunning(false);
    }
  };

  // Generate Doc
  const handleGenerateDoc = async (type) => {
    if (!activeRepo) return;
    try {
      setIsAgentRunning(true);
      await api.generateDoc(activeRepo._id, type, customTokens.githubToken);
      await refreshRepoData(activeRepo._id);
    } catch (err) {
      alert(`Doc generation error: ${err.message}`);
    } finally {
      setIsAgentRunning(false);
    }
  };

  // Save Doc
  const handleSaveDoc = async (docId, data) => {
    try {
      await api.updateDoc(docId, data);
      await refreshRepoData(activeRepo._id);
    } catch (err) {
      alert(`Save doc error: ${err.message}`);
    }
  };

  // Draft PR
  const handleDraftPR = async (bugIds = [], filesToChange = [], pushToGitHub = false) => {
    if (!activeRepo) return;
    try {
      setIsAgentRunning(true);
      setActiveTab('prs');
      await api.createPRDraft(activeRepo._id, {
        bugIds,
        filesToChange,
        pushToGitHub,
        token: customTokens.githubToken
      });
      await refreshRepoData(activeRepo._id);
    } catch (err) {
      alert(`PR drafting error: ${err.message}`);
    } finally {
      setIsAgentRunning(false);
    }
  };

  // Push existing PR to GitHub
  const handlePushPRToGitHub = async (prId) => {
    if (!activeRepo) return;
    const pr = prs.find((p) => p._id === prId);
    if (!pr) return;

    try {
      setIsAgentRunning(true);
      await api.createPRDraft(activeRepo._id, {
        title: pr.title,
        description: pr.body,
        bugIds: pr.relatedBugIds?.map((b) => (typeof b === 'object' ? b._id : b)) || [],
        filesToChange: pr.changes || [],
        pushToGitHub: true,
        token: customTokens.githubToken
      });
      await refreshRepoData(activeRepo._id);
    } catch (err) {
      alert(`Push to GitHub error: ${err.message}`);
    } finally {
      setIsAgentRunning(false);
    }
  };

  const navTabs = [
    { id: 'structure', label: 'Architecture & Structure', icon: Layers, badge: analysis?.fileTree?.length },
    { id: 'bugs', label: 'Bug Hunter & Fixes', icon: Bug, badge: bugs.length },
    { id: 'docs', label: 'Documentation Studio', icon: BookOpen, badge: docs.length },
    { id: 'prs', label: 'Pull Request Drafts', icon: GitPullRequest, badge: prs.length },
    { id: 'terminal', label: 'Live Agent Telemetry', icon: Terminal, pulse: isAgentRunning }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col text-[#e6edf3]">
      <Navbar
        activeRepo={activeRepo}
        isAgentRunning={isAgentRunning}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Repo Input Box */}
        <RepoSelector
          activeRepo={activeRepo}
          onAnalyze={handleAnalyzeRepo}
          isLoading={isLoadingRepo}
          recentRepos={recentRepos}
          onSelectRepo={selectRepo}
        />

        {/* Global Statistics */}
        {activeRepo && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatsCard
              icon={FolderGit2}
              title="Scanned Tree Nodes"
              value={analysis?.metrics?.totalFiles || analysis?.fileTree?.length || 0}
              subtext={`${analysis?.metrics?.codeFiles || 0} code files`}
              color="emerald"
            />
            <StatsCard
              icon={Bug}
              title="Vulnerabilities & Bugs"
              value={bugs.length}
              subtext={`${bugs.filter((b) => b.severity === 'critical' || b.severity === 'high').length} high/critical`}
              color="rose"
            />
            <StatsCard
              icon={BookOpen}
              title="Living Docs Ready"
              value={docs.length}
              subtext="README, API, Architecture"
              color="blue"
            />
            <StatsCard
              icon={GitPullRequest}
              title="Pull Request Drafts"
              value={prs.length}
              subtext={`${prs.filter((p) => p.status === 'created_on_github').length} published on GitHub`}
              color="purple"
            />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#30363d] mb-6 overflow-x-auto gap-1">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-5 py-3 border-b-2 font-medium text-sm transition whitespace-nowrap ${isActive
                    ? 'border-emerald-500 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono ${isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-[#21262d] text-slate-400'
                      }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {tab.pulse && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        {activeTab === 'structure' && (
          <ArchitectureView repo={activeRepo} analysis={analysis} />
        )}

        {activeTab === 'bugs' && (
          <BugHunterView
            bugs={bugs}
            onScan={handleScanBugs}
            isScanning={isAgentRunning}
            onDraftPR={(bugIds) => handleDraftPR(bugIds, [], false)}
            onUpdateStatus={(id, status) => api.updateBugStatus(id, status)}
          />
        )}

        {activeTab === 'docs' && (
          <DocGeneratorView
            docs={docs}
            onGenerate={handleGenerateDoc}
            isGenerating={isAgentRunning}
            onDraftPR={(bugIds, files) => handleDraftPR(bugIds, files, false)}
            onSaveDoc={handleSaveDoc}
          />
        )}

        {activeTab === 'prs' && (
          <PRDraftView
            prs={prs}
            onCreatePR={(params) => handleDraftPR([], [], params.pushToGitHub)}
            isCreating={isAgentRunning}
            onPushToGitHub={handlePushPRToGitHub}
          />
        )}

        {activeTab === 'terminal' && (
          <AgentTerminal logs={agentLogs} onClear={() => setAgentLogs([])} />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveTokens={(tokens) => setCustomTokens(tokens)}
        initialTokens={customTokens}
      />
    </div>
  );
}
