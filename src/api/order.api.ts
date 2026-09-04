import { ApiResponse } from '../types/api.types';
import { Order, Table, OrderItem } from '../types/order.types';

// Seed initial tables if not present
const getMockTables = (branchId: string): Table[] => {
  const key = `mock_tables_${branchId}`;
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);

  const defaults: Table[] = [
    { id: 'T-01', name: 'Bàn A1', status: 'empty', capacity: 4, zone: 'A' },
    { id: 'T-02', name: 'Bàn A2', status: 'occupied', capacity: 4, zone: 'A', currentOrderId: 'ORD-001' },
    { id: 'T-03', name: 'Bàn A3', status: 'empty', capacity: 6, zone: 'A' },
    { id: 'T-04', name: 'Bàn A4', status: 'empty', capacity: 2, zone: 'A' },
    { id: 'T-05', name: 'Bàn VIP 1', status: 'empty', capacity: 8, zone: 'VIP' },
    { id: 'T-06', name: 'Bàn VIP 2', status: 'occupied', capacity: 10, zone: 'VIP', currentOrderId: 'ORD-002' },
    { id: 'T-07', name: 'Bàn Terrace 1', status: 'empty', capacity: 4, zone: 'Terrace' },
    { id: 'T-08', name: 'Bàn Terrace 2', status: 'reserved', capacity: 4, zone: 'Terrace' }
  ];
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
};

const saveTables = (branchId: string, tables: Table[]) => {
  localStorage.setItem(`mock_tables_${branchId}`, JSON.stringify(tables));
};

const getMockOrders = (branchId: string): Order[] => {
  const key = `mock_orders_${branchId}`;
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);

  const defaults: Order[] = [
    {
      id: 'ORD-001',
      tableId: 'T-02',
      tableName: 'Bàn A2',
      items: [
        { id: 'P-01', name: 'Lẩu Thái Hải Sản', price: 350000, quantity: 1 },
        { id: 'P-02', name: 'Nghêu hấp sả', price: 95000, quantity: 2 },
        { id: 'P-05', name: 'Bia Heineken', price: 25000, quantity: 6 }
      ],
      subtotal: 540000,
      tax: 54000,
      discount: 0,
      total: 594000,
      status: 'preparing',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      branchId
    },
    {
      id: 'ORD-002',
      tableId: 'T-06',
      tableName: 'Bàn VIP 2',
      items: [
        { id: 'P-03', name: 'Cua sốt ớt Singapore', price: 850000, quantity: 1 },
        { id: 'P-04', name: 'Vang đỏ Cabernet', price: 1200000, quantity: 1 }
      ],
      subtotal: 2050000,
      tax: 205000,
      discount: 200000,
      total: 2055000,
      status: 'pending',
      createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      branchId
    }
  ];
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
};

const saveOrders = (branchId: string, orders: Order[]) => {
  localStorage.setItem(`mock_orders_${branchId}`, JSON.stringify(orders));
};

export const fetchTablesApi = async (branchId: string): Promise<ApiResponse<Table[]>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return { success: true, data: getMockTables(branchId) };
};

export const fetchOrdersApi = async (branchId: string): Promise<ApiResponse<Order[]>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return { success: true, data: getMockOrders(branchId) };
};

export const createOrderApi = async (
  branchId: string,
  tableId: string,
  tableName: string,
  items: OrderItem[],
  discount = 0,
  tax = 10
): Promise<ApiResponse<Order>> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const tables = getMockTables(branchId);
  const orders = getMockOrders(branchId);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = Math.round((subtotal * tax) / 100);
  const total = subtotal + taxAmount - discount;

  const newOrder: Order = {
    id: `ORD-${Math.floor(100 + Math.random() * 900)}`,
    tableId,
    tableName,
    items,
    subtotal,
    tax: taxAmount,
    discount,
    total,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branchId
  };

  orders.push(newOrder);
  saveOrders(branchId, orders);

  // Update table status to occupied
  const tableIdx = tables.findIndex((t) => t.id === tableId);
  if (tableIdx > -1) {
    tables[tableIdx].status = 'occupied';
    tables[tableIdx].currentOrderId = newOrder.id;
    saveTables(branchId, tables);
  }

  // Dispatch global custom event for real-time WebSocket mockup updates
  window.dispatchEvent(new CustomEvent('kds_order_update'));

  return { success: true, data: newOrder };
};

export const updateOrderItemsApi = async (
  branchId: string,
  orderId: string,
  items: OrderItem[]
): Promise<ApiResponse<Order>> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const orders = getMockOrders(branchId);
  const orderIdx = orders.findIndex((o) => o.id === orderId);

  if (orderIdx === -1) {
    return { success: false, data: null as any, message: 'Không tìm thấy hóa đơn' };
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = Math.round((subtotal * 10) / 100);
  const total = subtotal + taxAmount - orders[orderIdx].discount;

  orders[orderIdx].items = items;
  orders[orderIdx].subtotal = subtotal;
  orders[orderIdx].tax = taxAmount;
  orders[orderIdx].total = total;
  orders[orderIdx].updatedAt = new Date().toISOString();

  saveOrders(branchId, orders);
  window.dispatchEvent(new CustomEvent('kds_order_update'));

  return { success: true, data: orders[orderIdx] };
};

export const updateOrderStatusApi = async (
  branchId: string,
  orderId: string,
  status: Order['status']
): Promise<ApiResponse<Order>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const orders = getMockOrders(branchId);
  const orderIdx = orders.findIndex((o) => o.id === orderId);
  if (orderIdx > -1) {
    orders[orderIdx].status = status;
    orders[orderIdx].updatedAt = new Date().toISOString();
    saveOrders(branchId, orders);
    window.dispatchEvent(new CustomEvent('kds_order_update'));
    return { success: true, data: orders[orderIdx] };
  }
  return { success: false, data: null as any, message: 'Hóa đơn không tồn tại' };
};

export const checkoutOrderApi = async (
  branchId: string,
  orderId: string
): Promise<ApiResponse<null>> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const tables = getMockTables(branchId);
  const orders = getMockOrders(branchId);

  const orderIdx = orders.findIndex((o) => o.id === orderId);
  if (orderIdx === -1) return { success: false, data: null, message: 'Hóa đơn không tồn tại' };

  const order = orders[orderIdx];
  orders[orderIdx].status = 'completed';
  orders[orderIdx].updatedAt = new Date().toISOString();
  saveOrders(branchId, orders);

  // Free up table
  const tableIdx = tables.findIndex((t) => t.id === order.tableId);
  if (tableIdx > -1) {
    tables[tableIdx].status = 'empty';
    tables[tableIdx].currentOrderId = undefined;
    saveTables(branchId, tables);
  }

  // Add order total to historical revenue report DB
  const historyKey = `revenue_history_${branchId}`;
  const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
  history.push({
    date: new Date().toLocaleDateString('vi-VN'),
    amount: order.total,
    itemsCount: order.items.reduce((sum, i) => sum + i.quantity, 0)
  });
  localStorage.setItem(historyKey, JSON.stringify(history));

  window.dispatchEvent(new CustomEvent('kds_order_update'));
  return { success: true, data: null };
};

// Split Table Order Logic
export const splitOrderApi = async (
  branchId: string,
  sourceOrderId: string,
  itemsToSplit: OrderItem[],
  targetTableId: string,
  targetTableName: string
): Promise<ApiResponse<Order>> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const tables = getMockTables(branchId);
  const orders = getMockOrders(branchId);

  const sourceOrderIdx = orders.findIndex((o) => o.id === sourceOrderId);
  if (sourceOrderIdx === -1) return { success: false, data: null as any, message: 'Không tìm thấy hóa đơn nguồn' };

  const sourceOrder = orders[sourceOrderIdx];

  // Adjust source items
  const adjustedSourceItems: OrderItem[] = [];
  sourceOrder.items.forEach((item) => {
    const splitItem = itemsToSplit.find((s) => s.id === item.id);
    if (splitItem) {
      const remainingQty = item.quantity - splitItem.quantity;
      if (remainingQty > 0) {
        adjustedSourceItems.push({ ...item, quantity: remainingQty });
      }
    } else {
      adjustedSourceItems.push(item);
    }
  });

  // Save adjusted source order
  sourceOrder.items = adjustedSourceItems;
  sourceOrder.subtotal = adjustedSourceItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  sourceOrder.tax = Math.round((sourceOrder.subtotal * 10) / 100);
  sourceOrder.total = sourceOrder.subtotal + sourceOrder.tax - sourceOrder.discount;
  sourceOrder.updatedAt = new Date().toISOString();

  // Create new order on target table
  const targetSubtotal = itemsToSplit.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const targetTax = Math.round((targetSubtotal * 10) / 100);
  const newTargetOrder: Order = {
    id: `ORD-${Math.floor(100 + Math.random() * 900)}`,
    tableId: targetTableId,
    tableName: targetTableName,
    items: itemsToSplit,
    subtotal: targetSubtotal,
    tax: targetTax,
    discount: 0,
    total: targetSubtotal + targetTax,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branchId
  };

  orders.push(newTargetOrder);
  saveOrders(branchId, orders);

  // Update target table to occupied
  const targetTableIdx = tables.findIndex((t) => t.id === targetTableId);
  if (targetTableIdx > -1) {
    tables[targetTableIdx].status = 'occupied';
    tables[targetTableIdx].currentOrderId = newTargetOrder.id;
    saveTables(branchId, tables);
  }

  // If source order items is empty, close the source order and empty the table
  if (adjustedSourceItems.length === 0) {
    sourceOrder.status = 'cancelled';
    const sourceTableIdx = tables.findIndex((t) => t.id === sourceOrder.tableId);
    if (sourceTableIdx > -1) {
      tables[sourceTableIdx].status = 'empty';
      tables[sourceTableIdx].currentOrderId = undefined;
      saveTables(branchId, tables);
    }
  }

  window.dispatchEvent(new CustomEvent('kds_order_update'));
  return { success: true, data: newTargetOrder };
};

// Merge Tables Logic
export const mergeTablesApi = async (
  branchId: string,
  sourceTableId: string,
  targetTableId: string
): Promise<ApiResponse<Order>> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const tables = getMockTables(branchId);
  const orders = getMockOrders(branchId);

  const sourceTable = tables.find((t) => t.id === sourceTableId);
  const targetTable = tables.find((t) => t.id === targetTableId);

  if (!sourceTable || !targetTable) {
    return { success: false, data: null as any, message: 'Bàn nguồn hoặc bàn đích không hợp lệ' };
  }

  const sourceOrderId = sourceTable.currentOrderId;
  const targetOrderId = targetTable.currentOrderId;

  if (!sourceOrderId) {
    return { success: false, data: null as any, message: 'Bàn nguồn không có hóa đơn để gộp' };
  }

  const sourceOrderIdx = orders.findIndex((o) => o.id === sourceOrderId);
  const sourceOrder = orders[sourceOrderIdx];

  if (targetOrderId) {
    // Merge source items into target order
    const targetOrderIdx = orders.findIndex((o) => o.id === targetOrderId);
    const targetOrder = orders[targetOrderIdx];

    const mergedItems = [...targetOrder.items];
    sourceOrder.items.forEach((sItem) => {
      const tItemIdx = mergedItems.findIndex((ti) => ti.id === sItem.id);
      if (tItemIdx > -1) {
        mergedItems[tItemIdx].quantity += sItem.quantity;
      } else {
        mergedItems.push(sItem);
      }
    });

    targetOrder.items = mergedItems;
    targetOrder.subtotal = mergedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    targetOrder.tax = Math.round((targetOrder.subtotal * 10) / 100);
    targetOrder.total = targetOrder.subtotal + targetOrder.tax - targetOrder.discount;
    targetOrder.updatedAt = new Date().toISOString();

    // Mark source order as cancelled and free up source table
    sourceOrder.status = 'cancelled';
    sourceTable.status = 'empty';
    sourceTable.currentOrderId = undefined;

    saveOrders(branchId, orders);
    saveTables(branchId, tables);
    window.dispatchEvent(new CustomEvent('kds_order_update'));

    return { success: true, data: targetOrder };
  } else {
    // If target table has no active order, simply move the order to the target table
    sourceOrder.tableId = targetTableId;
    sourceOrder.tableName = targetTable.name;
    sourceOrder.updatedAt = new Date().toISOString();

    targetTable.status = 'occupied';
    targetTable.currentOrderId = sourceOrderId;

    sourceTable.status = 'empty';
    sourceTable.currentOrderId = undefined;

    saveOrders(branchId, orders);
    saveTables(branchId, tables);
    window.dispatchEvent(new CustomEvent('kds_order_update'));

    return { success: true, data: sourceOrder };
  }
};
