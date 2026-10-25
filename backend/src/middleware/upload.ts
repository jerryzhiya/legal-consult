import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: 'mcali_firm_documents',
    resource_type: 'auto', // Automatically handles PDFs, Word docs, and images
    access_mode: 'public', // <-- This explicitly makes the uploaded file publicly readable
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
  }),
});

export const upload = multer({ storage });