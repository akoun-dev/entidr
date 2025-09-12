import { Request, Response } from 'express';

declare const DepartmentController: {
  getAllDepartments: (req: Request, res: Response) => Promise<void>;
  getDepartmentById: (req: Request, res: Response) => Promise<void>;
  createDepartment: (req: Request, res: Response) => Promise<void>;
  updateDepartment: (req: Request, res: Response) => Promise<void>;
  deleteDepartment: (req: Request, res: Response) => Promise<void>;
  toggleDepartmentStatus: (req: Request, res: Response) => Promise<void>;
  getSubDepartments: (req: Request, res: Response) => Promise<void>;
  getDepartmentEmployees: (req: Request, res: Response) => Promise<void>;
};

export default DepartmentController;
