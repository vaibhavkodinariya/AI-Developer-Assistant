import { AgentSession } from '../models/AgentSession.js';
import { Repository } from '../models/Repository.js';
import { GitHubService } from './github.service.js';
import { RepoAnalyzerAgent } from './agents/repoAnalyzer.agent.js';
import { BugHunterAgent } from './agents/bugHunter.agent.js';
import { DocGeneratorAgent } from './agents/docGenerator.agent.js';
import { PRDrafterAgent } from './agents/prDrafter.agent.js';

export class AgentOrchestrator {
  constructor() {
    this.sseClients = new Set();
  }

  // Register an SSE client connection
  registerSSEClient(res) {
    this.sseClients.add(res);

    res.on('close', () => {
      this.sseClients.delete(res);
    });
  }

  // Broadcast event to all connected SSE clients
  broadcast(event) {
    const data = `data: ${JSON.stringify(event)}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(data);
      } catch (err) {
        this.sseClients.delete(client);
      }
    }
  }

  async createSession(repositoryId, taskType) {
    const session = new AgentSession({
      repositoryId,
      taskType,
      status: 'running',
      startedAt: new Date()
    });
    await session.save();

    this.broadcast({
      type: 'session_started',
      sessionId: session._id,
      repositoryId,
      taskType
    });

    return session;
  }

  async runFullAnalysis(repositoryId, customToken = null) {
    const repository = await Repository.findById(repositoryId);
    if (!repository) throw new Error('Repository not found');

    const session = await this.createSession(repositoryId, 'full_analysis');
    const githubService = new GitHubService(customToken);

    try {
      // 1. Run Repo Analyzer Agent
      const analyzer = new RepoAnalyzerAgent(
        session._id,
        repositoryId,
        githubService,
        (evt) => this.broadcast(evt)
      );
      const analysis = await analyzer.run({
        owner: repository.owner,
        repo: repository.name,
        branch: repository.defaultBranch
      });

      // 2. Auto-run Bug Hunter Agent
      const hunter = new BugHunterAgent(
        session._id,
        repositoryId,
        githubService,
        (evt) => this.broadcast(evt)
      );
      const bugs = await hunter.run({
        owner: repository.owner,
        repo: repository.name,
        branch: repository.defaultBranch
      });

      // 3. Auto-generate primary README documentation
      const docAgent = new DocGeneratorAgent(
        session._id,
        repositoryId,
        githubService,
        (evt) => this.broadcast(evt)
      );
      const readme = await docAgent.run({ docType: 'readme' });

      session.status = 'completed';
      session.completedAt = new Date();
      session.resultSummary = `Analysis complete: ${analysis.fileTree.length} files scanned, ${bugs.length} issues identified, documentation updated.`;
      await session.save();

      this.broadcast({
        type: 'session_completed',
        sessionId: session._id,
        repositoryId,
        summary: session.resultSummary
      });

      return { analysis, bugs, readme, session };
    } catch (error) {
      session.status = 'failed';
      session.completedAt = new Date();
      session.resultSummary = `Execution halted: ${error.message}`;
      await session.save();

      this.broadcast({
        type: 'session_error',
        sessionId: session._id,
        repositoryId,
        error: error.message
      });

      throw error;
    }
  }

  async runBugHunt(repositoryId, customToken = null) {
    const repository = await Repository.findById(repositoryId);
    if (!repository) throw new Error('Repository not found');

    const session = await this.createSession(repositoryId, 'bug_hunt');
    const githubService = new GitHubService(customToken);

    try {
      const hunter = new BugHunterAgent(
        session._id,
        repositoryId,
        githubService,
        (evt) => this.broadcast(evt)
      );
      const bugs = await hunter.run({
        owner: repository.owner,
        repo: repository.name,
        branch: repository.defaultBranch
      });

      session.status = 'completed';
      session.completedAt = new Date();
      session.resultSummary = `Bug hunt completed: ${bugs.length} issues identified with suggested fixes.`;
      await session.save();

      this.broadcast({
        type: 'session_completed',
        sessionId: session._id,
        summary: session.resultSummary
      });

      return { bugs, session };
    } catch (error) {
      session.status = 'failed';
      session.completedAt = new Date();
      session.resultSummary = error.message;
      await session.save();
      throw error;
    }
  }

  async runDocGeneration(repositoryId, docType, customToken = null) {
    const repository = await Repository.findById(repositoryId);
    if (!repository) throw new Error('Repository not found');

    const session = await this.createSession(repositoryId, 'generate_docs');
    const githubService = new GitHubService(customToken);

    try {
      const docAgent = new DocGeneratorAgent(
        session._id,
        repositoryId,
        githubService,
        (evt) => this.broadcast(evt)
      );
      const doc = await docAgent.run({ docType });

      session.status = 'completed';
      session.completedAt = new Date();
      session.resultSummary = `Documentation for ${docType} generated successfully.`;
      await session.save();

      this.broadcast({
        type: 'session_completed',
        sessionId: session._id,
        summary: session.resultSummary
      });

      return { doc, session };
    } catch (error) {
      session.status = 'failed';
      session.completedAt = new Date();
      await session.save();
      throw error;
    }
  }

  async runPRDraft(repositoryId, params, customToken = null) {
    const repository = await Repository.findById(repositoryId);
    if (!repository) throw new Error('Repository not found');

    const session = await this.createSession(repositoryId, 'draft_pr');
    const githubService = new GitHubService(customToken);

    try {
      const prAgent = new PRDrafterAgent(
        session._id,
        repositoryId,
        githubService,
        (evt) => this.broadcast(evt)
      );
      const prDraft = await prAgent.run(params);

      session.status = 'completed';
      session.completedAt = new Date();
      session.resultSummary = `PR draft created: ${prDraft.title} (${prDraft.changes.length} files modified)`;
      await session.save();

      this.broadcast({
        type: 'session_completed',
        sessionId: session._id,
        summary: session.resultSummary
      });

      return { prDraft, session };
    } catch (error) {
      session.status = 'failed';
      session.completedAt = new Date();
      await session.save();
      throw error;
    }
  }
}

export const orchestrator = new AgentOrchestrator();
