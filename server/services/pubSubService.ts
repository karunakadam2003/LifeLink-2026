import fs from 'fs';
import { PubSub, Topic, Subscription } from '@google-cloud/pubsub';
import { EmergencyEvent } from '../../src/types.js';
import { bigQueryService } from './bigQueryService.js';

type EventHandler = (event: EmergencyEvent) => Promise<void> | void;

class PubSubService {
  private subscribers: Map<string, EventHandler[]> = new Map();
  private eventHistory: EmergencyEvent[] = [];
  private gcpPubSub: PubSub | null = null;
  private gcpTopic: Topic | null = null;
  private gcpSubscription: Subscription | null = null;
  private isGcpConnected = false;

  constructor() {
    this.initializeGcpPubSub().catch(err => {
      console.warn('[GCP Cloud Pub/Sub] Initialization note:', err?.message || err);
    });
  }

  private async initializeGcpPubSub(): Promise<void> {
    const projectId = process.env.GCP_PROJECT_ID || 'lifelink-agentic-2026';
    const topicName = process.env.GCP_PUBSUB_TOPIC || 'lifelink-emergency-telemetry';
    const subName = process.env.GCP_PUBSUB_SUBSCRIPTION || 'lifelink-coordinator-sub';

    try {
      const pubsubConfig: any = {
        projectId,
      };

      const customKey = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (customKey && fs.existsSync(customKey)) {
        pubsubConfig.keyFilename = customKey;
      } else if (fs.existsSync('./gcp-credentials.json')) {
        pubsubConfig.keyFilename = './gcp-credentials.json';
      }

      this.gcpPubSub = new PubSub(pubsubConfig);

      // Get or create topic
      const [topic] = await this.gcpPubSub.topic(topicName).get({ autoCreate: true });
      this.gcpTopic = topic;

      // Get or create subscription
      const [subscription] = await this.gcpTopic.subscription(subName).get({ autoCreate: true });
      this.gcpSubscription = subscription;

      // Listen to incoming messages from GCP Cloud Pub/Sub
      this.gcpSubscription.on('message', async message => {
        try {
          const rawData = message.data.toString();
          const parsedEvent: EmergencyEvent = JSON.parse(rawData);

          // Avoid duplicating if we already recorded this event locally
          if (!this.eventHistory.some(e => e.event_id === parsedEvent.event_id)) {
            this.eventHistory.unshift(parsedEvent);
            await bigQueryService.logEvent(parsedEvent);
            await this.dispatchToSubscribers(parsedEvent);
          }
          message.ack();
        } catch (err) {
          console.error('[GCP Cloud Pub/Sub] Error handling incoming message:', err);
          message.nack();
        }
      });

      this.gcpSubscription.on('error', err => {
        console.warn('[GCP Cloud Pub/Sub] Subscription stream warning:', err?.message || err);
      });

      this.isGcpConnected = true;
      console.log(`[GCP Cloud Pub/Sub] Successfully connected to project '${projectId}' on topic '${topicName}' (Subscription: '${subName}')`);
    } catch (err: any) {
      console.info(`[GCP Cloud Pub/Sub] Live cloud connection notice: ${err?.message || err}. Running with resilient local event bus.`);
      this.isGcpConnected = false;
    }
  }

  public subscribe(eventType: string, handler: EventHandler) {
    const existing = this.subscribers.get(eventType) || [];
    existing.push(handler);
    this.subscribers.set(eventType, existing);
  }

  private async dispatchToSubscribers(event: EmergencyEvent): Promise<void> {
    const handlers = [
      ...(this.subscribers.get(event.event_type) || []),
      ...(this.subscribers.get('*') || []),
    ];

    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (err) {
        console.error(`Error in PubSub handler for ${event.event_type}:`, err);
      }
    }
  }

  public async publish(
    emergencyId: string,
    eventType: EmergencyEvent['event_type'],
    source: EmergencyEvent['source'],
    payload: Record<string, any>,
    summary: string
  ): Promise<EmergencyEvent> {
    const event: EmergencyEvent = {
      event_id: `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      emergency_id: emergencyId,
      event_type: eventType,
      timestamp: new Date().toISOString(),
      source,
      payload,
      summary,
    };

    this.eventHistory.unshift(event);
    await bigQueryService.logEvent(event);

    // Publish to GCP Cloud Pub/Sub if connected
    if (this.isGcpConnected && this.gcpTopic) {
      try {
        const dataBuffer = Buffer.from(JSON.stringify(event));
        const messageId = await this.gcpTopic.publishMessage({
          data: dataBuffer,
          attributes: {
            emergencyId,
            eventType,
            source,
            timestamp: event.timestamp,
          },
        });
        console.info(`[GCP Cloud Pub/Sub] Published message ${messageId} to topic '${this.gcpTopic.name}' (${eventType})`);
      } catch (err: any) {
        console.warn(`[GCP Cloud Pub/Sub] Publish warning: ${err?.message || err}`);
      }
    }

    // Trigger local subscribers (e.g. CoordinatorAgent / MonitoringAgent)
    await this.dispatchToSubscribers(event);

    return event;
  }

  public getEvents(emergencyId?: string): EmergencyEvent[] {
    if (emergencyId) {
      return this.eventHistory.filter(e => e.emergency_id === emergencyId);
    }
    return this.eventHistory;
  }

  public getStatus(): { isGcpConnected: boolean; projectId?: string; topic?: string; subscription?: string } {
    return {
      isGcpConnected: this.isGcpConnected,
      projectId: process.env.GCP_PROJECT_ID || 'lifelink-agentic-2026',
      topic: process.env.GCP_PUBSUB_TOPIC || 'lifelink-emergency-telemetry',
      subscription: process.env.GCP_PUBSUB_SUBSCRIPTION || 'lifelink-coordinator-sub',
    };
  }
}

export const pubSubService = new PubSubService();
