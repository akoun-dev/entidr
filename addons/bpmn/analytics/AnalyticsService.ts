export interface BpmnMetrics {
  activeInstances: number;
  averageDuration: number;
  slaCompliance: number;
}

class AnalyticsService {
  private socket: WebSocket | null = null;
  private listeners: Set<(m: BpmnMetrics) => void> = new Set();

  private connect() {
    if (this.socket) return;
    this.socket = new WebSocket('ws://localhost:3001/ws/analytics');
    this.socket.onmessage = event => {
      try {
        const data = JSON.parse(event.data) as BpmnMetrics;
        this.listeners.forEach(l => l(data));
      } catch (err) {
        console.error('Erreur de parsing des métriques', err);
      }
    };
    this.socket.onclose = () => {
      this.socket = null;
    };
  }

  subscribe(listener: (m: BpmnMetrics) => void) {
    this.listeners.add(listener);
    if (!this.socket) {
      this.connect();
    }
    return () => this.listeners.delete(listener);
  }

  async fetchMetrics(): Promise<BpmnMetrics> {
    const res = await fetch('/api/bpmn/analytics');
    return res.json();
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
