import { Request, Response } from 'express';

declare const DocumentController: {
  getAllDocuments: (req: Request, res: Response) => Promise<void>;
  getDocumentById: (req: Request, res: Response) => Promise<void>;
  createDocument: (req: Request, res: Response) => Promise<void>;
  updateDocument: (req: Request, res: Response) => Promise<void>;
  deleteDocument: (req: Request, res: Response) => Promise<void>;
  downloadDocumentFile: (req: Request, res: Response) => Promise<void>;
  updateDocumentStatus: (req: Request, res: Response) => Promise<void>;
  getExpiringDocuments: (req: Request, res: Response) => Promise<void>;
  getExpiredDocuments: (req: Request, res: Response) => Promise<void>;
};

export default DocumentController;
