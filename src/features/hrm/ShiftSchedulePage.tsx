import React, { useState, useEffect } from 'react';
import { fetchShiftScheduleApi, updateShiftScheduleApi, ShiftSchedule } from '../../api/hrm.api';
import { useBranch } from '../../hooks/useBranch';
import { CalendarRange, ChevronLeft, ChevronRight, Save, Clock } from 'lucide-react';

export const ShiftSchedulePage: React.FC = () => {
  const { currentBranchId } = useBranch();
  const [schedules, setSchedules] = useState<ShiftSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
  const shiftCodes = ['Sáng', 'Chiều', 'Tối', 'Off'];

  useEffect(() => {
    setLoading(true);
    fetchShiftScheduleApi(currentBranchId).then((res) => {
      setSchedules(res.data);
      setLoading(false);
    });
  }, [currentBranchId]);

  const handleShiftChange = async (employeeId: string, dayIdx: number, newShift: string) => {
    try {
      const res = await updateShiftScheduleApi(currentBranchId, employeeId, dayIdx, newShift);
      if (res.success) {
        setSchedules(res.data);
      }
    } catch (err) {
      alert('Không thể cập nhật ca trực');
    }
  };

  if (loading) {
    return <div style={{ color: '#fff' }}>Đang tải lịch phân ca nhân sự...</div>;
  }

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Lịch Phân Ca Làm Việc</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Sắp xếp lịch trực hàng tuần cho nhân viên theo từng chi nhánh.</p>
        </div>

        {/* Date Navigator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.4rem 0.8rem' }}>
          <ChevronLeft size={16} style={{ cursor: 'pointer' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tuần này: 10/08 - 16/08</span>
          <ChevronRight size={16} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* Main Roster Grid */}
      <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="custom-table" style={{ minWidth: '800px' }}>
          <thead>
            <tr>
              <th style={{ width: '180px' }}>Nhân Viên</th>
              <th style={{ width: '120px' }}>Vai Trò</th>
              {daysOfWeek.map((day) => (
                <th key={day} style={{ textAlign: 'center' }}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedules.map((row) => (
              <tr key={row.employeeId}>
                <td>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{row.employeeName}</span>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)' }}>{row.role}</span>
                </td>
                {row.shifts.map((shift, dayIdx) => {
                  let shiftColor = 'rgba(255,255,255,0.05)';
                  let textColor = '#eee';
                  
                  if (shift === 'Sáng') { shiftColor = 'rgba(30,144,255,0.15)'; textColor = '#1e90ff'; }
                  else if (shift === 'Chiều') { shiftColor = 'rgba(76,175,80,0.15)'; textColor = '#4caf50'; }
                  else if (shift === 'Tối') { shiftColor = 'rgba(255,152,0,0.15)'; textColor = '#ff9800'; }
                  else if (shift === 'Off') { shiftColor = 'rgba(255,77,77,0.1)'; textColor = '#ff4d4d'; }

                  return (
                    <td key={dayIdx} style={{ textAlign: 'center' }}>
                      <select
                        value={shift}
                        onChange={(e) => handleShiftChange(row.employeeId, dayIdx, e.target.value)}
                        style={{
                          background: shiftColor,
                          color: textColor,
                          border: 'none',
                          padding: '0.4rem 0.6rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          width: '85px',
                          textAlign: 'center',
                          outline: 'none',
                          appearance: 'none', // Remove default arrow for premium UI
                          WebkitAppearance: 'none'
                        }}
                      >
                        {shiftCodes.map((code) => (
                          <option key={code} value={code} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                            {code}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info Tips Panel */}
      <div className="glass-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ background: 'rgba(0,188,212,0.1)', padding: '0.8rem', borderRadius: '12px', color: 'var(--accent-color)' }}>
          <Clock size={20} />
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
          <div>
            <strong>Ca Sáng (Sáng):</strong> <span style={{ color: 'var(--text-secondary)' }}>06:00 - 14:00</span>
          </div>
          <div>
            <strong>Ca Chiều (Chiều):</strong> <span style={{ color: 'var(--text-secondary)' }}>14:00 - 22:00</span>
          </div>
          <div>
            <strong>Ca Tối (Tối):</strong> <span style={{ color: 'var(--text-secondary)' }}>22:00 - 06:00</span>
          </div>
          <div>
            <strong>Nghỉ ca (Off):</strong> <span style={{ color: 'var(--text-secondary)' }}>Nghỉ tuần</span>
          </div>
        </div>
      </div>
    </div>
  );
};
