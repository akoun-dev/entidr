import { Request, Response } from 'express';

declare const HRStatsController: {
  getHRStats: (req: Request, res: Response) => Promise<void>;
};

export default HRStatsController;
