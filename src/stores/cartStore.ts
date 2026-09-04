import { create } from 'zustand';
import { OrderItem } from '../types/order.types';

interface CartState {
  tableId: string | null;
  tableName: string | null;
  cartItems: OrderItem[];
  discount: number; // percentage discount (e.g. 10 = 10%)
  tax: number; // VAT percentage (e.g. 10 = 10%)
  setTable: (tableId: string | null, tableName: string | null) => void;
  addToCart: (item: Omit<OrderItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  setDiscount: (discount: number) => void;
  setTax: (tax: number) => void;
  clearCart: () => void;
  loadCart: (tableId: string, tableName: string, items: OrderItem[], discount?: number, tax?: number) => void;
}

export const useCartStore = create<CartState>((set) => ({
  tableId: null,
  tableName: null,
  cartItems: [],
  discount: 0,
  tax: 10, // Default to 10% VAT
  setTable: (tableId, tableName) => set({ tableId, tableName }),
  addToCart: (item) => set((state) => {
    const existingIndex = state.cartItems.findIndex((ci) => ci.id === item.id);
    const addedQty = item.quantity || 1;
    if (existingIndex > -1) {
      const newItems = [...state.cartItems];
      newItems[existingIndex].quantity += addedQty;
      return { cartItems: newItems };
    }
    return { cartItems: [...state.cartItems, { ...item, quantity: addedQty }] };
  }),
  updateQuantity: (itemId, quantity) => set((state) => {
    if (quantity <= 0) {
      return { cartItems: state.cartItems.filter((ci) => ci.id !== itemId) };
    }
    return {
      cartItems: state.cartItems.map((ci) =>
        ci.id === itemId ? { ...ci, quantity } : ci
      )
    };
  }),
  removeFromCart: (itemId) => set((state) => ({
    cartItems: state.cartItems.filter((ci) => ci.id !== itemId)
  })),
  setDiscount: (discount) => set({ discount }),
  setTax: (tax) => set({ tax }),
  clearCart: () => set({ tableId: null, tableName: null, cartItems: [], discount: 0 }),
  loadCart: (tableId, tableName, items, discount = 0, tax = 10) => set({
    tableId,
    tableName,
    cartItems: items,
    discount,
    tax
  })
}));
