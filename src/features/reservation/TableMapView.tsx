import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/queries/useOrders';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useCartStore } from '../../stores/cartStore';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  Grid,
  Layers,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  CreditCard,
  PlusCircle,
  UserCheck
} from 'lucide-react';

export const TableMapView: React.FC = () => {
  const navigate = useNavigate();
  const { tables, orders, createOrder, checkoutOrder, refetchTables, refetchOrders } = useOrders();
  const loadCart = useCartStore((s) => s.loadCart);
  
  const [selectedZone, setSelectedZone] = useState<'ALL' | 'A' | 'VIP' | 'Terrace'>('ALL');
  const [activeTableDetail, setActiveTableDetail] = useState<any>(null);

  // Subscribe to real-time websocket channel updates
  useWebSocket('/topic/kds-updates', () => {
    refetchTables();
    refetchOrders();
  });

  const zones = ['ALL', 'A', 'VIP', 'Terrace'] as const;

  // Filter tables by selected zone
  const filteredTables = selectedZone === 'ALL'
    ? tables
    : tables.filter((t) => t.zone === selectedZone);

  const getTableOrder = (table: any) => {
    if (!table.currentOrderId) return null;
    return orders.find((o) => o.id === table.currentOrderId && o.status !== 'completed');
  };

  const handleTableClick = (table: any) => {
    const order = getTableOrder(table);
    setActiveTableDetail({ table, order });
  };

  const handleCreateNewOrder = async (table: any) => {
    try {
      await createOrder({
        tableId: table.id,
        tableName: table.name,
        items: [],
        discount: 0,
        tax: 10
      });
      // Redirect to POS order page
      loadCart(table.id, table.name, [], 0, 10);
      navigate('/pos');
    } catch (err) {
      alert('Không thể tạo hóa đơn mới');
    }
  };

  const handleOpenPOS = (table: any, order: any) => {
    // Load active order details into Zustand cart
    loadCart(table.id, table.name, order.items, order.discount, 10);
    navigate('/pos');
  };

  const handlePayOrder = async (table: any, order: any) => {
    if (confirm(`Xác nhận thanh toán cho ${table.name}?\nTổng tiền: ${formatCurrency(order.total)}`)) {
      try {
        await checkoutOrder(order.id);
        setActiveTableDetail(null);
        alert('Thanh toán thành công. Bàn đã được dọn trống.');
      } catch (err) {
        alert('Lỗi thanh toán');
      }
    }
  };

  // Helper count status
  const emptyCount = tables.filter((t) => t.status === 'empty').length;
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const reservedCount = tables.filter((t) => t.status === 'reserved').length;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Sơ Đồ Bàn Realtime</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Theo dõi trạng thái phục vụ và thanh toán các bàn ăn trực quan.</p>
        </div>

        {/* Legend status indicators */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}></span>
            <span>Trống ({emptyCount})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'rgba(30, 144, 255, 0.2)', border: '1.5px solid var(--accent-color)', boxShadow: '0 0 10px rgba(30,144,255,0.4)' }}></span>
            <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Có khách ({occupiedCount})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'rgba(255, 152, 0, 0.2)', border: '1.5px solid #ff9800' }}></span>
            <span style={{ color: '#ff9800', fontWeight: 600 }}>Đặt trước ({reservedCount})</span>
          </div>
        </div>
      </div>

      {/* Zone Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {zones.map((zone) => (
          <button
            key={zone}
            onClick={() => setSelectedZone(zone)}
            className="btn-secondary"
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              background: selectedZone === zone ? 'var(--accent-color)' : 'var(--bg-secondary)',
              color: selectedZone === zone ? '#fff' : 'var(--text-primary)',
              borderColor: selectedZone === zone ? 'var(--accent-color)' : 'var(--border-color)'
            }}
          >
            {zone === 'ALL' ? 'Tất cả khu vực' : `Khu ${zone}`}
          </button>
        ))}
      </div>

      {/* Main Table Grid and Sidebar details panel */}
      <div style={{ display: 'grid', gridTemplateColumns: activeTableDetail ? '3fr 1.5fr' : '1fr', gap: '1.5rem', transition: 'all 0.3s ease' }}>
        {/* Table layout grid */}
        <div className="glass-card" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '1.5rem',
          padding: '2rem',
          minHeight: '400px',
          alignContent: 'start'
        }}>
          {filteredTables.map((table) => {
            const order = getTableOrder(table);
            const isOccupied = table.status === 'occupied';
            const isReserved = table.status === 'reserved';

            // styling variables
            const cardBg = isOccupied ? 'rgba(30, 144, 255, 0.08)' : isReserved ? 'rgba(255, 152, 0, 0.08)' : 'rgba(255,255,255,0.02)';
            const borderCol = isOccupied ? 'var(--accent-color)' : isReserved ? '#ff9800' : 'rgba(255,255,255,0.08)';
            const glowShadow = isOccupied ? '0 0 15px rgba(30, 144, 255, 0.2)' : 'none';

            return (
              <div
                key={table.id}
                onClick={() => handleTableClick(table)}
                style={{
                  background: cardBg,
                  border: `1.5px solid ${borderCol}`,
                  boxShadow: glowShadow,
                  borderRadius: '16px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  height: '140px',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  if (!isOccupied && !isReserved) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = borderCol;
                }}
              >
                {/* Zone Label indicator */}
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  fontWeight: 700
                }}>
                  {table.zone}
                </span>

                <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, color: '#fff' }}>
                  {table.name}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Sức chứa: {table.capacity} chỗ
                </span>

                {isOccupied && order && (
                  <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 600 }}>
                      {formatCurrency(order.total)}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} món ăn
                    </span>
                  </div>
                )}

                {isReserved && (
                  <span style={{ fontSize: '0.75rem', color: '#ff9800', fontWeight: 600 }}>
                    Đã Đặt Trước
                  </span>
                )}

                {!isOccupied && !isReserved && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Trống
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Detail Panel */}
        {activeTableDetail && (
          <div className="glass-card" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            animation: 'fadeIn 0.2s ease-out',
            height: 'fit-content'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Chi tiết: {activeTableDetail.table.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Khu vực: {activeTableDetail.table.zone} | Sức chứa: {activeTableDetail.table.capacity} khách
                </span>
              </div>
              <button
                onClick={() => setActiveTableDetail(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
              >
                ✕
              </button>
            </div>

            {/* If table is occupied */}
            {activeTableDetail.table.status === 'occupied' && activeTableDetail.order ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '10px',
                  padding: '1rem',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Mã hóa đơn:</span>
                    <span style={{ fontWeight: 600 }}>{activeTableDetail.order.id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Trạng thái bếp:</span>
                    <span className="badge badge-warning" style={{ textTransform: 'capitalize' }}>
                      {activeTableDetail.order.status}
                    </span>
                  </div>
                </div>

                {/* Items Summary list */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Món đã gọi:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {activeTableDetail.order.items.map((item: any) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>{item.name} <span style={{ color: 'var(--text-muted)' }}>x{item.quantity}</span></span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(activeTableDetail.order.subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <span>Thuế VAT:</span>
                    <span>{formatCurrency(activeTableDetail.order.tax)}</span>
                  </div>
                  {activeTableDetail.order.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', color: '#ff4d4d' }}>
                      <span>Giảm giá:</span>
                      <span>-{formatCurrency(activeTableDetail.order.discount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--accent-color)' }}>
                    <span>Tổng hóa đơn:</span>
                    <span>{formatCurrency(activeTableDetail.order.total)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
                    onClick={() => handleOpenPOS(activeTableDetail.table, activeTableDetail.order)}
                  >
                    Thêm Món
                  </button>
                  <button
                    className="btn-primary"
                    style={{ flex: 1.5, padding: '0.6rem', fontSize: '0.85rem', justifyContent: 'center' }}
                    onClick={() => handlePayOrder(activeTableDetail.table, activeTableDetail.order)}
                  >
                    <CreditCard size={16} />
                    Thanh Toán
                  </button>
                </div>
              </div>
            ) : activeTableDetail.table.status === 'reserved' ? (
              // If table is reserved
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.9rem' }}>Bàn này đang được giữ chỗ trước của khách hàng.</p>
                <button
                  className="btn-primary"
                  style={{ justifyContent: 'center' }}
                  onClick={() => handleCreateNewOrder(activeTableDetail.table)}
                >
                  <UserCheck size={16} />
                  Nhận Bàn Khách Vào
                </button>
              </div>
            ) : (
              // If table is empty
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Bàn đang trống và sẵn sàng phục vụ.</p>
                <button
                  className="btn-primary"
                  style={{ justifyContent: 'center' }}
                  onClick={() => handleCreateNewOrder(activeTableDetail.table)}
                >
                  <PlusCircle size={16} />
                  Mở Hóa Đơn Mới
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
