import React, { useEffect, useState, useMemo } from 'react';
import { useBranchStore } from '../../stores/branchStore';
import { useKdsWebSocket, KdsOrderEvent } from '../../hooks/useKdsWebSocket';
import { fetchOrdersApi, updateOrderStatusApi } from '../../api/order.api';
import { Order } from '../../types/order.types';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Flame,
  AlertCircle,
  RefreshCw,
  BellRing,
  Utensils,
  Filter,
} from 'lucide-react';

export const KdsPage: React.FC = () => {
  const { currentBranchId } = useBranchStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [lastNotification, setLastNotification] = useState<string | null>(null);

  // Load active orders for current branch
  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchOrdersApi(currentBranchId);
      if (res.success) {
        // Only keep active orders (preparing, unpaid, serving)
        const active = res.data.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
        setOrders(active);
      }
    } catch (err) {
      console.error('Error loading KDS orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentBranchId]);

  // STOMP WebSocket Hook for real-time KDS updates
  const { isConnected, topic, notifyKitchenStatus } = useKdsWebSocket(
    currentBranchId,
    (event: KdsOrderEvent) => {
      console.log('[KDS UI] Realtime Event Triggered:', event);
      setLastNotification(`Cập nhật đơn: ${event.orderId || 'Mới'} (${new Date().toLocaleTimeString()})`);
      loadOrders();
    }
  );

  // Status transition handlers
  const handleUpdateStatus = async (orderId: string, nextStatus: 'pending' | 'preparing' | 'served' | 'completed') => {
    try {
      const res = await updateOrderStatusApi(orderId, nextStatus);
      if (res.success) {
        notifyKitchenStatus(orderId, nextStatus);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Elapsed time helper
  const getElapsedMinutes = (dateStr: string) => {
    const start = new Date(dateStr).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((now - start) / 60000));
  };

  const filteredOrders = useMemo(() => {
    if (filterStatus === 'all') return orders;
    return orders.filter((o) => o.status === filterStatus);
  }, [orders, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      preparing: orders.filter((o) => o.status === 'preparing' || o.status === 'pending').length,
      serving: orders.filter((o) => o.status === 'serving' || o.status === 'served').length,
    };
  }, [orders]);

  return (
    <div style={{ padding: '1.5rem', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-secondary)',
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ff9800, #ff5722)',
            padding: '0.75rem',
            borderRadius: '12px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(255, 87, 34, 0.3)'
          }}>
            <ChefHat size={28} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              KDS - Màn Hình Bếp Trưởng & Điều Phối
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.3rem', fontSize: '0.85rem' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: isConnected ? '#4caf50' : '#ff9800',
                fontWeight: 600,
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isConnected ? '#4caf50' : '#ff9800',
                  animation: 'pulse 1.5s infinite'
                }} />
                {isConnected ? 'STOMP WebSocket Online' : 'Connecting WebSocket...'}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>• Topic: <code style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: '4px' }}>{topic}</code></span>
            </div>
          </div>
        </div>

        {/* Action & Stats pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            background: 'rgba(30, 144, 255, 0.08)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '0.4rem 0.8rem',
            gap: '1rem',
            fontSize: '0.85rem'
          }}>
            <span>Đang chờ/nấu: <strong style={{ color: '#ff9800' }}>{stats.preparing}</strong></span>
            <span>Sẵn sàng phục vụ: <strong style={{ color: '#4caf50' }}>{stats.serving}</strong></span>
          </div>

          <button
            onClick={loadOrders}
            className="btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Realtime Alert Banner if any */}
      {lastNotification && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          background: 'rgba(30, 144, 255, 0.1)',
          border: '1px solid rgba(30, 144, 255, 0.3)',
          borderRadius: '10px',
          padding: '0.6rem 1rem',
          color: 'var(--accent-color)',
          fontSize: '0.85rem',
        }}>
          <BellRing size={16} />
          <span>{lastNotification}</span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
        {[
          { key: 'all', label: 'Tất Cả Đơn' },
          { key: 'preparing', label: 'Đang Nấu (Cooking)' },
          { key: 'pending', label: 'Chờ Tiếp Nhận (New)' },
          { key: 'serving', label: 'Chờ Ra Món (Ready)' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: filterStatus === tab.key ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
              background: filterStatus === tab.key ? 'var(--accent-color)' : 'var(--bg-secondary)',
              color: filterStatus === tab.key ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Kitchen Ticket Grid */}
      {filteredOrders.length === 0 ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-secondary)',
          borderRadius: '16px',
          padding: '4rem 2rem',
          border: '1px solid var(--border-color)',
          textAlign: 'center',
        }}>
          <Utensils size={48} style={{ color: 'var(--text-secondary)', opacity: 0.5, marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Không có món nào đang chờ chế biến</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Khi nhân viên phục vụ tạo đơn từ POS, thẻ món ăn sẽ tự động nhảy vào đây theo thời gian thực.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}>
          {filteredOrders.map((order) => {
            const elapsed = getElapsedMinutes(order.createdAt);
            const isUrgent = elapsed >= 20;
            const isMedium = elapsed >= 10 && elapsed < 20;

            return (
              <div
                key={order.id}
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '16px',
                  border: isUrgent
                    ? '2px solid #ff4d4d'
                    : isMedium
                    ? '2px solid #ff9800'
                    : '1px solid var(--border-color)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isUrgent
                    ? '0 8px 24px rgba(255, 77, 77, 0.15)'
                    : '0 4px 16px rgba(0,0,0,0.04)',
                }}
              >
                {/* Ticket Header */}
                <div style={{
                  padding: '0.9rem 1.25rem',
                  background: isUrgent
                    ? 'rgba(255, 77, 77, 0.15)'
                    : isMedium
                    ? 'rgba(255, 152, 0, 0.12)'
                    : 'rgba(30, 144, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-color)',
                }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                      {order.tableName}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Mã đơn: #{order.id}
                    </span>
                  </div>

                  {/* Timer Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '8px',
                    background: isUrgent ? '#ff4d4d' : isMedium ? '#ff9800' : '#333',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}>
                    <Clock size={14} />
                    <span>{elapsed} phút</span>
                  </div>
                </div>

                {/* Items List */}
                <div style={{ padding: '1rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        paddingBottom: '0.6rem',
                        borderBottom: idx !== order.items.length - 1 ? '1px dashed var(--border-color)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                        <span style={{
                          background: 'var(--accent-color)',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          minWidth: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {item.quantity}x
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                            {item.name}
                          </div>
                          {item.note && (
                            <div style={{ fontSize: '0.75rem', color: '#ff9800', fontStyle: 'italic', marginTop: '2px' }}>
                              * Ghi chú: {item.note}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions Footer */}
                <div style={{
                  padding: '0.85rem 1.25rem',
                  borderTop: '1px solid var(--border-color)',
                  background: 'rgba(0,0,0,0.02)',
                  display: 'flex',
                  gap: '0.5rem',
                }}>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'preparing')}
                      style={{
                        flex: 1,
                        padding: '0.65rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#ff9800',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <Flame size={16} /> Bắt đầu nấu
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'served')}
                      style={{
                        flex: 1,
                        padding: '0.65rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#4caf50',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <CheckCircle2 size={16} /> Báo nấu xong (Sẵn sàng)
                    </button>
                  )}

                  {order.status === 'served' && (
                    <div style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      color: '#4caf50',
                      fontWeight: 600,
                      padding: '0.4rem',
                    }}>
                      ✓ Đã chuyển bàn phục vụ
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
