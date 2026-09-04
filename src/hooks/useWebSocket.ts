import { useEffect, useState, useCallback, useRef } from 'react';
import { stompService } from '../services/websocketService';

export interface WebSocketHookReturn {
  isConnected: boolean;
  send: (destination: string, body: any) => void;
}

export const useWebSocket = (
  topic: string,
  onMessage: (data: any) => void
): WebSocketHookReturn => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    // 1. Subscribe to STOMP Broker topic
    const unsubscribeStomp = stompService.subscribe(topic, (data) => {
      onMessageRef.current(data);
    });

    // 2. Also listen for custom browser events for robust dev-mock fallback
    const handleLocalEvent = (e: CustomEvent | Event) => {
      const detail = (e as CustomEvent).detail || { timestamp: new Date().toISOString(), type: 'UPDATE' };
      onMessageRef.current(detail);
    };

    window.addEventListener('kds_order_update', handleLocalEvent);

    return () => {
      unsubscribeStomp();
      window.removeEventListener('kds_order_update', handleLocalEvent);
    };
  }, [topic]);

  const send = useCallback((destination: string, body: any) => {
    stompService.publish(destination, body);
  }, []);

  return { isConnected, send };
};
