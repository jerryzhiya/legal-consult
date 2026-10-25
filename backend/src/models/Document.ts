import { Schema, model, Document as MongoDocument } from 'mongoose';

export interface IDocument extends MongoDocument {
  name: string;
  category: string;
  fileUrl: string;
  status: string;
  matterId: Schema.Types.ObjectId;
  uploadedBy?: Schema.Types.ObjectId;
  createdAt: Date;
}

const documentSchema = new Schema<IDocument>({
  name: { type: String, required: true },
  category: { type: String, default: 'General Upload' },
  fileUrl: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'ACTION_REQUIRED'], default: 'PENDING' },
  matterId: { type: Schema.Types.ObjectId, ref: 'Matter', required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const DocumentModel = model<IDocument>('Document', documentSchema);