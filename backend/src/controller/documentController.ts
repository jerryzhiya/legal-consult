import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// 1. CREATE (Upload Client Document & Base64 Data)
// ==========================================
export const uploadClientDocument = async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File; // Provided by multer memoryStorage
    const { matterId, category } = req.body;
    const userId = (req as any).user?.id; // From verifyAuth middleware

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    // Convert file buffer to Base64 data string
    const base64Data = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // 1. Create the new document record and store Base64 string directly
    const newDocument = await prisma.document.create({
      data: {
        name: file.originalname,
        category: category || 'General Upload',
        fileUrl: base64Data, // Store Base64 string in fileUrl field for seamless compatibility
        status: 'PENDING',
        matterId: matterId || null,
        uploaderId: userId || null,
      },
      include: {
        matter: true,
        uploader: { select: { fullName: true } },
      },
    });

    // 2. Automatically generate an unread notification for the firm/admin
    const clientName = newDocument.uploader?.fullName || 'A client';
    await prisma.notification.create({
      data: {
        title: 'New Document Uploaded',
        message: `${clientName} has uploaded a new document: "${file.originalname}".`,
        type: 'DOCUMENT_UPLOAD',
        isRead: false,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully and notification created',
      data: newDocument,
    });
  } catch (err: any) {
    console.error('Upload document error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to upload document.' });
  }
};

// ==========================================
// 2. READ (Get All Documents)
// ==========================================
export const getDocuments = async (req: Request, res: Response) => {
  try {
    const documents = await prisma.document.findMany({
      include: {
        matter: { select: { title: true, caseNumber: true } },
        uploader: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (err: any) {
    console.error('Fetch documents error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch documents.' });
  }
};

// ==========================================
// 2b. READ / DOWNLOAD (Get Document Base64 by ID)
// ==========================================
export const downloadDocument = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] || '' : req.params.id;

    const doc = await prisma.document.findUnique({
      where: { id: id },
    });

    if (!doc || !doc.fileUrl) {
      return res.status(404).json({ success: false, error: 'Document not found in database.' });
    }

    // Return the Base64 data string and name back to the frontend downloader
    return res.status(200).json({
      success: true,
      name: doc.name,
      fileData: doc.fileUrl, // Contains the Base64 string payload
    });

  } catch (err: any) {
    console.error('Download error catch block:', err.message || err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: err.message || 'Server error during download.' });
    }
  }
};

// ==========================================
// 3. UPDATE (Edit Document Metadata/Status)
// ==========================================
export const updateDocument = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] || '' : req.params.id;
    const { name, category, status } = req.body;

    const updatedDocument = await prisma.document.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(status && { status }),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: updatedDocument,
    });
  } catch (err: any) {
    console.error('Update document error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update document.' });
  }
};

// ==========================================
// 4. DELETE (Remove Document Record)
// ==========================================
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] || '' : req.params.id;

    await prisma.document.delete({
      where: { id: id },
    });

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (err: any) {
    console.error('Delete document error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete document.' });
  }
};