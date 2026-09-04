import { ApiResponse } from '../types/api.types';

export interface FinancialMetric {
  label: string;
  value: number;
  changePercent: number; // positive or negative
  trend: 'up' | 'down';
}

export interface FinancialSummary {
  metrics: FinancialMetric[];
  chartData: { month: string; revenue: number; cost: number; profit: number }[];
  operatingExpenses: { name: string; amount: number; percentage: number }[];
}

export interface MenuEngineeringItem {
  id: string;
  name: string;
  category: 'Star' | 'Plowhorse' | 'Puzzle' | 'Dog';
  salesVolume: number;
  popularityScore: number; // 0 - 100
  profitMargin: number; // in VND
  marginScore: number; // 0 - 100
  price: number;
}

export const fetchFinancialSummaryApi = async (
  branchId: string,
  duration = 'month'
): Promise<ApiResponse<FinancialSummary>> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Load dynamic order revenue totals from localStorage if available
  const historyKey = `revenue_history_${branchId}`;
  const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
  const dynamicRevenue = history.reduce((sum: number, h: any) => sum + h.amount, 0);

  // Define static base revenue
  const baseRevenue = branchId === 'CN01' ? 840000000 : branchId === 'CN02' ? 520000000 : 380000000;
  const finalRevenue = baseRevenue + dynamicRevenue;
  const foodCost = Math.round(finalRevenue * 0.32); // 32% food cost index
  const laborCost = Math.round(finalRevenue * 0.22); // 22% labor cost
  const rentAndUtilities = branchId === 'CN01' ? 95000000 : branchId === 'CN02' ? 70000000 : 50000000;
  const netProfit = finalRevenue - foodCost - laborCost - rentAndUtilities;

  const metrics: FinancialMetric[] = [
    { label: 'Tổng Doanh Thu', value: finalRevenue, changePercent: 12.4, trend: 'up' },
    { label: 'Chi Phí Nguyên Liệu (BOM)', value: foodCost, changePercent: -2.1, trend: 'down' },
    { label: 'Chi Phí Nhân Sự (HRM)', value: laborCost, changePercent: 4.5, trend: 'up' },
    { label: 'Lợi Nhuận Ròng', value: netProfit, changePercent: 18.2, trend: 'up' }
  ];

  const chartData = [
    { month: 'T1', revenue: Math.round(finalRevenue * 0.8), cost: Math.round(foodCost * 0.8 + laborCost * 0.8), profit: Math.round(netProfit * 0.8) },
    { month: 'T2', revenue: Math.round(finalRevenue * 0.85), cost: Math.round(foodCost * 0.85 + laborCost * 0.85), profit: Math.round(netProfit * 0.85) },
    { month: 'T3', revenue: Math.round(finalRevenue * 0.95), cost: Math.round(foodCost * 0.95 + laborCost * 0.95), profit: Math.round(netProfit * 0.95) },
    { month: 'T4', revenue: Math.round(finalRevenue * 0.9), cost: Math.round(foodCost * 0.9 + laborCost * 0.9), profit: Math.round(netProfit * 0.9) },
    { month: 'T5', revenue: Math.round(finalRevenue * 1.05), cost: Math.round(foodCost * 1.05 + laborCost * 1.05), profit: Math.round(netProfit * 1.05) },
    { month: 'T6', revenue: finalRevenue, cost: foodCost + laborCost, profit: netProfit }
  ];

  const operatingExpenses = [
    { name: 'Nguyên liệu thực phẩm', amount: foodCost, percentage: 32 },
    { name: 'Lương & Thưởng nhân sự', amount: laborCost, percentage: 22 },
    { name: 'Mặt bằng & Điện nước', amount: rentAndUtilities, percentage: 10 },
    { name: 'Marketing & Quảng cáo', amount: Math.round(finalRevenue * 0.05), percentage: 5 },
    { name: 'Khác', amount: finalRevenue - foodCost - laborCost - rentAndUtilities - Math.round(finalRevenue * 0.05) - netProfit, percentage: 31 }
  ];

  return {
    success: true,
    data: {
      metrics,
      chartData,
      operatingExpenses
    }
  };
};

export const fetchMenuEngineeringDataApi = async (
  branchId: string
): Promise<ApiResponse<MenuEngineeringItem[]>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  // High-volume, High-margin = Star
  // High-volume, Low-margin = Plowhorse
  // Low-volume, High-margin = Puzzle
  // Low-volume, Low-margin = Dog
  const defaults: MenuEngineeringItem[] = [
    { id: 'P-01', name: 'Lẩu Thái Hải Sản', category: 'Star', salesVolume: 340, popularityScore: 88, profitMargin: 120000, marginScore: 82, price: 350000 },
    { id: 'P-03', name: 'Cua sốt ớt Singapore', category: 'Puzzle', salesVolume: 90, popularityScore: 35, profitMargin: 350000, marginScore: 95, price: 850000 },
    { id: 'P-05', name: 'Bia Heineken', category: 'Plowhorse', salesVolume: 1200, popularityScore: 95, profitMargin: 7000, marginScore: 22, price: 25000 },
    { id: 'P-02', name: 'Nghêu hấp sả', category: 'Dog', salesVolume: 80, popularityScore: 30, profitMargin: 20000, marginScore: 40, price: 95000 },
    { id: 'P-06', name: 'Gỏi xoài tai heo', category: 'Plowhorse', salesVolume: 420, popularityScore: 75, profitMargin: 25000, marginScore: 45, price: 85000 },
    { id: 'P-07', name: 'Tôm sốt hoàng kim', category: 'Star', salesVolume: 280, popularityScore: 80, profitMargin: 110000, marginScore: 80, price: 290000 },
    { id: 'P-08', name: 'Ốc hương trứng muối', category: 'Puzzle', salesVolume: 110, popularityScore: 42, profitMargin: 95000, marginScore: 75, price: 220000 }
  ];

  return { success: true, data: defaults };
};
