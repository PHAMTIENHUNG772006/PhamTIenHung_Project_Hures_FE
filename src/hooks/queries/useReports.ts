import { useQuery } from '@tanstack/react-query';
import { fetchFinancialSummaryApi, fetchMenuEngineeringDataApi } from '../../api/report.api';
import { useBranch } from '../useBranch';

export const useReports = (duration = 'month') => {
  const { currentBranchId } = useBranch();

  const financialQuery = useQuery({
    queryKey: ['financialSummary', currentBranchId, duration],
    queryFn: () => fetchFinancialSummaryApi(currentBranchId, duration).then((res) => res.data)
  });

  const menuEngineeringQuery = useQuery({
    queryKey: ['menuEngineering', currentBranchId],
    queryFn: () => fetchMenuEngineeringDataApi(currentBranchId).then((res) => res.data)
  });

  return {
    financialSummary: financialQuery.data,
    isLoadingFinancial: financialQuery.isLoading,
    refetchFinancial: financialQuery.refetch,

    menuEngineeringData: menuEngineeringQuery.data || [],
    isLoadingMenuEngineering: menuEngineeringQuery.isLoading,
    refetchMenuEngineering: menuEngineeringQuery.refetch
  };
};
