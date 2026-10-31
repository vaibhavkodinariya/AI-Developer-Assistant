import express from 'express';
import { bugController } from '../controllers/bug.controller.js';

const router = express.Router();

router.get('/:repoId', bugController.getByRepo);
router.post('/:repoId/scan', bugController.triggerScan);
router.patch('/:id/status', bugController.updateStatus);

export default router;
