import express from 'express';
import { upload } from '../utils/multer.js';
import { uploadFile, getFile,verifyPassword} from '../controllers/fileController.js';

const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile);

router.get('/f/:token', getFile);

router.post('/verify-password', verifyPassword);

export default router;