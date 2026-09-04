import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api.types';
import { Table, Area, TableStatus } from '../types/order.types';

const defaultAreas: Area[] = [
  { id: 1, name: 'Khu A' },
  { id: 2, name: 'Khu VIP' },
  { id: 3, name: 'Khu Terrace' }
];

const defaultTables: Table[] = [
  { id: '1', name: 'Bàn A1', tableNumber: 'Bàn A1', status: 'empty', capacity: 4, areaId: 1, areaName: 'Khu A', zone: 'Khu A' },
  { id: '2', name: 'Bàn A2', tableNumber: 'Bàn A2', status: 'occupied', capacity: 4, areaId: 1, areaName: 'Khu A', zone: 'Khu A', currentOrderId: 'ORD-001' },
  { id: '3', name: 'Bàn A3', tableNumber: 'Bàn A3', status: 'empty', capacity: 6, areaId: 1, areaName: 'Khu A', zone: 'Khu A' },
  { id: '4', name: 'Bàn A4', tableNumber: 'Bàn A4', status: 'empty', capacity: 2, areaId: 1, areaName: 'Khu A', zone: 'Khu A' },
  { id: '5', name: 'Bàn VIP 1', tableNumber: 'Bàn VIP 1', status: 'empty', capacity: 8, areaId: 2, areaName: 'Khu VIP', zone: 'Khu VIP' },
  { id: '6', name: 'Bàn VIP 2', tableNumber: 'Bàn VIP 2', status: 'occupied', capacity: 10, areaId: 2, areaName: 'Khu VIP', zone: 'Khu VIP', currentOrderId: 'ORD-002' },
  { id: '7', name: 'Bàn Terrace 1', tableNumber: 'Bàn Terrace 1', status: 'empty', capacity: 4, areaId: 3, areaName: 'Khu Terrace', zone: 'Khu Terrace' },
  { id: '8', name: 'Bàn Terrace 2', tableNumber: 'Bàn Terrace 2', status: 'reserved', capacity: 4, areaId: 3, areaName: 'Khu Terrace', zone: 'Khu Terrace' }
];

const mapBackendStatusToFrontend = (status: string): TableStatus => {
  switch (status?.toUpperCase()) {
    case 'AVAILABLE': return 'empty';
    case 'OCCUPIED': return 'occupied';
    case 'RESERVED': return 'reserved';
    case 'NEEDS_CLEANING': return 'needs_cleaning';
    default: return 'empty';
  }
};

const mapFrontendStatusToBackend = (status: TableStatus): string => {
  switch (status) {
    case 'empty': return 'AVAILABLE';
    case 'occupied': return 'OCCUPIED';
    case 'reserved': return 'RESERVED';
    case 'needs_cleaning': return 'NEEDS_CLEANING';
    default: return 'AVAILABLE';
  }
};

export const getStoredAreas = (branchId: string): Area[] => {
  const key = `mock_areas_${branchId}`;
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {}
  }
  localStorage.setItem(key, JSON.stringify(defaultAreas));
  return defaultAreas;
};

export const saveStoredAreas = (branchId: string, areas: Area[]) => {
  localStorage.setItem(`mock_areas_${branchId}`, JSON.stringify(areas));
};

export const getStoredTables = (branchId: string): Table[] => {
  const key = `mock_tables_${branchId}`;
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {}
  }
  localStorage.setItem(key, JSON.stringify(defaultTables));
  return defaultTables;
};

export const saveStoredTables = (branchId: string, tables: Table[]) => {
  localStorage.setItem(`mock_tables_${branchId}`, JSON.stringify(tables));
};

// ================= AREAS API =================

export const fetchAreasApi = async (branchId: string = '1'): Promise<ApiResponse<Area[]>> => {
  try {
    const res = await axiosClient.get<any, any>('/tables/areas');
    const list: any[] = Array.isArray(res) ? res : res?.data || [];
    if (list && list.length > 0) {
      const areas: Area[] = list.map((a) => ({
        id: a.id,
        branchId: a.branchId,
        name: a.name
      }));
      saveStoredAreas(branchId, areas);
      return { success: true, data: areas };
    }
  } catch (err) {
    console.warn('[Table API] Backend /tables/areas unavailable, using local cache:', err);
  }

  return { success: true, data: getStoredAreas(branchId) };
};

export const createAreaApi = async (name: string, branchId: string = '1'): Promise<ApiResponse<Area>> => {
  try {
    const res = await axiosClient.post<any, any>('/tables/areas', { name });
    const created: any = res?.data || res;
    if (created && created.id) {
      const newArea: Area = { id: created.id, name: created.name, branchId: created.branchId };
      const areas = getStoredAreas(branchId);
      saveStoredAreas(branchId, [...areas, newArea]);
      return { success: true, data: newArea, message: 'Tạo khu vực thành công' };
    }
  } catch (err: any) {
    console.warn('[Table API] Create area failed on backend, saving locally:', err);
  }

  const areas = getStoredAreas(branchId);
  const newArea: Area = { id: Date.now(), name: name.trim() };
  saveStoredAreas(branchId, [...areas, newArea]);
  return { success: true, data: newArea, message: 'Tạo khu vực thành công' };
};

export const updateAreaApi = async (id: number | string, name: string, branchId: string = '1'): Promise<ApiResponse<Area>> => {
  try {
    const res = await axiosClient.put<any, any>(`/tables/areas/${id}`, { name });
    const updated: any = res?.data || res;
    if (updated) {
      const areaObj: Area = { id: updated.id, name: updated.name };
      const areas = getStoredAreas(branchId).map((a) => String(a.id) === String(id) ? areaObj : a);
      saveStoredAreas(branchId, areas);
      return { success: true, data: areaObj, message: 'Cập nhật khu vực thành công' };
    }
  } catch (err: any) {
    console.warn('[Table API] Update area failed on backend, saving locally:', err);
  }

  const areas = getStoredAreas(branchId).map((a) => String(a.id) === String(id) ? { ...a, name } : a);
  saveStoredAreas(branchId, areas);
  return { success: true, data: { id, name }, message: 'Cập nhật khu vực thành công' };
};

export const deleteAreaApi = async (id: number | string, branchId: string = '1'): Promise<ApiResponse<boolean>> => {
  try {
    await axiosClient.delete(`/tables/areas/${id}`);
  } catch (err) {
    console.warn('[Table API] Delete area backend error, deleting locally:', err);
  }

  const areas = getStoredAreas(branchId).filter((a) => String(a.id) !== String(id));
  saveStoredAreas(branchId, areas);
  // Also remove tables in that area
  const tables = getStoredTables(branchId).filter((t) => String(t.areaId) !== String(id));
  saveStoredTables(branchId, tables);

  return { success: true, data: true, message: 'Đã xóa khu vực' };
};

// ================= TABLES API =================

export const fetchTablesApi = async (branchId: string = '1', areaId?: number | string): Promise<ApiResponse<Table[]>> => {
  try {
    const url = areaId ? `/tables?areaId=${areaId}` : '/tables';
    const res = await axiosClient.get<any, any>(url);
    const list: any[] = Array.isArray(res) ? res : res?.data || [];
    if (list && list.length > 0) {
      const tables: Table[] = list.map((t) => ({
        id: String(t.id),
        name: t.tableNumber || `Bàn #${t.id}`,
        tableNumber: t.tableNumber,
        capacity: t.capacity || 4,
        areaId: t.areaId,
        areaName: t.areaName || 'Khu A',
        zone: t.areaName || 'Khu A',
        status: mapBackendStatusToFrontend(t.status)
      }));
      if (!areaId) {
        saveStoredTables(branchId, tables);
      }
      return { success: true, data: tables };
    }
  } catch (err) {
    console.warn('[Table API] Backend /tables unavailable, using local cache:', err);
  }

  const all = getStoredTables(branchId);
  const filtered = areaId ? all.filter((t) => String(t.areaId) === String(areaId)) : all;
  return { success: true, data: filtered };
};

export const createTableApi = async (dto: {
  tableNumber: string;
  capacity: number;
  areaId: number | string;
  status?: TableStatus;
  branchId?: string;
}): Promise<ApiResponse<Table>> => {
  const branchId = dto.branchId || '1';
  const backendPayload = {
    tableNumber: dto.tableNumber,
    capacity: dto.capacity,
    areaId: Number(dto.areaId) || 1,
    status: mapFrontendStatusToBackend(dto.status || 'empty')
  };

  try {
    const res = await axiosClient.post<any, any>('/tables', backendPayload);
    const raw: any = res?.data || res;
    if (raw && raw.id) {
      const newTable: Table = {
        id: String(raw.id),
        name: raw.tableNumber,
        tableNumber: raw.tableNumber,
        capacity: raw.capacity,
        areaId: raw.areaId,
        areaName: raw.areaName,
        zone: raw.areaName,
        status: mapBackendStatusToFrontend(raw.status)
      };
      const tables = getStoredTables(branchId);
      saveStoredTables(branchId, [...tables, newTable]);
      return { success: true, data: newTable, message: 'Tạo bàn mới thành công' };
    }
  } catch (err: any) {
    console.warn('[Table API] Create table backend call failed, saving locally:', err);
  }

  const areas = getStoredAreas(branchId);
  const matchedArea = areas.find((a) => String(a.id) === String(dto.areaId));
  const newTable: Table = {
    id: `T-${Date.now().toString().slice(-4)}`,
    name: dto.tableNumber,
    tableNumber: dto.tableNumber,
    capacity: dto.capacity,
    areaId: dto.areaId,
    areaName: matchedArea?.name || 'Khu A',
    zone: matchedArea?.name || 'Khu A',
    status: dto.status || 'empty'
  };

  const tables = getStoredTables(branchId);
  saveStoredTables(branchId, [...tables, newTable]);
  return { success: true, data: newTable, message: 'Tạo bàn mới thành công' };
};

export const updateTableApi = async (
  id: string | number,
  dto: {
    tableNumber?: string;
    capacity?: number;
    areaId?: number | string;
    status?: TableStatus;
  },
  branchId: string = '1'
): Promise<ApiResponse<Table>> => {
  const backendPayload = {
    tableNumber: dto.tableNumber,
    capacity: dto.capacity,
    areaId: dto.areaId ? Number(dto.areaId) : undefined,
    status: dto.status ? mapFrontendStatusToBackend(dto.status) : undefined
  };

  try {
    const res = await axiosClient.put<any, any>(`/tables/${id}`, backendPayload);
    const raw: any = res?.data || res;
    if (raw && raw.id) {
      const updatedTable: Table = {
        id: String(raw.id),
        name: raw.tableNumber,
        tableNumber: raw.tableNumber,
        capacity: raw.capacity,
        areaId: raw.areaId,
        areaName: raw.areaName,
        zone: raw.areaName,
        status: mapBackendStatusToFrontend(raw.status)
      };
      const tables = getStoredTables(branchId).map((t) => String(t.id) === String(id) ? updatedTable : t);
      saveStoredTables(branchId, tables);
      return { success: true, data: updatedTable, message: 'Cập nhật bàn thành công' };
    }
  } catch (err) {
    console.warn(`[Table API] Update table #${id} backend call failed, updating locally:`, err);
  }

  const tables = getStoredTables(branchId);
  const areas = getStoredAreas(branchId);
  const matchedArea = dto.areaId ? areas.find((a) => String(a.id) === String(dto.areaId)) : undefined;

  const updatedTables = tables.map((t) => {
    if (String(t.id) === String(id)) {
      return {
        ...t,
        name: dto.tableNumber !== undefined ? dto.tableNumber : t.name,
        tableNumber: dto.tableNumber !== undefined ? dto.tableNumber : t.tableNumber,
        capacity: dto.capacity !== undefined ? dto.capacity : t.capacity,
        areaId: dto.areaId !== undefined ? dto.areaId : t.areaId,
        areaName: matchedArea ? matchedArea.name : t.areaName,
        zone: matchedArea ? matchedArea.name : t.zone,
        status: dto.status !== undefined ? dto.status : t.status
      };
    }
    return t;
  });

  saveStoredTables(branchId, updatedTables);
  const found = updatedTables.find((t) => String(t.id) === String(id))!;
  return { success: true, data: found, message: 'Cập nhật bàn thành công' };
};

export const deleteTableApi = async (id: string | number, branchId: string = '1'): Promise<ApiResponse<boolean>> => {
  try {
    await axiosClient.delete(`/tables/${id}`);
  } catch (err) {
    console.warn(`[Table API] Delete table #${id} backend call failed, deleting locally:`, err);
  }

  const tables = getStoredTables(branchId).filter((t) => String(t.id) !== String(id));
  saveStoredTables(branchId, tables);
  return { success: true, data: true, message: 'Đã xóa bàn thành công' };
};

export const updateTableStatusApi = async (
  id: string | number,
  status: TableStatus,
  branchId: string = '1'
): Promise<ApiResponse<Table>> => {
  try {
    const backendStatus = mapFrontendStatusToBackend(status);
    const res = await axiosClient.put<any, any>(`/tables/${id}/status?status=${backendStatus}`);
    const raw: any = res?.data || res;
    if (raw && raw.id) {
      const updatedTable: Table = {
        id: String(raw.id),
        name: raw.tableNumber,
        tableNumber: raw.tableNumber,
        capacity: raw.capacity,
        areaId: raw.areaId,
        areaName: raw.areaName,
        zone: raw.areaName,
        status: mapBackendStatusToFrontend(raw.status)
      };
      const tables = getStoredTables(branchId).map((t) => String(t.id) === String(id) ? updatedTable : t);
      saveStoredTables(branchId, tables);
      return { success: true, data: updatedTable };
    }
  } catch (err) {
    console.warn(`[Table API] Update table status #${id} backend call failed, updating locally:`, err);
  }

  const tables = getStoredTables(branchId);
  const updatedTables = tables.map((t) => String(t.id) === String(id) ? { ...t, status } : t);
  saveStoredTables(branchId, updatedTables);
  const found = updatedTables.find((t) => String(t.id) === String(id))!;
  return { success: true, data: found };
};
