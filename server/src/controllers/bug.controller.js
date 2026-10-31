import { BugReport } from '../models/BugReport.js';
import { orchestrator } from '../services/agentOrchestrator.service.js';

export const bugController = {
  async getByRepo(req, res) {
    try {
      const { repoId } = req.params;
      const bugs = await BugReport.find({ repositoryId: repoId }).sort({ severity: 1, createdAt: -1 });
      return res.status(200).json(bugs);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async triggerScan(req, res) {
    try {
      const { repoId } = req.params;
      const { token } = req.body;

      orchestrator.runBugHunt(repoId, token).catch(err => {
        console.error('[BugController] Scan failed:', err.message);
      });

      return res.status(202).json({ message: 'Bug hunt scan initiated in background.' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const bug = await BugReport.findByIdAndUpdate(id, { status }, { new: true });
      if (!bug) return res.status(404).json({ error: 'Bug report not found' });
      return res.status(200).json(bug);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};
