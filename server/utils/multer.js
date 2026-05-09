import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import cloudinary from './cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'eco_vault',
    resource_type: 'raw'
  }
});

export const upload = multer({ storage });