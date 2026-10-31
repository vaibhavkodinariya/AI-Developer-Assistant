import { AgentSession } from '../models/AgentSession.js';
import { orchestrator } from '../services/agentOrchestrator.service.js';

export const agentController = {
  // SSE endpoint for streaming real-time agent thought logs
  stream(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send initial handshake
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date() })}\n\n`);

    orchestrator.registerSSEClient(res);
  },

  async getSessionsByRepo(req, res) {
    try {
      const { repoId } = req.params;
      const sessions = await AgentSession.find({ repositoryId: repoId })
        .sort({ createdAt: -1 })
        .limit(10);
      return res.status(200).json(sessions);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async getSessionById(req, res) {
    try {
      const { id } = req.params;
      const session = await AgentSession.findById(id);
      if (!session) return res.status(404).json({ error: 'Session not found' });
      return res.status(200).json(session);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};
