export interface Ingredient {
  id: string;
  name: string;
  sku: string;
  unit: string;
  stock: number;
  minStock: number;
  pricePerUnit: number;
  updatedAt: string;
}

export interface StockImportItem {
  ingredientId: string;
  name: string;
  quantity: number;
  cost: number;
}

export interface StockImport {
  id: string;
  supplier: string;
  importDate: string;
  items: StockImportItem[];
  totalCost: number;
  status: 'pending' | 'completed' | 'cancelled';
  branchId: string;
}

export interface BOMItem {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string; // matches product/menu item ID
  menuItemName: string;
  menuItemPrice: number;
  ingredients: BOMItem[];
}
