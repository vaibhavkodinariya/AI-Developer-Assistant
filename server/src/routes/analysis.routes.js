import express from 'express';
import { analysisController } from '../controllers/analysis.controller.js';

const router = express.Router();

router.get('/:repoId', analysisController.getByRepo);
router.post('/:repoId/run', analysisController.triggerAnalysis);

export default router;
