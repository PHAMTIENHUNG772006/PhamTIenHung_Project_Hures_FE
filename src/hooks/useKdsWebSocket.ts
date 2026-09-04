import { useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

export interface KdsOrderEvent {
  orderId?: string;
  tableId?: string;
  status?: string;
  items?: any[];
  timestamp?: string;
  type?: 'NEW_ORDER' | 'ITEM_STATUS_CHANGE' | 'ORDER_COMPLETE' | 'UPDATE';
}

/**
 * Custom hook connecting specifically to the Kitchen Display System (KDS)
 * STOMP topic for the given branch: /topic/branch/{branchId}/kds
 */
export const useKdsWebSocket = (
  branchId: string,
  onOrderUpdate?: (event: KdsOrderEvent) => void
) => {
  const topic = `/topic/branch/${branchId || 'CN01'}/kds`;

  const handleMessage = useCallback(
    (data: any) => {
      console.log(`[useKdsWebSocket] Received KDS event on ${topic}:`, data);
      if (onOrderUpdate) {
        onOrderUpdate(data);
      }
    },
    [topic, onOrderUpdate]
  );

  const { isConnected, send } = useWebSocket(topic, handleMessage);

  const notifyKitchenStatus = useCallback(
    (orderId: string, status: string, itemId?: string) => {
      const destination = `/app/branch/${branchId || 'CN01'}/kds/update-status`;
      send(destination, {
        orderId,
        itemId,
        status,
        updatedAt: new Date().toISOString(),
      });
    },
    [branchId, send]
  );

  return {
    isConnected,
    topic,
    notifyKitchenStatus,
  };
};
