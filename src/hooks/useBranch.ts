import { useEffect } from 'react';
import { useBranchStore } from '../stores/branchStore';

export const useBranch = (autoFetch = false) => {
  const {
    currentBranchId,
    branches,
    loading,
    error,
    setCurrentBranchId,
    setBranches,
    fetchBranches,
    addBranch,
    updateBranch,
    deleteBranch,
  } = useBranchStore();

  useEffect(() => {
    if (autoFetch) {
      fetchBranches();
    }
  }, [autoFetch, fetchBranches]);

  const activeBranch = branches.find((b) => String(b.id) === String(currentBranchId)) || branches[0];

  return {
    currentBranchId,
    activeBranch,
    branches,
    loading,
    error,
    setCurrentBranch: setCurrentBranchId,
    setBranches,
    fetchBranches,
    addBranch,
    updateBranch,
    deleteBranch,
  };
};
