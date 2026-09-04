export type UserRole = 
  | 'admin' | 'manager' | 'cashier' | 'kitchen' | 'chef' | 'waiter'
  | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'KITCHEN' | 'CHEF' | 'WAITER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId: string;
  refreshToken?: string;
}

export interface Branch {
  id: string | number;
  code?: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  managerName?: string;
  isActive?: boolean;
  status?: 'active' | 'inactive';
  openingHours?: string;
  totalTables?: number;
  createdAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

