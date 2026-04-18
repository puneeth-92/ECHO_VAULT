import express from 'express';
import { upload } from '../utils/multer.js';
import { uploadFile, getFile } from '../controllers/fileController.js';

const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile);

router.get('/f/:token', getFile);

export default router;