import React, { useState } from 'react';
import { useBranch } from '../../hooks/useBranch';
import { Branch } from '../../types/api.types';
import { Modal } from '../../components/common/Modal';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  User,
  Clock,
  Utensils,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building,
  Store,
  Check,
  RefreshCw
} from 'lucide-react';


export const BranchListPage: React.FC = () => {
  const {
    currentBranchId,
    branches,
    loading,
    error: storeError,
    setCurrentBranch,
    fetchBranches,
    addBranch,
    updateBranch,
    deleteBranch
  } = useBranch(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'inactive'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formManagerName, setFormManagerName] = useState('');
  const [formOpeningHours, setFormOpeningHours] = useState('08:00 - 22:30');
  const [formTotalTables, setFormTotalTables] = useState<number>(20);
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formError, setFormError] = useState('');

  const openCreateModal = () => {
    setEditingBranch(null);
    setFormId('');
    setFormName('');
    setFormAddress('');
    setFormPhone('');
    setFormEmail('');
    setFormManagerName('');
    setFormOpeningHours('08:00 - 22:30');
    setFormTotalTables(20);
    setFormStatus('active');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setFormId(String(branch.id));
    setFormName(branch.name);
    setFormAddress(branch.address);
    setFormPhone(branch.phone);
    setFormEmail(branch.email || '');
    setFormManagerName(branch.managerName || '');
    setFormOpeningHours(branch.openingHours || '08:00 - 22:30');
    setFormTotalTables(branch.totalTables || 20);
    setFormStatus(branch.status || 'active');
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Vui lòng nhập tên chi nhánh');
      return;
    }
    if (!formAddress.trim()) {
      setFormError('Vui lòng nhập địa chỉ chi nhánh');
      return;
    }
    if (!formPhone.trim()) {
      setFormError('Vui lòng nhập số điện thoại chi nhánh');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (editingBranch) {
        // Edit PUT /api/branches/{id}
        await updateBranch(editingBranch.id, {
          name: formName.trim(),
          address: formAddress.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim() || undefined,
          managerName: formManagerName.trim() || undefined,
          openingHours: formOpeningHours.trim(),
          totalTables: Number(formTotalTables) || 10,
          status: formStatus
        });
      } else {
        // Create POST /api/branches
        await addBranch({
          name: formName.trim(),
          address: formAddress.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim() || undefined,
          managerName: formManagerName.trim() || undefined,
          openingHours: formOpeningHours.trim(),
          totalTables: Number(formTotalTables) || 15,
          status: formStatus,
        });
      }
      closeModal();
    } catch (err: any) {
      setFormError(err.message || 'Thao tác không thành công, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (branch: Branch) => {
    if (branches.length <= 1) {
      alert('Hệ thống cần duy trì tối thiểu 1 chi nhánh. Không thể xóa!');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa chi nhánh "${branch.name}" (ID: ${branch.id})?`)) {
      try {
        await deleteBranch(branch.id);
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa chi nhánh');
      }
    }
  };

  const handleSelectActiveBranch = (branchId: string | number) => {
    setCurrentBranch(String(branchId));
    window.location.reload();
  };


  // Filter branches
  const filteredBranches = branches.filter((branch) => {
    const matchSearch =
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (branch.managerName && branch.managerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus =
      statusFilter === 'ALL' || (branch.status || 'active') === statusFilter;

    return matchSearch && matchStatus;
  });

  const totalBranches = branches.length;
  const activeBranchesCount = branches.filter((b) => (b.status || 'active') === 'active').length;
  const totalTablesCount = branches.reduce((sum, b) => sum + (b.totalTables || 15), 0);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Building2 size={32} style={{ color: 'var(--accent-color)' }} />
            Quản Lý Chi Nhánh
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.4rem 0 0 0' }}>
            Theo dõi, thiết lập và phân bổ danh sách hệ thống chi nhánh nhà hàng.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className="btn-secondary"
            onClick={() => fetchBranches()}
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.1rem' }}
            title="Đồng bộ dữ liệu từ Database backend"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>{loading ? 'Đang tải...' : 'Tải lại từ DB'}</span>
          </button>

          <button className="btn-primary" onClick={openCreateModal}>
            <Plus size={18} />
            <span>Thêm Chi Nhánh Mới</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              background: 'rgba(30, 144, 255, 0.12)',
              padding: '0.9rem',
              borderRadius: '12px',
              color: 'var(--accent-color)'
            }}
          >
            <Building size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Tổng Số Chi Nhánh
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0 0 0' }}>
              {totalBranches} điểm bán
            </h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              background: 'rgba(76, 175, 80, 0.12)',
              padding: '0.9rem',
              borderRadius: '12px',
              color: '#4caf50'
            }}
          >
            <CheckCircle2 size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Đang Hoạt Động
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0 0 0', color: '#4caf50' }}>
              {activeBranchesCount} / {totalBranches}
            </h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              background: 'rgba(255, 152, 0, 0.12)',
              padding: '0.9rem',
              borderRadius: '12px',
              color: '#ff9800'
            }}
          >
            <Utensils size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Tổng Sức Chứa Toàn Hệ Thống
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0 0 0' }}>
              ~{totalTablesCount} bàn ăn
            </h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem 1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Tìm theo tên chi nhánh, mã, địa chỉ, quản lý..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              width: '100%',
              fontFamily: 'inherit',
              fontSize: '0.95rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['ALL', 'active', 'inactive'] as const).map((st) => {
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.5rem 1.1rem',
                  fontSize: '0.85rem',
                  borderRadius: '10px',
                  border: isSelected ? 'none' : '1px solid var(--border-color)',
                  background: isSelected ? 'linear-gradient(135deg, #1e90ff, #0073e6)' : 'var(--bg-secondary)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 12px rgba(30, 144, 255, 0.35)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {st === 'ALL' ? 'Tất cả trạng thái' : st === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Branch Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {filteredBranches.map((branch) => {
          const isCurrent = branch.id === currentBranchId;
          const isActive = (branch.status || 'active') === 'active';

          return (
            <div
              key={branch.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem',
                position: 'relative',
                border: isCurrent ? '2px solid var(--accent-color)' : '1px solid var(--card-border)',
                boxShadow: isCurrent ? '0 8px 30px rgba(30, 144, 255, 0.15)' : undefined
              }}
            >
              {/* Top Row: Code & Badges */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        background: 'rgba(30, 144, 255, 0.1)',
                        color: 'var(--accent-color)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {branch.id}
                    </span>
                    <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`}>
                      {isActive ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </div>

                  {isCurrent && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: 'linear-gradient(135deg, #1e90ff, #0073e6)',
                        color: '#ffffff',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        boxShadow: '0 2px 10px rgba(30, 144, 255, 0.35)'
                      }}
                    >
                      <Check size={13} strokeWidth={3} style={{ color: '#ffffff' }} />
                      Đang Làm Việc
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                  {branch.name}
                </h3>

                {/* Details List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={16} style={{ color: 'var(--accent-color)', flexShrink: 0, marginTop: '2px' }} />
                    <span>{branch.address}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <Phone size={15} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                    <span>{branch.phone}</span>
                  </div>

                  {branch.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <Mail size={15} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                      <span>{branch.email}</span>
                    </div>
                  )}

                  {branch.managerName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <User size={15} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                      <span>Quản lý: <strong>{branch.managerName}</strong></span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>{branch.openingHours || '08:00 - 22:30'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                      <Utensils size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>{branch.totalTables || 15} bàn</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '1rem'
                }}
              >
                {!isCurrent ? (
                  <button
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.55rem', fontSize: '0.85rem', justifyContent: 'center' }}
                    onClick={() => handleSelectActiveBranch(branch.id)}
                  >
                    <Store size={15} />
                    <span>Chọn Làm Việc</span>
                  </button>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      padding: '0.55rem',
                      fontSize: '0.85rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: 'var(--accent-color)',
                      background: 'rgba(30, 144, 255, 0.08)',
                      borderRadius: '8px'
                    }}
                  >
                    Chi nhánh hiện tại
                  </div>
                )}

                <button
                  className="btn-secondary"
                  style={{ padding: '0.55rem 0.75rem' }}
                  onClick={() => openEditModal(branch)}
                  title="Chỉnh sửa chi nhánh"
                >
                  <Edit2 size={15} />
                </button>

                <button
                  className="btn-secondary"
                  style={{
                    padding: '0.55rem 0.75rem',
                    color: '#ff4d4d',
                    borderColor: 'rgba(255, 77, 77, 0.2)'
                  }}
                  onClick={() => handleDelete(branch)}
                  title="Xóa chi nhánh"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBranches.length === 0 && (
        <div
          className="glass-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 1rem',
            textAlign: 'center',
            gap: '0.75rem'
          }}
        >
          <Building2 size={40} style={{ color: 'var(--text-muted)' }} />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Không tìm thấy chi nhánh nào</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: 0 }}>
            Thử thay đổi từ khóa tìm kiếm hoặc bấm nút "Thêm Chi Nhánh Mới" để tạo điểm bán.
          </p>
        </div>
      )}

      {/* Create / Edit Branch Modal using reusable standard Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBranch ? 'Cập Nhật Chi Nhánh' : 'Thêm Chi Nhánh Mới'}
        subtitle={editingBranch ? `Mã chi nhánh: ${editingBranch.id}` : 'Nhập thông tin chi nhánh mới vào hệ thống'}
        icon={<Building2 size={22} />}
        maxWidth="600px"
      >
        {formError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 77, 77, 0.15)',
              border: '1px solid rgba(255, 77, 77, 0.3)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              color: '#ff4d4d',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}
          >
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Tên Chi Nhánh *</label>
            <input
              type="text"
              className="form-input"
              placeholder="VD: Chi nhánh Landmark 81"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Địa Chỉ Hoạt Động *</label>
            <input
              type="text"
              className="form-input"
              placeholder="VD: 720A Điện Biên Phủ, P.22, Q.Bình Thạnh, TP.HCM"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Số Điện Thoại *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="VD: 028 3812 9999"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email Liên Hệ</label>
              <input
                type="email"
                className="form-input"
                placeholder="VD: landmark@restaurant.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Người Quản Lý</label>
              <input
                type="text"
                className="form-input"
                placeholder="VD: Nguyễn Văn A"
                value={formManagerName}
                onChange={(e) => setFormManagerName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Giờ Mở Cửa</label>
              <input
                type="text"
                className="form-input"
                placeholder="VD: 08:00 - 22:30"
                value={formOpeningHours}
                onChange={(e) => setFormOpeningHours(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tổng Số Bàn Ăn</label>
              <input
                type="number"
                className="form-input"
                min={1}
                max={200}
                value={formTotalTables}
                onChange={(e) => setFormTotalTables(Number(e.target.value))}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Trạng Thái</label>
              <select
                className="form-input"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm dừng hoạt động</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={closeModal}>
              Hủy Bỏ
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1.5, justifyContent: 'center' }}>
              {editingBranch ? 'Lưu Thay Đổi' : 'Tạo Chi Nhánh'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
