import React, { useState, useEffect } from 'react';
import { useOrders } from '../../hooks/queries/useOrders';
import { formatCurrency } from '../../utils/formatCurrency';
import { Columns, GitMerge, AlertCircle, X } from 'lucide-react';

interface SplitMergeModalProps {
  currentTableId: string;
  currentTableName: string;
  onClose: () => void;
}

export const SplitMergeModal: React.FC<SplitMergeModalProps> = ({
  currentTableId,
  currentTableName,
  onClose
}) => {
  const { tables, orders, splitOrder, mergeTables } = useOrders();
  const [activeTab, setActiveTab] = useState<'split' | 'merge'>('split');
  const [targetTableId, setTargetTableId] = useState('');
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  // Find current order details
  const currentOrder = orders.find((o) => o.tableId === currentTableId && o.status !== 'completed');
  
  // States for splitting
  const [splitQuantities, setSplitQuantities] = useState<Record<string, number>>({});

  // Filters
  const emptyTables = tables.filter((t) => t.status === 'empty');
  const occupiedTablesExceptSelf = tables.filter((t) => t.status === 'occupied' && t.id !== currentTableId);

  const handleQtyChange = (itemId: string, maxQty: number, value: number) => {
    const val = Math.min(Math.max(0, value), maxQty);
    setSplitQuantities((prev) => ({
      ...prev,
      [itemId]: val
    }));
  };

  const handleExecuteSplit = async () => {
    if (!currentOrder) return;
    if (!targetTableId) {
      alert('Vui lòng chọn bàn đích để chuyển sang');
      return;
    }

    // Build list of items to split
    const itemsToSplit = currentOrder.items
      .map((item) => {
        const qty = splitQuantities[item.id] || 0;
        if (qty > 0) {
          return { ...item, quantity: qty };
        }
        return null;
      })
      .filter((i): i is any => i !== null);

    if (itemsToSplit.length === 0) {
      alert('Vui lòng chọn ít nhất 1 món ăn với số lượng lớn hơn 0 để tách');
      return;
    }

    const targetTableName = tables.find((t) => t.id === targetTableId)?.name || 'Bàn Đích';

    try {
      await splitOrder({
        sourceOrderId: currentOrder.id,
        itemsToSplit,
        targetTableId,
        targetTableName
      });
      alert(`Đã tách món thành công từ ${currentTableName} sang ${targetTableName}`);
      onClose();
    } catch (err) {
      alert('Tách hóa đơn thất bại');
    }
  };

  const handleExecuteMerge = async () => {
    if (!targetTableId) {
      alert('Vui lòng chọn bàn đích để gộp vào');
      return;
    }

    const targetTableName = tables.find((t) => t.id === targetTableId)?.name || 'Bàn Đích';

    if (confirm(`Bạn có chắc chắn muốn gộp toàn bộ hóa đơn của ${currentTableName} vào ${targetTableName}?`)) {
      try {
        await mergeTables({
          sourceTableId: currentTableId,
          targetTableId
        });
        alert(`Gộp bàn thành công từ ${currentTableName} vào ${targetTableName}`);
        onClose();
      } catch (err) {
        alert('Gộp bàn thất bại');
      }
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        padding: '1.25rem'
      }}
    >
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '650px',
        animation: 'scaleIn 0.2s ease-out',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxHeight: '90vh',
        overflow: 'hidden',
        padding: '1.75rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.3rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {activeTab === 'split' ? <Columns size={20} style={{ color: 'var(--accent-color)' }} /> : <GitMerge size={20} style={{ color: 'var(--accent-color)' }} />}
            <span>Xử Lý Bàn Ăn: {currentTableName}</span>
          </h3>
          <button
            onClick={onClose}
            type="button"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ff4d4d';
              e.currentTarget.style.borderColor = 'rgba(255, 77, 77, 0.4)';
              e.currentTarget.style.background = 'rgba(255, 77, 77, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
            title="Đóng (ESC)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          gap: '1rem'
        }}>
          <button
            onClick={() => { setActiveTab('split'); setTargetTableId(''); }}
            style={{
              padding: '0.8rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'split' ? '2.5px solid var(--accent-color)' : 'none',
              color: activeTab === 'split' ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            Tách Hóa Đơn / Món
          </button>
          <button
            onClick={() => { setActiveTab('merge'); setTargetTableId(''); }}
            style={{
              padding: '0.8rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'merge' ? '2.5px solid var(--accent-color)' : 'none',
              color: activeTab === 'merge' ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            Gộp Bàn Khác
          </button>
        </div>

        {/* Dynamic content scroll area */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
          {!currentOrder ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem 1rem',
              color: 'var(--text-muted)',
              gap: '0.5rem'
            }}>
              <AlertCircle size={32} />
              <span>Bàn này hiện tại không có hóa đơn hoạt động để xử lý.</span>
            </div>
          ) : activeTab === 'split' ? (
            // SPLIT VIEW
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>1. Chọn món và số lượng cần tách khỏi hóa đơn:</label>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  {currentOrder.items.map((item) => (
                    <div key={item.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Giá: {formatCurrency(item.price)} | Tối đa: {item.quantity} phần
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="number"
                          className="form-input"
                          min={0}
                          max={item.quantity}
                          value={splitQuantities[item.id] || 0}
                          onChange={(e) => handleQtyChange(item.id, item.quantity, Number(e.target.value))}
                          style={{ width: '80px', textAlign: 'center', padding: '0.4rem' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">2. Chọn bàn trống nhận phần hóa đơn tách:</label>
                <select
                  className="form-input"
                  value={targetTableId}
                  onChange={(e) => setTargetTableId(e.target.value)}
                >
                  <option value="">-- Chọn bàn trống --</option>
                  {emptyTables.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} (Sức chứa: {t.capacity})</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            // MERGE VIEW
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Nhập toàn bộ hóa đơn từ bàn <strong>{currentTableName}</strong> gộp vào hóa đơn của bàn đích dưới đây:
              </p>
              <div>
                <label className="form-label">Chọn bàn cần gộp vào:</label>
                <select
                  className="form-input"
                  value={targetTableId}
                  onChange={(e) => setTargetTableId(e.target.value)}
                >
                  <option value="">-- Chọn bàn đang có khách để gộp --</option>
                  {occupiedTablesExceptSelf.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} (Hóa đơn hiện tại đang chờ)</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Actions buttons */}
        {currentOrder && (
          <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Hủy Bỏ
            </button>
            {activeTab === 'split' ? (
              <button className="btn-primary" style={{ flex: 1.5, justifyContent: 'center' }} onClick={handleExecuteSplit}>
                Xác Nhận Tách Bàn
              </button>
            ) : (
              <button className="btn-primary" style={{ flex: 1.5, justifyContent: 'center' }} onClick={handleExecuteMerge}>
                Xác Nhận Gộp Bàn
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
