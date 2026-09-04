import React, { useState } from 'react';
import { useInventory } from '../../hooks/queries/useInventory';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateHelpers';
import { Plus, Search, Truck, FileText, CheckCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const StockImportPage: React.FC = () => {
  const { ingredients, stockImports, createImport, isLoadingImports } = useInventory();
  
  const [showModal, setShowModal] = useState(false);
  const [supplier, setSupplier] = useState('');
  
  // Selected items to import
  const [importItems, setImportItems] = useState<{ ingredientId: string; quantity: number; cost: number }[]>([]);
  const [selectedIngId, setSelectedIngId] = useState('');
  const [qty, setQty] = useState(1);
  const [costPrice, setCostPrice] = useState(1000);

  if (isLoadingImports) {
    return <div style={{ color: '#fff' }}>Đang tải nhật ký nhập hàng...</div>;
  }

  const handleAddItem = () => {
    if (!selectedIngId) return;
    const ing = ingredients.find((i) => i.id === selectedIngId);
    if (!ing) return;

    // Check if item already added
    const existing = importItems.find((item) => item.ingredientId === selectedIngId);
    if (existing) {
      alert('Nguyên liệu này đã được chọn trong phiếu nhập.');
      return;
    }

    setImportItems((prev) => [
      ...prev,
      { ingredientId: selectedIngId, quantity: Number(qty), cost: Number(costPrice) }
    ]);

    // reset item inputs
    setSelectedIngId('');
    setQty(1);
    setCostPrice(1000);
  };

  const handleRemoveItem = (index: number) => {
    setImportItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier) {
      alert('Vui lòng điền thông tin nhà cung cấp');
      return;
    }
    if (importItems.length === 0) {
      alert('Vui lòng thêm ít nhất 1 mặt hàng cần nhập');
      return;
    }

    const payloadItems = importItems.map((item) => {
      const ing = ingredients.find((i) => i.id === item.ingredientId)!;
      return {
        ingredientId: item.ingredientId,
        name: ing.name,
        quantity: item.quantity,
        cost: item.cost
      };
    });

    try {
      await createImport({ supplier, items: payloadItems });
      setShowModal(false);
      setSupplier('');
      setImportItems([]);
      alert('Nhập hàng thành công! Số lượng tồn kho đã tự động điều chỉnh.');
    } catch (err) {
      alert('Lỗi khi lưu phiếu nhập hàng');
    }
  };

  const handleSelectIngredient = (id: string) => {
    setSelectedIngId(id);
    const ing = ingredients.find((i) => i.id === id);
    if (ing) {
      setCostPrice(ing.pricePerUnit);
    }
  };

  const grandTotal = importItems.reduce((sum, item) => sum + item.cost * item.quantity, 0);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Nhập Hàng Vào Kho</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Log phiếu nhập kho vật tư và tự động cập nhật số lượng tồn kho.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>Tạo Phiếu Nhập Kho</span>
        </button>
      </div>

      {/* Roster of Import Bills */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Mã Phiếu</th>
              <th>Nhà Cung Cấp</th>
              <th>Ngày Nhập</th>
              <th>Danh Sách Vật Tư</th>
              <th>Tổng Giá Trị</th>
              <th>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {stockImports.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Chưa có lịch sử nhập kho nào được ghi nhận.
                </td>
              </tr>
            ) : (
              stockImports.map((imp) => (
                <tr key={imp.id}>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>{imp.id}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff', fontWeight: 500 }}>
                      <Truck size={14} style={{ color: 'var(--accent-color)' }} />
                      <span>{imp.supplier}</span>
                    </div>
                  </td>
                  <td>{formatDate(imp.importDate)}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem' }}>
                      {imp.items.map((it, idx) => (
                        <div key={idx}>
                          • {it.name} <span style={{ color: 'var(--text-muted)' }}>({it.quantity} x {formatCurrency(it.cost)})</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#fff' }}>
                      {formatCurrency(imp.totalCost)}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      <CheckCircle size={10} /> Đã Nhập Kho
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal dialog for creating new Import Voucher */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Lập Phiếu Nhập Kho"
        subtitle="Ghi nhận hóa đơn nhập nguyên vật liệu từ nhà cung cấp"
        icon={<FileText size={22} />}
        maxWidth="620px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Nhà cung cấp thực phẩm</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ví dụ: Đại lý thịt sạch Hoàng Minh..."
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          </div>

          {/* Sub-item inputs list */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '1rem'
          }}>
            <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.8rem', color: 'var(--accent-color)' }}>
              Thêm nguyên liệu nhập kho
            </span>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr auto', gap: '0.5rem', alignItems: 'end' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Chọn nguyên liệu</label>
                <select
                  className="form-input"
                  value={selectedIngId}
                  onChange={(e) => handleSelectIngredient(e.target.value)}
                  style={{ padding: '0.5rem' }}
                >
                  <option value="">Chọn...</option>
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Số lượng</label>
                <input
                  type="number"
                  className="form-input"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  style={{ padding: '0.5rem' }}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Giá nhập (VND)</label>
                <input
                  type="number"
                  className="form-input"
                  min={0}
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  style={{ padding: '0.5rem' }}
                />
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={handleAddItem}
                style={{ padding: '0.6rem 0.8rem', borderRadius: '8px' }}
              >
                Thêm
              </button>
            </div>

            {/* Grid Roster of Added Items */}
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {importItems.length > 0 ? (
                importItems.map((item, idx) => {
                  const ing = ingredients.find((i) => i.id === item.ingredientId);
                  return (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      borderRadius: '8px',
                      padding: '0.4rem 0.6rem'
                    }}>
                      <span>
                        {ing?.name} ({item.quantity} {ing?.unit} x {formatCurrency(item.cost)})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}
                      >
                        Xóa
                      </button>
                    </div>
                  );
                })
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textAlign: 'center', padding: '0.5rem 0' }}>
                  Chưa chọn nguyên liệu nào.
                </span>
              )}
            </div>
          </div>

          {/* Total calculations */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tổng giá trị:</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-color)' }}>
              {formatCurrency(grandTotal)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1.5, justifyContent: 'center' }}>
              Lưu Phiếu Nhập Kho
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
