import React, { useState } from 'react';
import { useInventory } from '../../hooks/queries/useInventory';
import { formatCurrency } from '../../utils/formatCurrency';
import { Search, AlertTriangle, CheckCircle, Package, ArrowUpRight } from 'lucide-react';

export const IngredientListPage: React.FC = () => {
  const { ingredients, isLoadingIngredients } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoadingIngredients) {
    return <div style={{ color: '#fff' }}>Đang tải danh mục nguyên vật liệu kho...</div>;
  }

  const filtered = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ing.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = ingredients.filter((ing) => ing.stock < ing.minStock).length;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Quản Lý Kho Nguyên Liệu</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Theo dõi số lượng tồn kho nguyên vật liệu thô và cảnh báo nhập hàng.</p>
        </div>

        {/* Warning Indicator */}
        {lowStockCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 77, 77, 0.15)',
            border: '1px solid rgba(255, 77, 77, 0.3)',
            borderRadius: '10px',
            padding: '0.6rem 1.2rem',
            color: '#ff8a8a',
            fontSize: '0.85rem',
            fontWeight: 600,
            animation: 'pulse 2s infinite'
          }}>
            <AlertTriangle size={16} />
            <span>Có {lowStockCount} nguyên liệu sắp hết hàng!</span>
          </div>
        )}
      </div>

      {/* Metric Summaries */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem'
      }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(0,188,212,0.1)', padding: '0.8rem', borderRadius: '12px', color: 'var(--accent-color)' }}>
            <Package size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Tổng Số Loại Vật Tư</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{ingredients.length} mặt hàng</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(76,175,80,0.1)', padding: '0.8rem', borderRadius: '12px', color: '#4caf50' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Tồn Kho An Toàn</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{ingredients.length - lowStockCount} mặt hàng</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(255, 77, 77, 0.1)', padding: '0.8rem', borderRadius: '12px', color: '#ff4d4d' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Cần Bổ Sung Ngay</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#ff4d4d' }}>{lowStockCount} mặt hàng</h3>
          </div>
        </div>
      </div>

      {/* Filter controls & Search */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
        <Search size={18} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Tìm nguyên liệu theo tên hoặc mã vật tư SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            width: '100%',
            fontFamily: 'inherit',
            fontSize: '0.95rem'
          }}
        />
      </div>

      {/* Table grid */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Tên Nguyên Liệu</th>
              <th>Mã SKU</th>
              <th>Đơn Vị Tính</th>
              <th>Tồn Kho Hiện Tại</th>
              <th>Ngưỡng Tối Thiểu</th>
              <th>Đơn Giá Trung Bình</th>
              <th>Tình Trạng</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ing) => {
              const isLowStock = ing.stock < ing.minStock;
              return (
                <tr key={ing.id} style={{ background: isLowStock ? 'rgba(255,77,77,0.02)' : 'transparent' }}>
                  <td>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{ing.name}</span>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.8rem', color: '#1e90ff' }}>{ing.sku}</code>
                  </td>
                  <td>{ing.unit}</td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: isLowStock ? '#ff4d4d' : '#fff',
                      fontSize: '1rem'
                    }}>
                      {ing.stock}
                    </span>
                  </td>
                  <td>{ing.minStock}</td>
                  <td>{formatCurrency(ing.pricePerUnit)}</td>
                  <td>
                    <span className={`badge ${isLowStock ? 'badge-danger' : 'badge-success'}`}>
                      {isLowStock ? 'Hết hàng / Cần Nhập' : 'Tồn Kho An Toàn'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
