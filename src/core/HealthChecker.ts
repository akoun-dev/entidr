import axios from 'axios';
import { Logger } from './Logger.js';

export class HealthChecker {
  private readonly logger = new Logger('HealthCheck');

  constructor(private readonly healthEndpoint = '/health') {}

  async check(version: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.getBaseUrl()}/${version}${this.healthEndpoint}`);
      return response.status === 200 && response.data.status === 'OK';
    } catch (error) {
      this.logger.error(`Health check failed for version ${version}:`, error);
      return false;
    }
  }

  private getBaseUrl(): string {
    // Implémentation réelle de la récupération de l'URL de base
    return process.env.SERVICE_URL || 'http://localhost:3000';
  }
}