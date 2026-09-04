import React, { useState, useEffect } from 'react';
import { fetchAttendanceApi, checkInEmployeeApi, checkOutEmployeeApi, AttendanceRecord } from '../../api/hrm.api';
import { useBranch } from '../../hooks/useBranch';
import { UserCheck, Clock, Check, LogIn, LogOut } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { currentBranchId } = useBranch();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAttendanceApi(currentBranchId).then((res) => {
      setRecords(res.data);
      setLoading(false);
    });
  }, [currentBranchId]);

  const handleCheckIn = async (employeeId: string) => {
    const timeStr = prompt('Nhập giờ vào ca (định dạng HH:MM, ví dụ 06:05):', new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }));
    if (timeStr) {
      if (!/^[0-9]{2}:[0-9]{2}$/.test(timeStr)) {
        alert('Định dạng giờ không hợp lệ. Vui lòng nhập đúng dạng HH:MM');
        return;
      }
      try {
        const res = await checkInEmployeeApi(currentBranchId, employeeId, timeStr);
        if (res.success) {
          setRecords(res.data);
        }
      } catch (err) {
        alert('Lỗi điểm danh vào ca');
      }
    }
  };

  const handleCheckOut = async (employeeId: string) => {
    const timeStr = prompt('Nhập giờ ra ca (định dạng HH:MM, ví dụ 14:02):', new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }));
    if (timeStr) {
      if (!/^[0-9]{2}:[0-9]{2}$/.test(timeStr)) {
        alert('Định dạng giờ không hợp lệ. Vui lòng nhập đúng dạng HH:MM');
        return;
      }
      try {
        const res = await checkOutEmployeeApi(currentBranchId, employeeId, timeStr);
        if (res.success) {
          setRecords(res.data);
        }
      } catch (err) {
        alert('Lỗi điểm danh ra ca');
      }
    }
  };

  if (loading) {
    return <div style={{ color: '#fff' }}>Đang tải bảng chấm công trực tuyến...</div>;
  }

  const ontimeCount = records.filter((r) => r.status === 'Ontime').length;
  const lateCount = records.filter((r) => r.status === 'Late').length;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Chấm Công Nhân Viên</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Ghi nhận giờ vào ca, ra ca và kiểm soát tình trạng đi trễ của nhân viên ngày hôm nay.
          </p>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '0.5rem 1rem',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.08)',
          fontSize: '0.85rem'
        }}>
          Hôm nay: <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{new Date().toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem'
      }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(0,188,212,0.1)', padding: '0.8rem', borderRadius: '12px', color: 'var(--accent-color)' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Tổng Nhân Sự Đăng Ký</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{records.length} nhân viên</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(76,175,80,0.1)', padding: '0.8rem', borderRadius: '12px', color: '#4caf50' }}>
            <Check size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Điểm Danh Đúng Giờ</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{ontimeCount} đúng giờ</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,152,0,0.1)', padding: '0.8rem', borderRadius: '12px', color: '#ff9800' }}>
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Số Ca Đi Trễ</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#ff9800' }}>{lateCount} đi muộn</h3>
          </div>
        </div>
      </div>

      {/* Roster lists */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Nhân Viên</th>
              <th>Chức Vụ</th>
              <th>Vào Ca</th>
              <th>Ra Ca</th>
              <th>Tình Trạng</th>
              <th style={{ textAlign: 'right' }}>Điểm Danh Hôm Nay</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{r.employeeName}</span>
                </td>
                <td>{r.role}</td>
                <td>
                  <span style={{ color: r.checkIn ? '#fff' : 'var(--text-muted)' }}>
                    {r.checkIn || '--:--'}
                  </span>
                </td>
                <td>
                  <span style={{ color: r.checkOut ? '#fff' : 'var(--text-muted)' }}>
                    {r.checkOut || '--:--'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${
                    r.status === 'Ontime' ? 'badge-success' :
                    r.status === 'Late' ? 'badge-warning' :
                    r.status === 'Absent' ? 'badge-danger' : 'badge-info'
                  }`}>
                    {r.status === 'Ontime' ? 'Đúng Giờ' :
                     r.status === 'Late' ? 'Đi Muộn' :
                     r.status === 'Absent' ? 'Vắng Mặt' : 'Chưa Vào Ca'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleCheckIn(r.employeeId)}
                      disabled={!!r.checkIn}
                      style={{
                        background: r.checkIn ? 'rgba(255,255,255,0.02)' : 'rgba(0,188,212,0.1)',
                        border: '1px solid',
                        borderColor: r.checkIn ? 'rgba(255,255,255,0.05)' : 'rgba(0,188,212,0.2)',
                        color: r.checkIn ? 'var(--text-muted)' : 'var(--accent-color)',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        cursor: r.checkIn ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      <LogIn size={12} />
                      Vào Ca
                    </button>
                    <button
                      onClick={() => handleCheckOut(r.employeeId)}
                      disabled={!r.checkIn || !!r.checkOut}
                      style={{
                        background: (!r.checkIn || r.checkOut) ? 'rgba(255,255,255,0.02)' : 'rgba(76,175,80,0.1)',
                        border: '1px solid',
                        borderColor: (!r.checkIn || r.checkOut) ? 'rgba(255,255,255,0.05)' : 'rgba(76,175,80,0.2)',
                        color: (!r.checkIn || r.checkOut) ? 'var(--text-muted)' : '#81c784',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        cursor: (!r.checkIn || r.checkOut) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      <LogOut size={12} />
                      Ra Ca
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
