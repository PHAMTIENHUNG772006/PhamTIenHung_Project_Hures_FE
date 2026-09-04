import React, { useState } from 'react';
import { useBookings } from '../../hooks/queries/useBookings';
import { useOrders } from '../../hooks/queries/useOrders';
import { formatDate, formatTime } from '../../utils/dateHelpers';
import { bookingSchema } from '../../schemas/booking.schema';
import { useBranch } from '../../hooks/useBranch';
import { Modal } from '../../components/common/Modal';
import {
  CalendarDays,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  UserPlus,
  Clock,
  Phone,
  Users,
  StickyNote,
  CalendarPlus
} from 'lucide-react';

export const BookingListPage: React.FC = () => {
  const { bookings, createBooking, updateBookingStatus } = useBookings();
  const { tables, createOrder } = useOrders();
  const { currentBranchId } = useBranch();

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [tableId, setTableId] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const availableTables = tables.filter((t) => t.status === 'empty');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      customerName,
      customerPhone,
      bookingTime: bookingTime ? new Date(bookingTime).toISOString() : '',
      partySize: Number(partySize),
      tableId: tableId || undefined,
      tableName: tableId ? tables.find((t) => t.id === tableId)?.name : undefined,
      notes,
      branchId: currentBranchId,
      status: 'confirmed' as const
    };

    // Zod validation
    const result = bookingSchema.safeParse(payload);
    if (!result.success) {
      setFormError(result.error.errors[0].message);
      return;
    }

    try {
      await createBooking(payload);
      setShowModal(false);
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setBookingTime('');
      setPartySize(2);
      setTableId('');
      setNotes('');
    } catch (err) {
      setFormError('Lỗi thêm lịch đặt bàn');
    }
  };

  const handleSeatCustomer = async (booking: any) => {
    // Assign to table if selected, or default to first empty table matching capacity
    let selectedTableId = booking.tableId;
    let selectedTableName = booking.tableName;

    if (!selectedTableId) {
      const match = tables.find((t) => t.status === 'empty' && t.capacity >= booking.partySize);
      if (match) {
        selectedTableId = match.id;
        selectedTableName = match.name;
      } else {
        alert('Không còn bàn trống phù hợp với số lượng khách. Vui lòng dọn bàn hoặc chọn bàn thủ công.');
        return;
      }
    }

    try {
      // 1. Update Booking Status to Seated
      await updateBookingStatus({ id: booking.id, status: 'seated' });
      
      // 2. Create blank order for the table
      await createOrder({
        tableId: selectedTableId,
        tableName: selectedTableName,
        items: [],
        discount: 0,
        tax: 10
      });
      alert(`Đã nhận khách vào ${selectedTableName}. Đơn hàng POS đã được khởi tạo!`);
    } catch (err) {
      alert('Đã xảy ra lỗi khi nhận bàn');
    }
  };

  const filteredBookings = bookings.filter((b) =>
    b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.customerPhone.includes(searchTerm)
  );

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Quản Lý Lịch Đặt Bàn</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Tiếp đón, sắp xếp lịch đặt bàn trước của khách hàng.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>Đặt Bàn Mới</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
        <Search size={18} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Tìm theo tên khách hàng hoặc số điện thoại..."
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

      {/* Booking List Container */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Khách Hàng</th>
              <th>Thời Gian</th>
              <th>Số Lượng</th>
              <th>Bàn Gán Trước</th>
              <th>Ghi Chú</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'right' }}>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Không tìm thấy lịch đặt bàn nào.
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{b.customerName}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Phone size={12} /> {b.customerPhone}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#fff', fontWeight: 500 }}>{formatTime(b.bookingTime)}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Clock size={12} /> {formatDate(b.bookingTime)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Users size={14} /> {b.partySize} khách
                    </span>
                  </td>
                  <td>
                    <span style={{ color: b.tableName ? 'var(--accent-color)' : 'var(--text-muted)', fontWeight: b.tableName ? 600 : 400 }}>
                      {b.tableName || 'Chưa gán'}
                    </span>
                  </td>
                  <td>
                    {b.notes ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', opacity: 0.8 }}>
                        <StickyNote size={12} style={{ color: 'var(--accent-color)' }} /> {b.notes}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${
                      b.status === 'confirmed' ? 'badge-info' :
                      b.status === 'seated' ? 'badge-success' :
                      b.status === 'cancelled' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {b.status === 'confirmed' ? 'Đã Xác Nhận' :
                       b.status === 'seated' ? 'Đã Nhận Bàn' :
                       b.status === 'cancelled' ? 'Đã Hủy' : 'Chờ Duyệt'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      {b.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleSeatCustomer(b)}
                            style={{
                              background: 'rgba(76, 175, 80, 0.15)',
                              border: '1px solid rgba(76, 175, 80, 0.3)',
                              color: '#81c784',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                          >
                            <UserPlus size={14} />
                            Nhận Bàn
                          </button>
                          <button
                            onClick={() => updateBookingStatus({ id: b.id, status: 'cancelled' })}
                            style={{
                              background: 'rgba(244, 67, 54, 0.15)',
                              border: '1px solid rgba(244, 67, 54, 0.3)',
                              color: '#e57373',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                          >
                            <XCircle size={14} />
                            Hủy
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Booking Dialog Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Đặt Bàn Mới"
        subtitle="Nhập thông tin đặt bàn trước của khách hàng"
        icon={<CalendarPlus size={22} />}
        maxWidth="520px"
      >
        {formError && (
          <div style={{
            background: 'rgba(255,77,77,0.15)',
            border: '1px solid rgba(255,77,77,0.3)',
            padding: '0.8rem',
            borderRadius: '8px',
            color: '#ff8a8a',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Tên khách hàng</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nhập tên khách"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Số điện thoại</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nhập số điện thoại (ví dụ: 0987654321)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Số lượng khách</label>
              <input
                type="number"
                className="form-input"
                min={1}
                value={partySize}
                onChange={(e) => setPartySize(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gán bàn trước (Tùy chọn)</label>
              <select
                className="form-input"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
              >
                <option value="">Chọn bàn trống...</option>
                {availableTables.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} (Sức chứa: {t.capacity})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Thời gian đặt bàn</label>
            <input
              type="datetime-local"
              className="form-input"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ghi chú yêu cầu</label>
            <textarea
              className="form-input"
              placeholder="Ví dụ: Đồ chay, ghế em bé, sinh nhật..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ height: '80px', resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              Xác Nhận Đặt Bàn
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
