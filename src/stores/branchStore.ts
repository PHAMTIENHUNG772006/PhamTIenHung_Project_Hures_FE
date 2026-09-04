import { create } from 'zustand';
import { Branch } from '../types/api.types';
import {
  getStoredBranches,
  saveStoredBranches,
  fetchBranchesApi,
  createBranchApi,
  updateBranchApi,
  deleteBranchApi,
} from '../api/branch.api';

interface BranchState {
  currentBranchId: string;
  branches: Branch[];
  loading: boolean;
  error: string | null;
  setCurrentBranchId: (id: string | number) => void;
  setBranches: (branches: Branch[]) => void;
  fetchBranches: () => Promise<Branch[]>;
  addBranch: (branch: Partial<Branch>) => Promise<Branch>;
  updateBranch: (id: string | number, branch: Partial<Branch>) => Promise<Branch>;
  deleteBranch: (id: string | number) => Promise<void>;
}

export const useBranchStore = create<BranchState>((set, get) => {
  const initialBranches = getStoredBranches();
  const storedBranchId = String(localStorage.getItem('rest_branch_id') || initialBranches[0]?.id || '1');

  return {
    currentBranchId: storedBranchId,
    branches: initialBranches,
    loading: false,
    error: null,
    setCurrentBranchId: (id) => {
      const strId = String(id);
      localStorage.setItem('rest_branch_id', strId);
      set({ currentBranchId: strId });
    },
    setBranches: (branches) => {
      saveStoredBranches(branches);
      set({ branches });
    },
    fetchBranches: async () => {
      set({ loading: true, error: null });
      try {
        const res = await fetchBranchesApi();
        if (res.success && res.data) {
          set({ branches: res.data, loading: false });
          return res.data;
        }
      } catch (err: any) {
        set({ error: err.message || 'Lỗi tải chi nhánh', loading: false });
      }
      set({ loading: false });
      return get().branches;
    },
    addBranch: async (branchData) => {
      set({ loading: true, error: null });
      try {
        const res = await createBranchApi(branchData);
        if (res.success && res.data) {
          const updated = [...get().branches, res.data];
          set({ branches: updated, loading: false });
          return res.data;
        }
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
      set({ loading: false });
      throw new Error('Không thể tạo chi nhánh');
    },
    updateBranch: async (id, updatedData) => {
      set({ loading: true, error: null });
      try {
        const res = await updateBranchApi(id, updatedData);
        if (res.success && res.data) {
          const updated = get().branches.map((b) =>
            String(b.id) === String(id) ? { ...b, ...res.data } : b
          );
          set({ branches: updated, loading: false });
          return res.data;
        }
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
      set({ loading: false });
      throw new Error('Không thể cập nhật chi nhánh');
    },
    deleteBranch: async (id) => {
      set({ loading: true, error: null });
      try {
        await deleteBranchApi(id);
        const currentId = get().currentBranchId;
        const updated = get().branches.filter((b) => String(b.id) !== String(id));
        const newCurrentId =
          String(currentId) === String(id) && updated.length > 0
            ? String(updated[0].id)
            : currentId;

        if (newCurrentId !== currentId) {
          localStorage.setItem('rest_branch_id', newCurrentId);
        }
        set({ branches: updated, currentBranchId: newCurrentId, loading: false });
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    },
  };
});
