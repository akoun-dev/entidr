import { Request, Response } from 'express';

declare const ContractController: {
  getAllContracts: (req: Request, res: Response) => Promise<void>;
  getContractById: (req: Request, res: Response) => Promise<void>;
  createContract: (req: Request, res: Response) => Promise<void>;
  updateContract: (req: Request, res: Response) => Promise<void>;
  deleteContract: (req: Request, res: Response) => Promise<void>;
  downloadContractFile: (req: Request, res: Response) => Promise<void>;
  updateContractStatus: (req: Request, res: Response) => Promise<void>;
  getExpiringContracts: (req: Request, res: Response) => Promise<void>;
};

export default ContractController;
