import { PullRequestDraft } from '../models/PullRequestDraft.js';
import { orchestrator } from '../services/agentOrchestrator.service.js';

export const prController = {
  async getByRepo(req, res) {
    try {
      const { repoId } = req.params;
      const prs = await PullRequestDraft.find({ repositoryId: repoId })
        .populate('relatedBugIds')
        .sort({ createdAt: -1 });
      return res.status(200).json(prs);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async createDraft(req, res) {
    try {
      const { repoId } = req.params;
      const { title, description, bugIds = [], filesToChange = [], pushToGitHub = false, token } = req.body;

      const result = await orchestrator.runPRDraft(
        repoId,
        { title, description, bugIds, filesToChange, pushToGitHub },
        token
      );

      return res.status(201).json(result.prDraft);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const pr = await PullRequestDraft.findById(id).populate('relatedBugIds');
      if (!pr) return res.status(404).json({ error: 'PR draft not found' });
      return res.status(200).json(pr);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};
