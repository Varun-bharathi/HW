import express from 'express';
import multer from 'multer';
import * as controller from '../controllers/resumeController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-desc', controller.uploadJobDescription);
router.post('/ingest-resume', upload.single('file'), controller.ingestResume);
router.post('/parse-resume', upload.single('resume'), controller.parseResume);
router.post('/candidate-list', controller.getCandidateList);
router.get('/get-jobids', controller.getAllJobIds);

export default router;