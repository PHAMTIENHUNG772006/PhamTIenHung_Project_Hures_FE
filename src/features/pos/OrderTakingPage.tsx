import React, { useState } from 'react';
import { useOrders } from '../../hooks/queries/useOrders';
import { useCartStore } from '../../stores/cartStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { SplitMergeModal } from './SplitMergeModal';
import { orderSchema } from '../../schemas/order.schema';
import { useBranch } from '../../hooks/useBranch';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Send,
  CreditCard,
  Columns,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'Seafood' | 'Drinks' | 'Appetizers';
  description: string;
  emoji: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'P-01', name: 'Lẩu Thái Hải Sản', price: 350000, category: 'Seafood', description: 'Nước lẩu chua cay đậm vị hải sản tươi ngon, ăn kèm rau nấm.', emoji: '🍲' },
  { id: 'P-02', name: 'Nghêu hấp sả', price: 95000, category: 'Appetizers', description: 'Nghêu biển ngọt nước hấp cùng sả gừng tươi thơm nồng.', emoji: '🐚' },
  { id: 'P-03', name: 'Cua sốt ớt Singapore', price: 850000, category: 'Seafood', description: 'Cua thịt chắc ngọt sốt tương cay nồng vị Singapore truyền thống.', emoji: '🦀' },
  { id: 'P-04', name: 'Vang đỏ Cabernet', price: 1200000, category: 'Drinks', description: 'Vang đỏ thượng hạng nhập khẩu từ Pháp tròn vị chát dịu.', emoji: '🍷' },
  { id: 'P-05', name: 'Bia Heineken', price: 25000, category: 'Drinks', description: 'Bia lon Heineken mát lạnh sảng khoái.', emoji: '🍺' },
  { id: 'P-06', name: 'Gỏi xoài tai heo', price: 85000, category: 'Appetizers', description: 'Tai heo giòn giòn trộn gỏi xoài xanh chua ngọt vừa vị.', emoji: '🥗' },
  { id: 'P-07', name: 'Tôm sốt hoàng kim', price: 290000, category: 'Seafood', description: 'Tôm sú chiên giòn quyện sốt bơ lòng đỏ trứng muối béo ngậy.', emoji: '🍤' },
  { id: 'P-08', name: 'Ốc hương trứng muối', price: 220000, category: 'Seafood', description: 'Ốc hương dai giòn xào bơ tỏi sốt trứng muối thơm ngậy.', emoji: '🐚' }
];

export const OrderTakingPage: React.FC = () => {
  const { currentBranchId } = useBranch();
  const { tables, orders, createOrder, updateOrderItems, checkoutOrder } = useOrders();
  
  // Zustand cart states
  const {
    tableId,
    tableName,
    cartItems,
    discount,
    tax,
    setTable,
    addToCart,
    updateQuantity,
    removeFromCart,
    setDiscount,
    clearCart
  } = useCartStore();

  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'Seafood' | 'Drinks' | 'Appetizers'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSplitMerge, setShowSplitMerge] = useState(false);

  // Find active order for current table to check if we are creating or updating
  const activeTableOrder = orders.find(
    (o) => o.tableId === tableId && o.status !== 'completed' && o.status !== 'cancelled'
  );

  const handleSelectTable = (tid: string) => {
    if (!tid) {
      setTable(null, null);
      clearCart();
      return;
    }
    const match = tables.find((t) => t.id === tid);
    if (match) {
      setTable(match.id, match.name);
      
      // If table is occupied, load existing order items into cart
      const existingOrder = orders.find((o) => o.tableId === tid && o.status !== 'completed' && o.status !== 'cancelled');
      if (existingOrder) {
        useCartStore.getState().loadCart(
          match.id,
          match.name,
          existingOrder.items,
          existingOrder.discount,
          10
        );
      } else {
        // Empty table, clear cart
        useCartStore.getState().loadCart(match.id, match.name, [], 0, 10);
      }
    }
  };

  const filteredMenu = MENU_ITEMS.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = Math.round((subtotal * tax) / 100);
  const total = subtotal + taxAmount - discount;

  const handleSendToKitchen = async () => {
    if (!tableId || !tableName) {
      alert('Vui lòng chọn bàn ăn trước khi ghi món!');
      return;
    }

    const payload = {
      tableId,
      tableName,
      items: cartItems,
      discount,
      tax,
      branchId: currentBranchId
    };

    // Zod validation
    const result = orderSchema.safeParse(payload);
    if (!result.success) {
      alert(result.error.errors[0].message);
      return;
    }

    try {
      if (activeTableOrder) {
        // Update existing order
        await updateOrderItems({ orderId: activeTableOrder.id, items: cartItems });
        alert(`Đã gửi cập nhật thực đơn bàn ${tableName} tới nhà bếp thành công!`);
      } else {
        // Create new order
        await createOrder(payload);
        alert(`Đã tạo hóa đơn và gửi order bàn ${tableName} tới nhà bếp!`);
      }
    } catch (err) {
      alert('Gửi order thất bại');
    }
  };

  const handlePayNow = async () => {
    if (!tableId || !tableName || !activeTableOrder) {
      alert('Chưa có hóa đơn hoạt động để thanh toán.');
      return;
    }

    if (confirm(`Xác nhận thanh toán hóa đơn bàn ${tableName}?\nTổng số tiền: ${formatCurrency(total)}`)) {
      try {
        // Update first to ensure latest items count in report
        await updateOrderItems({ orderId: activeTableOrder.id, items: cartItems });
        await checkoutOrder(activeTableOrder.id);
        clearCart();
        alert('Đã hoàn tất thanh toán hóa đơn. Giải phóng bàn ăn.');
      } catch (err) {
        alert('Lỗi thanh toán hóa đơn');
      }
    }
  };

  return (
    <div className="page-container" style={{
      display: 'grid',
      gridTemplateColumns: '2.5fr 1.5fr',
      gap: '1.5rem',
      height: 'calc(100vh - 110px)',
      overflow: 'hidden'
    }}>
      {/* LEFT: Menu selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflow: 'hidden' }}>
        
        {/* Top Controls: Pick table & search menu */}
        <div className="glass-card" style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 2fr',
          gap: '1rem',
          padding: '1rem'
        }}>
          <div>
            <label className="form-label" style={{ marginBottom: '0.25rem' }}>Chọn Bàn Phục Vụ</label>
            <select
              className="form-input"
              value={tableId || ''}
              onChange={(e) => handleSelectTable(e.target.value)}
              style={{ padding: '0.6rem 0.8rem' }}
            >
              <option value="">-- Chọn bàn ăn --</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.status === 'occupied' ? 'Có Khách' : t.status === 'reserved' ? 'Đã Đặt trước' : 'Trống'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ marginBottom: '0.25rem' }}>Tìm Kiếm Món Ăn</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Tìm món hải sản, thức uống..."
                className="form-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '0.6rem 0.8rem 0.6rem 2.2rem' }}
              />
            </div>
          </div>
        </div>

        {/* Category filtering */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['ALL', 'Seafood', 'Appetizers', 'Drinks'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="btn-secondary"
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                background: selectedCategory === cat ? 'var(--accent-color)' : 'var(--bg-secondary)',
                color: selectedCategory === cat ? '#fff' : 'var(--text-primary)',
                borderColor: selectedCategory === cat ? 'var(--accent-color)' : 'var(--border-color)'
              }}
            >
              {cat === 'ALL' ? 'Tất Cả' : cat === 'Seafood' ? 'Hải Sản' : cat === 'Drinks' ? 'Đồ Uống' : 'Khai Vị'}
            </button>
          ))}
        </div>

        {/* Menu Items Catalog Scroll grid */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.25rem' }}>
          <div className="grid-pos-menu">
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  padding: '1rem',
                  borderRadius: '16px'
                }}
              >
                <div style={{
                  fontSize: '2.5rem',
                  display: 'flex',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '12px',
                  padding: '1rem 0'
                }}>
                  {item.emoji}
                </div>
                <h4 style={{ fontSize: '0.95rem', margin: 0, fontWeight: 700, color: '#fff' }}>
                  {item.name}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', height: '36px', overflow: 'hidden' }}>
                  {item.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent-color)', fontSize: '0.95rem' }}>
                    {formatCurrency(item.price)}
                  </span>
                  <button
                    disabled={!tableId}
                    onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
                    style={{
                      background: tableId ? 'var(--accent-color)' : 'var(--bg-primary)',
                      color: tableId ? '#fff' : 'var(--text-muted)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.4rem',
                      cursor: tableId ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={tableId ? 'Thêm vào order' : 'Vui lòng chọn bàn ăn trước'}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Active Cart checkout summary */}
      <div className="glass-card" style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '1.5rem',
        overflow: 'hidden'
      }}>
        {/* Table info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '1rem',
          marginBottom: '1rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>
              {tableName ? `Order: ${tableName}` : 'Chưa Chọn Bàn'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {activeTableOrder ? `Hóa đơn gốc: ${activeTableOrder.id}` : 'Đơn hàng nháp'}
            </span>
          </div>
          {tableId && activeTableOrder && (
            <button
              onClick={() => setShowSplitMerge(true)}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem' }}
            >
              <Columns size={12} />
              <span>Tách/Gộp</span>
            </button>
          )}
        </div>

        {/* Cart Item Roster list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingRight: '0.25rem' }}>
          {cartItems.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '80%',
              color: 'var(--text-muted)',
              gap: '0.5rem'
            }}>
              <ShoppingCart size={32} />
              <span style={{ fontSize: '0.85rem' }}>Chưa chọn món nào vào giỏ.</span>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>{item.name}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 600 }}>
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                  
                  {/* Qty controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '0.2rem', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '0.85rem', width: '24px', textAlign: 'center', fontWeight: 'bold' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '0.2rem', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Calculations & Action Footer */}
        {cartItems.length > 0 && (
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '1rem',
            marginTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tạm tính:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            {/* Discount application input */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Chiết khấu giảm (VND):</span>
              <input
                type="number"
                min={0}
                max={subtotal}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                style={{
                  width: '90px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '0.2rem 0.4rem',
                  color: 'var(--text-primary)',
                  textAlign: 'right',
                  fontSize: '0.8rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Thuế VAT ({tax}%):</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--accent-color)',
              margin: '0.5rem 0',
              borderTop: '1px dotted rgba(255,255,255,0.1)',
              paddingTop: '0.5rem'
            }}>
              <span>Cần thanh toán:</span>
              <span>{formatCurrency(total)}</span>
            </div>

            {/* Submitting buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                onClick={handleSendToKitchen}
                className="btn-secondary"
                style={{ flex: 1, padding: '0.65rem', justifyContent: 'center', fontSize: '0.85rem' }}
              >
                <Send size={14} />
                <span>Gửi Bếp</span>
              </button>
              {activeTableOrder && (
                <button
                  onClick={handlePayNow}
                  className="btn-primary"
                  style={{ flex: 1.5, padding: '0.65rem', justifyContent: 'center', fontSize: '0.85rem' }}
                >
                  <CreditCard size={14} />
                  <span>Thanh Toán</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tách/Gộp Modal */}
      {showSplitMerge && tableId && (
        <SplitMergeModal
          currentTableId={tableId}
          currentTableName={tableName || 'Bàn Ăn'}
          onClose={() => setShowSplitMerge(false)}
        />
      )}
    </div>
  );
};
