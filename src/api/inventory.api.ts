import { ApiResponse } from '../types/api.types';
import { Ingredient, StockImport, Recipe, BOMItem } from '../types/inventory.types';

// Seed Ingredients
const getMockIngredients = (branchId: string): Ingredient[] => {
  const key = `mock_ingredients_${branchId}`;
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);

  const defaults: Ingredient[] = [
    { id: 'ING-01', name: 'Thịt bò Mỹ', sku: 'BEEF-US-01', unit: 'kg', stock: 12.5, minStock: 5.0, pricePerUnit: 280000, updatedAt: new Date().toISOString() },
    { id: 'ING-02', name: 'Hải sản tổng hợp (Tôm, mực)', sku: 'SEAF-MIX-01', unit: 'kg', stock: 3.2, minStock: 8.0, pricePerUnit: 350000, updatedAt: new Date().toISOString() }, // Low stock!
    { id: 'ING-03', name: 'Gạo tẻ thơm', sku: 'RICE-THOM-01', unit: 'kg', stock: 45.0, minStock: 20.0, pricePerUnit: 22000, updatedAt: new Date().toISOString() },
    { id: 'ING-04', name: 'Sả cây tươi', sku: 'SPICE-LEMON-01', unit: 'kg', stock: 1.5, minStock: 3.0, pricePerUnit: 15000, updatedAt: new Date().toISOString() }, // Low stock!
    { id: 'ING-05', name: 'Heineken Lon', sku: 'BEER-KEN-01', unit: 'lon', stock: 240, minStock: 48, pricePerUnit: 18000, updatedAt: new Date().toISOString() },
    { id: 'ING-06', name: 'Cốt lẩu Thái đóng gói', sku: 'SAUCE-THAI-01', unit: 'lít', stock: 8.0, minStock: 5.0, pricePerUnit: 90000, updatedAt: new Date().toISOString() }
  ];
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
};

const saveIngredients = (branchId: string, ingredients: Ingredient[]) => {
  localStorage.setItem(`mock_ingredients_${branchId}`, JSON.stringify(ingredients));
};

// Seed Stock Imports
const getMockImports = (branchId: string): StockImport[] => {
  const key = `mock_imports_${branchId}`;
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);

  const defaults: StockImport[] = [
    {
      id: 'IMP-001',
      supplier: 'Đại lý Thực phẩm Sạch Hùng Phát',
      importDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        { ingredientId: 'ING-01', name: 'Thịt bò Mỹ', quantity: 20, cost: 260000 },
        { ingredientId: 'ING-03', name: 'Gạo tẻ thơm', quantity: 50, cost: 20000 }
      ],
      totalCost: 6200000,
      status: 'completed',
      branchId
    }
  ];
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
};

const saveImports = (branchId: string, imports: StockImport[]) => {
  localStorage.setItem(`mock_imports_${branchId}`, JSON.stringify(imports));
};

// Seed Recipes (BOMs) mapping menu items to ingredients
const getMockRecipes = (): Recipe[] => {
  const key = 'mock_recipes';
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);

  const defaults: Recipe[] = [
    {
      id: 'P-01',
      menuItemName: 'Lẩu Thái Hải Sản',
      menuItemPrice: 350000,
      ingredients: [
        { ingredientId: 'ING-02', name: 'Hải sản tổng hợp (Tôm, mực)', quantity: 0.5, unit: 'kg' },
        { ingredientId: 'ING-04', name: 'Sả cây tươi', quantity: 0.2, unit: 'kg' },
        { ingredientId: 'ING-06', name: 'Cốt lẩu Thái đóng gói', quantity: 1.0, unit: 'lít' }
      ]
    },
    {
      id: 'P-02',
      menuItemName: 'Nghêu hấp sả',
      menuItemPrice: 95000,
      ingredients: [
        { ingredientId: 'ING-04', name: 'Sả cây tươi', quantity: 0.3, unit: 'kg' }
      ]
    },
    {
      id: 'P-05',
      menuItemName: 'Bia Heineken',
      menuItemPrice: 25000,
      ingredients: [
        { ingredientId: 'ING-05', name: 'Heineken Lon', quantity: 1.0, unit: 'lon' }
      ]
    }
  ];
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
};

const saveRecipes = (recipes: Recipe[]) => {
  localStorage.setItem('mock_recipes', JSON.stringify(recipes));
};

export const fetchIngredientsApi = async (branchId: string): Promise<ApiResponse<Ingredient[]>> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { success: true, data: getMockIngredients(branchId) };
};

export const fetchStockImportsApi = async (branchId: string): Promise<ApiResponse<StockImport[]>> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { success: true, data: getMockImports(branchId) };
};

export const createStockImportApi = async (
  branchId: string,
  supplier: string,
  items: { ingredientId: string; name: string; quantity: number; cost: number }[]
): Promise<ApiResponse<StockImport>> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const imports = getMockImports(branchId);
  const ingredients = getMockIngredients(branchId);

  const totalCost = items.reduce((sum, item) => sum + item.cost * item.quantity, 0);

  const newImport: StockImport = {
    id: `IMP-${Math.floor(100 + Math.random() * 900)}`,
    supplier,
    importDate: new Date().toISOString(),
    items,
    totalCost,
    status: 'completed', // auto-completed for mockup speed
    branchId
  };

  imports.unshift(newImport);
  saveImports(branchId, imports);

  // Auto-adjust inventory stock
  items.forEach((item) => {
    const idx = ingredients.findIndex((ing) => ing.id === item.ingredientId);
    if (idx > -1) {
      ingredients[idx].stock += item.quantity;
      ingredients[idx].updatedAt = new Date().toISOString();
    }
  });
  saveIngredients(branchId, ingredients);

  return { success: true, data: newImport };
};

export const fetchRecipesApi = async (): Promise<ApiResponse<Recipe[]>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return { success: true, data: getMockRecipes() };
};

export const updateRecipeBOMApi = async (
  recipeId: string,
  ingredients: BOMItem[]
): Promise<ApiResponse<Recipe>> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const recipes = getMockRecipes();
  const idx = recipes.findIndex((r) => r.id === recipeId);
  if (idx > -1) {
    recipes[idx].ingredients = ingredients;
    saveRecipes(recipes);
    return { success: true, data: recipes[idx] };
  }
  return { success: false, data: null as any, message: 'Công thức món ăn không tồn tại' };
};
