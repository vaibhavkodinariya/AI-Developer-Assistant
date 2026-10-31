import express from 'express';
import { repoController } from '../controllers/repo.controller.js';

const router = express.Router();

router.post('/ingest', repoController.ingestRepo);
router.get('/', repoController.listRepos);
router.get('/demo-seed', repoController.seedDemo);
router.get('/:id', repoController.getRepo);
router.get('/:id/file', repoController.getFileContent);

export default router;
