import { Documentation } from '../models/Documentation.js';
import { orchestrator } from '../services/agentOrchestrator.service.js';

export const docController = {
  async getByRepo(req, res) {
    try {
      const { repoId } = req.params;
      const docs = await Documentation.find({ repositoryId: repoId }).sort({ updatedAt: -1 });
      return res.status(200).json(docs);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async generate(req, res) {
    try {
      const { repoId } = req.params;
      const { type = 'readme', token } = req.body;

      const result = await orchestrator.runDocGeneration(repoId, type, token);
      return res.status(200).json(result.doc);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { markdownContent, title } = req.body;

      const doc = await Documentation.findByIdAndUpdate(
        id,
        { markdownContent, title, $inc: { version: 1 } },
        { new: true }
      );
      if (!doc) return res.status(404).json({ error: 'Documentation record not found' });
      return res.status(200).json(doc);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};
