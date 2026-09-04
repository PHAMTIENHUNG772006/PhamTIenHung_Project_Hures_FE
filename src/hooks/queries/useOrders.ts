import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTablesApi,
  fetchOrdersApi,
  createOrderApi,
  updateOrderItemsApi,
  updateOrderStatusApi,
  checkoutOrderApi,
  splitOrderApi,
  mergeTablesApi
} from '../../api/order.api';
import { useBranch } from '../useBranch';

export const useOrders = () => {
  const { currentBranchId } = useBranch();
  const queryClient = useQueryClient();

  const tablesQuery = useQuery({
    queryKey: ['tables', currentBranchId],
    queryFn: () => fetchTablesApi(currentBranchId).then(res => res.data),
  });

  const ordersQuery = useQuery({
    queryKey: ['orders', currentBranchId],
    queryFn: () => fetchOrdersApi(currentBranchId).then(res => res.data),
  });

  const createOrderMutation = useMutation({
    mutationFn: ({ tableId, tableName, items, discount, tax }: {
      tableId: string;
      tableName: string;
      items: any[];
      discount?: number;
      tax?: number;
    }) => createOrderApi(currentBranchId, tableId, tableName, items, discount, tax),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', currentBranchId] });
      queryClient.invalidateQueries({ queryKey: ['orders', currentBranchId] });
    }
  });

  const updateOrderItemsMutation = useMutation({
    mutationFn: ({ orderId, items }: { orderId: string; items: any[] }) =>
      updateOrderItemsApi(currentBranchId, orderId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', currentBranchId] });
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: any }) =>
      updateOrderStatusApi(currentBranchId, orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', currentBranchId] });
    }
  });

  const checkoutOrderMutation = useMutation({
    mutationFn: (orderId: string) => checkoutOrderApi(currentBranchId, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', currentBranchId] });
      queryClient.invalidateQueries({ queryKey: ['orders', currentBranchId] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary', currentBranchId] });
    }
  });

  const splitOrderMutation = useMutation({
    mutationFn: ({ sourceOrderId, itemsToSplit, targetTableId, targetTableName }: {
      sourceOrderId: string;
      itemsToSplit: any[];
      targetTableId: string;
      targetTableName: string;
    }) => splitOrderApi(currentBranchId, sourceOrderId, itemsToSplit, targetTableId, targetTableName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', currentBranchId] });
      queryClient.invalidateQueries({ queryKey: ['orders', currentBranchId] });
    }
  });

  const mergeTablesMutation = useMutation({
    mutationFn: ({ sourceTableId, targetTableId }: { sourceTableId: string; targetTableId: string }) =>
      mergeTablesApi(currentBranchId, sourceTableId, targetTableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', currentBranchId] });
      queryClient.invalidateQueries({ queryKey: ['orders', currentBranchId] });
    }
  });

  return {
    tables: tablesQuery.data || [],
    isLoadingTables: tablesQuery.isLoading,
    refetchTables: tablesQuery.refetch,
    
    orders: ordersQuery.data || [],
    isLoadingOrders: ordersQuery.isLoading,
    refetchOrders: ordersQuery.refetch,

    createOrder: createOrderMutation.mutateAsync,
    isCreatingOrder: createOrderMutation.isPending,

    updateOrderItems: updateOrderItemsMutation.mutateAsync,
    updateOrderStatus: updateOrderStatusMutation.mutateAsync,

    checkoutOrder: checkoutOrderMutation.mutateAsync,
    isCheckingOut: checkoutOrderMutation.isPending,

    splitOrder: splitOrderMutation.mutateAsync,
    isSplittingOrder: splitOrderMutation.isPending,

    mergeTables: mergeTablesMutation.mutateAsync,
    isMergingTables: mergeTablesMutation.isPending
  };
};
