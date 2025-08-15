import { Kafka, Producer, Consumer } from 'kafkajs';
import logger from '../utils/logger';

class EventBus {
  private static instance: EventBus;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();

  private constructor() {
    const kafka = new Kafka({
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
      clientId: 'entidr-core'
    });

    this.producer = kafka.producer();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public async connect(): Promise<void> {
    await this.producer.connect();
  }

  public async publish(topic: string, message: any): Promise<void> {
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }]
    });
  }

  public async subscribe(topic: string, callback: (message: any) => void): Promise<void> {
    const consumer = this.consumers.get(topic) || this.createConsumer(topic);
    await consumer.subscribe({ topic, fromBeginning: true });
    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          callback(JSON.parse(message.value?.toString() || '{}'));
        } catch (error) {
          logger.error(`Error processing message on ${topic}:`, error);
        }
      }
    });
  }

  private createConsumer(topic: string): Consumer {
    const kafka = new Kafka({
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
      clientId: `entidr-${topic}-consumer`
    });

    const consumer = kafka.consumer({ groupId: `entidr-${topic}-group` });
    this.consumers.set(topic, consumer);
    return consumer;
  }
}

export default EventBus.getInstance();