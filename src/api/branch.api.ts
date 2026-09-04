import axiosClient from './axiosClient';
import { ApiResponse, Branch } from '../types/api.types';

const BRANCH_STORAGE_KEY = 'rest_branches';

const getDefaultBranches = (): Branch[] => [
  {
    id: 1,
    code: 'CN01',
    name: 'Chi nhánh Quận 1 (Chính)',
    address: '123 Lê Lợi, P. Bến Thành, Q.1, TP.HCM',
    phone: '028 3824 1234',
    email: 'quan1@restaurant.com',
    managerName: 'Nguyễn Văn Quản Lý',
    isActive: true,
    status: 'active',
    openingHours: '08:00 - 23:00',
    totalTables: 24,
    createdAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 2,
    code: 'CN02',
    name: 'Chi nhánh Quận 3',
    address: '456 Nguyễn Thị Minh Khai, Q.3, TP.HCM',
    phone: '028 3930 5678',
    email: 'quan3@restaurant.com',
    managerName: 'Trần Thị Thu Thảo',
    isActive: true,
    status: 'active',
    openingHours: '09:00 - 22:30',
    totalTables: 18,
    createdAt: '2025-03-15T08:00:00Z'
  },
  {
    id: 3,
    code: 'CN03',
    name: 'Chi nhánh Quận 7',
    address: '789 Nguyễn Văn Linh, P. Tân Phong, Q.7, TP.HCM',
    phone: '028 5410 9999',
    email: 'quan7@restaurant.com',
    managerName: 'Lê Hoàng Nam',
    isActive: true,
    status: 'active',
    openingHours: '08:30 - 23:00',
    totalTables: 30,
    createdAt: '2025-06-20T08:00:00Z'
  }
];

export const normalizeBranch = (item: any): Branch => ({
  id: item.id,
  code: item.code || (item.id ? `CN${String(item.id).padStart(2, '0')}` : 'CN01'),
  name: item.name || '',
  address: item.address || '',
  phone: item.phone || '',
  email: item.email || '',
  managerName: item.managerName || '',
  isActive: item.isActive !== undefined ? item.isActive : (item.status !== 'inactive'),
  status: (item.isActive === true || item.status === 'active' || item.isActive === undefined) ? 'active' : 'inactive',
  openingHours: item.openingHours || '08:00 - 22:30',
  totalTables: item.totalTables || 20,
  createdAt: item.createdAt || new Date().toISOString()
});

export const getStoredBranches = (): Branch[] => {
  const data = localStorage.getItem(BRANCH_STORAGE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeBranch);
      }
    } catch {
      // Fallback
    }
  }
  const defaults = getDefaultBranches();
  localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
};

export const saveStoredBranches = (branches: Branch[]) => {
  localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(branches.map(normalizeBranch)));
};

/**
 * Fetch all branches from Spring Boot backend: GET /api/branches
 */
export const fetchBranchesApi = async (): Promise<ApiResponse<Branch[]>> => {
  try {
    const response = await axiosClient.get<any, any>('/branches');
    // Normalize response if wrapped in ApiResponse or returned directly
    const rawList = Array.isArray(response)
      ? response
      : (Array.isArray(response?.data) ? response.data : response?.content || []);

    if (rawList && rawList.length > 0) {
      const list = rawList.map(normalizeBranch);
      saveStoredBranches(list);
      return {
        success: true,
        data: list,
        message: response?.message || 'Tải danh sách chi nhánh thành công',
      };
    }
  } catch (error) {
    console.warn('[Branch API] Backend unavailable, falling back to local storage:', error);
  }

  // Fallback to local storage
  const branches = getStoredBranches();
  return {
    success: true,
    data: branches,
  };
};

/**
 * Fetch branch by ID from Spring Boot backend: GET /api/branches/{id}
 */
export const getBranchByIdApi = async (id: string | number): Promise<ApiResponse<Branch>> => {
  try {
    const response = await axiosClient.get<any, any>(`/branches/${id}`);
    const raw = response?.data || response;
    if (raw && raw.id) {
      return {
        success: true,
        data: normalizeBranch(raw),
      };
    }
  } catch (error) {
    console.warn(`[Branch API] Failed to fetch branch #${id} from backend:`, error);
  }

  const branches = getStoredBranches();
  const matched = branches.find((b) => String(b.id) === String(id));
  if (matched) {
    return { success: true, data: matched };
  }
  throw new Error(`Không tìm thấy chi nhánh #${id}`);
};

/**
 * Create new branch: POST /api/branches
 */
export const createBranchApi = async (
  dto: Partial<Branch>
): Promise<ApiResponse<Branch>> => {
  const payload = {
    code: dto.code || undefined,
    name: dto.name,
    address: dto.address,
    phone: dto.phone,
    isActive: dto.status ? dto.status === 'active' : (dto.isActive !== undefined ? dto.isActive : true)
  };

  try {
    const response = await axiosClient.post<any, any>('/branches', payload);
    const raw: any = response?.data || response;

    if (raw && raw.id) {
      const newBranch = normalizeBranch({
        ...raw,
        email: dto.email,
        managerName: dto.managerName,
        openingHours: dto.openingHours,
        totalTables: dto.totalTables
      });
      const branches = getStoredBranches();
      const updated = [...branches.filter(b => String(b.id) !== String(newBranch.id)), newBranch];
      saveStoredBranches(updated);
      return {
        success: true,
        data: newBranch,
        message: response?.message || 'Tạo chi nhánh mới thành công!',
      };
    }
  } catch (error: any) {
    console.warn('[Branch API] Create branch API error, falling back locally:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
  }

  // Local fallback
  const branches = getStoredBranches();
  const newId = dto.id ? dto.id : branches.length + 1;
  const newBranch = normalizeBranch({
    ...dto,
    id: newId,
    code: dto.code || `CN${String(newId).padStart(2, '0')}`,
    createdAt: new Date().toISOString(),
  });

  const updated = [...branches, newBranch];
  saveStoredBranches(updated);
  return {
    success: true,
    data: newBranch,
    message: 'Tạo chi nhánh mới thành công!',
  };
};

/**
 * Update branch: PUT /api/branches/{id}
 */
export const updateBranchApi = async (
  id: string | number,
  dto: Partial<Branch>
): Promise<ApiResponse<Branch>> => {
  const payload = {
    code: dto.code || undefined,
    name: dto.name,
    address: dto.address,
    phone: dto.phone,
    isActive: dto.status ? dto.status === 'active' : (dto.isActive !== undefined ? dto.isActive : true)
  };

  try {
    const response = await axiosClient.put<any, any>(`/branches/${id}`, payload);
    const raw: any = response?.data || response;

    if (raw && raw.id) {
      const updatedBranch = normalizeBranch({
        ...raw,
        email: dto.email,
        managerName: dto.managerName,
        openingHours: dto.openingHours,
        totalTables: dto.totalTables
      });
      const branches = getStoredBranches();
      const updated = branches.map((b) =>
        String(b.id) === String(id) ? updatedBranch : b
      );
      saveStoredBranches(updated);
      return {
        success: true,
        data: updatedBranch,
        message: response?.message || 'Cập nhật thông tin chi nhánh thành công!',
      };
    }
  } catch (error: any) {
    console.warn(`[Branch API] Update branch #${id} error:`, error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
  }

  // Local fallback
  const branches = getStoredBranches();
  const index = branches.findIndex((b) => String(b.id) === String(id));
  if (index === -1) {
    throw new Error(`Không tìm thấy chi nhánh #${id}`);
  }

  const updatedBranch = normalizeBranch({
    ...branches[index],
    ...dto,
  });
  branches[index] = updatedBranch;
  saveStoredBranches(branches);

  return {
    success: true,
    data: updatedBranch,
    message: 'Cập nhật thông tin chi nhánh thành công!',
  };
};

/**
 * Delete branch: DELETE /api/branches/{id}
 */
export const deleteBranchApi = async (id: string | number): Promise<ApiResponse<boolean>> => {
  try {
    await axiosClient.delete(`/branches/${id}`);
  } catch (error: any) {
    console.warn(`[Branch API] Delete branch #${id} backend call failed:`, error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
  }

  const branches = getStoredBranches();
  if (branches.length <= 1) {
    throw new Error('Hệ thống phải có ít nhất 1 chi nhánh hoạt động. Không thể xóa!');
  }

  const updated = branches.filter((b) => String(b.id) !== String(id));
  saveStoredBranches(updated);

  return {
    success: true,
    data: true,
    message: 'Đã xóa chi nhánh thành công!',
  };
};
