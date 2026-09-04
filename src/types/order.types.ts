export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled';
export type TableStatus = 'empty' | 'occupied' | 'reserved';

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

export interface Table {
  id: string;
  name: string;
  status: TableStatus;
  capacity: number;
  zone: 'A' | 'B' | 'VIP' | 'Terrace';
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
