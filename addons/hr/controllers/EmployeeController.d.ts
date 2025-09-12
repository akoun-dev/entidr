import { Request, Response } from 'express';

declare const EmployeeController: {
  getAllEmployees: (req: Request, res: Response) => Promise<void>;
  getEmployeeById: (req: Request, res: Response) => Promise<void>;
  createEmployee: (req: Request, res: Response) => Promise<void>;
  updateEmployee: (req: Request, res: Response) => Promise<void>;
  deleteEmployee: (req: Request, res: Response) => Promise<void>;
  toggleEmployeeStatus: (req: Request, res: Response) => Promise<void>;
  getEmployeeContracts: (req: Request, res: Response) => Promise<void>;
  getEmployeeDocuments: (req: Request, res: Response) => Promise<void>;
  getEmployeeSubordinates: (req: Request, res: Response) => Promise<void>;
};

export default EmployeeController;
