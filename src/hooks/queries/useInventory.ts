import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchIngredientsApi,
  fetchStockImportsApi,
  createStockImportApi,
  fetchRecipesApi,
  updateRecipeBOMApi
} from '../../api/inventory.api';
import { useBranch } from '../useBranch';

export const useInventory = () => {
  const { currentBranchId } = useBranch();
  const queryClient = useQueryClient();

  const ingredientsQuery = useQuery({
    queryKey: ['ingredients', currentBranchId],
    queryFn: () => fetchIngredientsApi(currentBranchId).then((res) => res.data)
  });

  const importsQuery = useQuery({
    queryKey: ['stockImports', currentBranchId],
    queryFn: () => fetchStockImportsApi(currentBranchId).then((res) => res.data)
  });

  const recipesQuery = useQuery({
    queryKey: ['recipes'],
    queryFn: () => fetchRecipesApi().then((res) => res.data)
  });

  const createImportMutation = useMutation({
    mutationFn: ({ supplier, items }: { supplier: string; items: any[] }) =>
      createStockImportApi(currentBranchId, supplier, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients', currentBranchId] });
      queryClient.invalidateQueries({ queryKey: ['stockImports', currentBranchId] });
    }
  });

  const updateRecipeBOMMutation = useMutation({
    mutationFn: ({ recipeId, ingredients }: { recipeId: string; ingredients: any[] }) =>
      updateRecipeBOMApi(recipeId, ingredients),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    }
  });

  return {
    ingredients: ingredientsQuery.data || [],
    isLoadingIngredients: ingredientsQuery.isLoading,
    refetchIngredients: ingredientsQuery.refetch,

    stockImports: importsQuery.data || [],
    isLoadingImports: importsQuery.isLoading,
    refetchImports: importsQuery.refetch,

    recipes: recipesQuery.data || [],
    isLoadingRecipes: recipesQuery.isLoading,
    refetchRecipes: recipesQuery.refetch,

    createImport: createImportMutation.mutateAsync,
    isCreatingImport: createImportMutation.isPending,

    updateRecipeBOM: updateRecipeBOMMutation.mutateAsync,
    isUpdatingBOM: updateRecipeBOMMutation.isPending
  };
};
