import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../stores/authStore';
import { useBranchStore } from '../stores/branchStore';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'https://api-restaurant-demo.com/ws-restaurant';

class StompWebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private subscriptions: Map<string, { unsubscribe: () => void }> = new Map();
  private callbacks: Map<string, Set<(data: any) => void>> = new Map();

  public init() {
    if (this.client && this.isConnected) return;

    const token = useAuthStore.getState().token || localStorage.getItem('rest_token') || '';
    const branchId = useBranchStore.getState().currentBranchId || localStorage.getItem('rest_branch_id') || 'CN01';

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_BASE_URL) as any,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        'X-Branch-Id': branchId,
      },
      debug: (msg: string) => {
        if (import.meta.env.DEV) {
          console.debug('[STOMP]', msg);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.isConnected = true;
        console.log('[STOMP] Connected to WebSocket broker successfully');
        // Resubscribe to active topics
        this.callbacks.forEach((_, topic) => {
          this.subscribeToTopic(topic);
        });
      },
      onStompError: (frame) => {
        console.warn('[STOMP] Broker reported error:', frame.headers['message']);
        console.warn('[STOMP] Additional details:', frame.body);
      },
      onWebSocketClose: () => {
        this.isConnected = false;
        console.log('[STOMP] WebSocket connection closed');
      },
    });

    try {
      this.client.activate();
    } catch (e) {
      console.warn('[STOMP] Connection failed, using simulated fallback:', e);
    }
  }

  public subscribe(topic: string, callback: (data: any) => void): () => void {
    if (!this.callbacks.has(topic)) {
      this.callbacks.set(topic, new Set());
    }
    this.callbacks.get(topic)!.add(callback);

    if (this.isConnected && this.client) {
      this.subscribeToTopic(topic);
    } else if (!this.client) {
      this.init();
    }

    return () => {
      const topicCallbacks = this.callbacks.get(topic);
      if (topicCallbacks) {
        topicCallbacks.delete(callback);
        if (topicCallbacks.size === 0) {
          this.callbacks.delete(topic);
          const sub = this.subscriptions.get(topic);
          if (sub) {
            sub.unsubscribe();
            this.subscriptions.delete(topic);
          }
        }
      }
    };
  }

  private subscribeToTopic(topic: string) {
    if (!this.client || !this.isConnected || this.subscriptions.has(topic)) return;

    try {
      const subscription = this.client.subscribe(topic, (message: IMessage) => {
        try {
          const payload = JSON.parse(message.body);
          const topicCallbacks = this.callbacks.get(topic);
          if (topicCallbacks) {
            topicCallbacks.forEach((cb) => cb(payload));
          }
        } catch {
          const topicCallbacks = this.callbacks.get(topic);
          if (topicCallbacks) {
            topicCallbacks.forEach((cb) => cb(message.body));
          }
        }
      });

      this.subscriptions.set(topic, subscription);
      console.log(`[STOMP] Subscribed to topic: ${topic}`);
    } catch (err) {
      console.error(`[STOMP] Failed to subscribe to ${topic}:`, err);
    }
  }

  public publish(destination: string, body: any) {
    if (this.client && this.isConnected) {
      this.client.publish({
        destination,
        body: typeof body === 'string' ? body : JSON.stringify(body),
      });
    } else {
      console.log(`[STOMP Mock Publish] To ${destination}:`, body);
      // Dispatch local event for offline/mock development
      window.dispatchEvent(new CustomEvent('kds_order_update', { detail: body }));
    }
  }

  public disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.isConnected = false;
      this.subscriptions.clear();
      console.log('[STOMP] Disconnected');
    }
  }

  public getStatus() {
    return this.isConnected;
  }
}

export const stompService = new StompWebSocketService();
