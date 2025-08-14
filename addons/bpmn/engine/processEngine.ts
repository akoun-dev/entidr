/**
 * Service BPMN pour parser des définitions et exécuter des instances.
 * Cette implémentation fournit un moteur simplifié capable de gérer
 * le cycle de vie des instances, les timers, les messages, les
 * compensations et les transactions.
 */

type InstanceStatus = 'created' | 'completed';

interface BpmnInstance {
  id: string;
  status: InstanceStatus;
  startedAt: Date;
  endedAt?: Date;
  compensationHandlers: (() => void)[];
}

interface BpmnJob {
  id: string;
  instanceId: string;
  type: string;
  status: 'scheduled' | 'completed';
  runAt: Date;
  data?: unknown;
}

interface BpmnEvent {
  id: string;
  instanceId: string;
  type: string;
  payload?: unknown;
  status: 'pending' | 'processed';
  createdAt: Date;
}

class ProcessEngine {
  private static instance: ProcessEngine;
  private instances: Map<string, BpmnInstance> = new Map();
  private jobs: Map<string, BpmnJob> = new Map();
  private events: Map<string, BpmnEvent> = new Map();

  /**
   * Singleton
   */
  public static getInstance(): ProcessEngine {
    if (!ProcessEngine.instance) {
      ProcessEngine.instance = new ProcessEngine();
    }
    return ProcessEngine.instance;
  }

  /**
   * Parse un XML BPMN en Document DOM.
   * @param xml Chaîne BPMN XML
   */
  public parse(xml: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(xml, 'text/xml');
  }

  /**
   * Démarre une nouvelle instance de processus.
   * @param definition Définition BPMN XML
   * @returns ID de l'instance
   */
  public startInstance(definition: string): string {
    const doc = this.parse(definition);
    const processEl = doc.getElementsByTagName('process')[0];
    const processId = processEl?.getAttribute('id') || `process-${Date.now()}`;
    const instanceId = `${processId}-${Date.now()}`;
    this.instances.set(instanceId, {
      id: instanceId,
      status: 'created',
      startedAt: new Date(),
      compensationHandlers: []
    });
    this.recordEvent(instanceId, 'start', { processId });
    return instanceId;
  }

  /**
   * Marque une instance comme complétée.
   * @param instanceId ID de l'instance
   */
  public completeInstance(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.status = 'completed';
      instance.endedAt = new Date();
      this.recordEvent(instanceId, 'end');
    }
  }

  /**
   * Planifie un timer pour une instance.
   * @param instanceId ID de l'instance
   * @param delay Délai en millisecondes
   * @param data Données optionnelles
   */
  public scheduleTimer(instanceId: string, delay: number, data?: unknown): string {
    const jobId = `job-${Date.now()}`;
    const runAt = new Date(Date.now() + delay);
    const job: BpmnJob = {
      id: jobId,
      instanceId,
      type: 'timer',
      status: 'scheduled',
      runAt,
      data
    };
    this.jobs.set(jobId, job);
    setTimeout(() => {
      job.status = 'completed';
      this.recordEvent(instanceId, 'timer', { jobId, data });
    }, delay);
    return jobId;
  }

  /**
   * Envoie un message à une instance.
   */
  public sendMessage(instanceId: string, message: string, payload?: unknown): void {
    this.recordEvent(instanceId, `message:${message}`, payload);
  }

  /**
   * Enregistre une compensation à exécuter plus tard.
   */
  public registerCompensation(instanceId: string, handler: () => void): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.compensationHandlers.push(handler);
    }
  }

  /**
   * Déclenche toutes les compensations enregistrées.
   */
  public triggerCompensation(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      while (instance.compensationHandlers.length) {
        const fn = instance.compensationHandlers.pop();
        try {
          fn?.();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Compensation handler error', err);
        }
      }
      this.recordEvent(instanceId, 'compensation');
    }
  }

  /**
   * Démarre une transaction pour une instance.
   */
  public beginTransaction(instanceId: string): string {
    const jobId = `tx-${Date.now()}`;
    const job: BpmnJob = {
      id: jobId,
      instanceId,
      type: 'transaction',
      status: 'scheduled',
      runAt: new Date()
    };
    this.jobs.set(jobId, job);
    this.recordEvent(instanceId, 'transaction:start', { jobId });
    return jobId;
  }

  /**
   * Valide une transaction.
   */
  public commitTransaction(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'completed';
      this.recordEvent(job.instanceId, 'transaction:commit', { jobId });
    }
  }

  /**
   * Annule une transaction.
   */
  public rollbackTransaction(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'completed';
      this.recordEvent(job.instanceId, 'transaction:rollback', { jobId });
    }
  }

  /**
   * Enregistre un événement interne.
   */
  private recordEvent(instanceId: string, type: string, payload?: unknown): void {
    const eventId = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const event: BpmnEvent = {
      id: eventId,
      instanceId,
      type,
      payload,
      status: 'pending',
      createdAt: new Date()
    };
    this.events.set(eventId, event);
    // TODO: persister dans le modèle bpmn.event
  }
}

export default ProcessEngine;
