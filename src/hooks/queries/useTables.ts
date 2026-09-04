import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAreasApi,
  createAreaApi,
  updateAreaApi,
  deleteAreaApi,
  fetchTablesApi,
  createTableApi,
  updateTableApi,
  deleteTableApi,
  updateTableStatusApi
} from '../../api/table.api';
import { useBranch } from '../useBranch';
import { TableStatus } from '../../types/order.types';

export const useTables = (selectedAreaId?: number | string) => {
  const { currentBranchId } = useBranch();
  const queryClient = useQueryClient();

  const areasQuery = useQuery({
    queryKey: ['areas', currentBranchId],
    queryFn: () => fetchAreasApi(currentBranchId).then((res) => res.data),
  });

  const tablesQuery = useQuery({
    queryKey: ['tables', currentBranchId, selectedAreaId],
    queryFn: () => fetchTablesApi(currentBranchId, selectedAreaId).then((res) => res.data),
  });

  const createAreaMutation = useMutation({
    mutationFn: (name: string) => createAreaApi(name, currentBranchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas', currentBranchId] });
      queryClient.invalidateQueries({ queryKey: ['tables', currentBranchId] });
    }
  });

  const updateAreaMutation = useMutation({
    mutationFn: ({ id, name }: { id: number | string; name: string }) =>
      updateAreaApi(id, name, currentBranchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas', currentBranchId] });
      queryClient.invalidateQueries({ queryKey: ['tables', currentBranchId] });
    }
  });

  const deleteAreaMutation = useMutation({
    mutationFn: (id: number | string) => deleteAreaApi(id, currentBranchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas', currentBranchId] });
      queryClient.invalidateQueries({ queryKey: ['tables', currentBranchId] });
    }
  });

  const createTableMutation = useMutation({
    mutationFn: (dto: { tableNumber: string; capacity: number; areaId: number | string; status?: TableStatus }) =>
      createTableApi({ ...dto, branchId: currentBranchId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', currentBranchId] });
    }
  });

  const updateTableMutation = useMutation({
    mutationFn: ({ id, ...dto }: { id: string | number; tableNumber?: string; capacity?: number; areaId?: number | string; status?: TableStatus }) =>
      updateTableApi(id, dto, currentBranchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', currentBranchId] });
    }
  });

  const deleteTableMutation = useMutation({
    mutationFn: (id: string | number) => deleteTableApi(id, currentBranchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', currentBranchId] });
    }
  });

  const updateTableStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: TableStatus }) =>
      updateTableStatusApi(id, status, currentBranchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', currentBranchId] });
    }
  });

  return {
    areas: areasQuery.data || [],
    isLoadingAreas: areasQuery.isLoading,
    refetchAreas: areasQuery.refetch,

    tables: tablesQuery.data || [],
    isLoadingTables: tablesQuery.isLoading,
    refetchTables: tablesQuery.refetch,

    createArea: createAreaMutation.mutateAsync,
    isCreatingArea: createAreaMutation.isPending,

    updateArea: updateAreaMutation.mutateAsync,
    isUpdatingArea: updateAreaMutation.isPending,

    deleteArea: deleteAreaMutation.mutateAsync,
    isDeletingArea: deleteAreaMutation.isPending,

    createTable: createTableMutation.mutateAsync,
    isCreatingTable: createTableMutation.isPending,

    updateTable: updateTableMutation.mutateAsync,
    isUpdatingTable: updateTableMutation.isPending,

    deleteTable: deleteTableMutation.mutateAsync,
    isDeletingTable: deleteTableMutation.isPending,

    updateTableStatus: updateTableStatusMutation.mutateAsync,
    isUpdatingTableStatus: updateTableStatusMutation.isPending
  };
};
