export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled';
export type TableStatus = 'empty' | 'occupied' | 'reserved' | 'needs_cleaning';

export interface OrderItem {
  id: string; // product id
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

export interface Order {
  id: string;
  tableId: string;
  tableName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  branchId: string;
}

export interface Area {
  id: number | string;
  branchId?: number | string;
  name: string;
}

export interface Table {
  id: string;
  name: string;
  tableNumber?: string;
  status: TableStatus;
  capacity: number;
  areaId?: number | string;
  areaName?: string;
  zone?: string;
  currentOrderId?: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  bookingTime: string; // ISO string
  partySize: number;
  tableId?: string;
  tableName?: string;
  status: 'confirmed' | 'seated' | 'cancelled' | 'pending';
  notes?: string;
  branchId: string;
}
