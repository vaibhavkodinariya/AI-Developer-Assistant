import { Analysis } from '../models/Analysis.js';
import { orchestrator } from '../services/agentOrchestrator.service.js';

export const analysisController = {
  async getByRepo(req, res) {
    try {
      const { repoId } = req.params;
      const analysis = await Analysis.findOne({ repositoryId: repoId });
      if (!analysis) {
        return res.status(404).json({ error: 'No analysis found for this repository. Trigger an analysis first.' });
      }
      return res.status(200).json(analysis);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async triggerAnalysis(req, res) {
    try {
      const { repoId } = req.params;
      const { token } = req.body;

      // Run asynchronously and return response
      orchestrator.runFullAnalysis(repoId, token).catch(err => {
        console.error('[AnalysisController] Run failed:', err.message);
      });

      return res.status(202).json({ message: 'Full analysis started. Listen on SSE /api/agent/stream for real-time trace events.' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};
