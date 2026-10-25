import { Router } from 'express';
import { 
  getDocuments, 
  uploadClientDocument, 
  downloadDocument, 
  updateDocument, 
  deleteDocument 
} from '../controller/documentController';
import { upload } from '../middleware/upload';
import { verifyAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', verifyAuth, getDocuments);
router.get('/:id/download', verifyAuth, downloadDocument);
router.post('/upload', verifyAuth, upload.single('file'), uploadClientDocument);
router.put('/:id', verifyAuth, updateDocument);     
router.delete('/:id', verifyAuth, deleteDocument);

export default router;