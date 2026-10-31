import express from 'express';
import { agentController } from '../controllers/agent.controller.js';

const router = express.Router();

router.get('/stream', agentController.stream);
router.get('/sessions/:repoId', agentController.getSessionsByRepo);
router.get('/session/:id', agentController.getSessionById);

export default router;
