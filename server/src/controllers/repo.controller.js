import { Repository } from '../models/Repository.js';
import { Analysis } from '../models/Analysis.js';
import { GitHubService } from '../services/github.service.js';
import { orchestrator } from '../services/agentOrchestrator.service.js';

export const repoController = {
  // Ingest and analyze a repository
  async ingestRepo(req, res) {
    try {
      const { repoUrl, token, runFullSuite = true } = req.body;
      if (!repoUrl) {
        return res.status(400).json({ error: 'Repository URL or owner/repo identifier is required' });
      }

      const { owner, repo } = GitHubService.parseRepoString(repoUrl);
      const githubService = new GitHubService(token);

      // 1. Fetch metadata from GitHub
      const details = await githubService.getRepoDetails(owner, repo);

      // 2. Upsert Repository in DB
      let repository = await Repository.findOne({ fullName: details.fullName });
      if (!repository) {
        repository = new Repository(details);
      } else {
        Object.assign(repository, details);
      }
      await repository.save();

      // 3. Trigger asynchronous background analysis or return immediate response
      if (runFullSuite) {
        // Kick off orchestrator analysis in background
        orchestrator.runFullAnalysis(repository._id, token).catch(err => {
          console.error('[Orchestrator] Background analysis failure:', err.message);
        });
      }

      return res.status(200).json({
        message: 'Repository ingested successfully. Agent analysis in progress.',
        repository
      });
    } catch (error) {
      console.error('[RepoController] Ingestion error:', error);
      return res.status(500).json({ error: error.message || 'Failed to ingest repository' });
    }
  },

  // List all ingested repos
  async listRepos(req, res) {
    try {
      const repos = await Repository.find().sort({ updatedAt: -1 }).limit(20);
      return res.status(200).json(repos);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Get specific repository
  async getRepo(req, res) {
    try {
      const { id } = req.params;
      const repo = await Repository.findById(id);
      if (!repo) return res.status(400).json({ error: 'Repository not found' });
      return res.status(200).json(repo);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Fetch raw file content from GitHub for a repository
  async getFileContent(req, res) {
    try {
      const { id } = req.params;
      const { path } = req.query;
      if (!path) return res.status(400).json({ error: 'Path query parameter is required' });

      const repo = await Repository.findById(id);
      if (!repo) return res.status(404).json({ error: 'Repository not found' });

      const githubService = new GitHubService();
      const content = await githubService.getFileContent(repo.owner, repo.name, path, repo.defaultBranch);
      return res.status(200).json({ path, content });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Seed sample repositories for instant test drive
  async seedDemo(req, res) {
    try {
      const demoRepo = {
        owner: 'expressjs',
        name: 'express',
        fullName: 'expressjs/express',
        description: 'Fast, unopinionated, minimalist web framework for node.',
        stars: 64200,
        forks: 13500,
        defaultBranch: 'master',
        htmlUrl: 'https://github.com/expressjs/express',
        languages: { JavaScript: 100 },
        topics: ['express', 'framework', 'node', 'web']
      };

      let repo = await Repository.findOne({ fullName: demoRepo.fullName });
      if (!repo) {
        repo = new Repository(demoRepo);
        await repo.save();
      }

      return res.status(200).json({ message: 'Demo repo ready', repository: repo });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};
