import { LogExportConfig, LogContext } from './types/logging';
import axios from 'axios';

export class ExportService {
  constructor(private config?: LogExportConfig) {}

  async export(data: any) {
    if (!this.config) return;

    try {
      // Envoi vers ELK
      if (this.config.elkEndpoint) {
        await axios.post(this.config.elkEndpoint, data);
      }

      // Envoi vers Prometheus
      if (this.config.prometheusEndpoint) {
        const metrics = this.convertToMetrics(data);
        await axios.post(this.config.prometheusEndpoint, metrics);
      }

      // Envoi vers Grafana
      if (this.config.grafanaEndpoint) {
        await axios.post(this.config.grafanaEndpoint, {
          ...data,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Log export failed:', error);
    }
  }

  private convertToMetrics(data: any) {
    // Conversion des logs en format métrique Prometheus
    return {
      name: 'application_log',
      type: 'counter',
      labels: {
        level: data.level,
        service: data.service
      },
      value: 1
    };
  }
}