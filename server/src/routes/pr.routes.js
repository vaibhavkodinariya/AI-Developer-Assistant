import express from 'express';
import { prController } from '../controllers/pr.controller.js';

const router = express.Router();

router.get('/:repoId', prController.getByRepo);
router.post('/:repoId/draft', prController.createDraft);
router.get('/detail/:id', prController.getById);

export default router;
