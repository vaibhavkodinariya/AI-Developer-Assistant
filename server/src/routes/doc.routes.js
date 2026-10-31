import express from 'express';
import { docController } from '../controllers/doc.controller.js';

const router = express.Router();

router.get('/:repoId', docController.getByRepo);
router.post('/:repoId/generate', docController.generate);
router.put('/:id', docController.update);

export default router;
