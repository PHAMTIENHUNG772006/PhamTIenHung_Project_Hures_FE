import { ApiResponse } from '../types/api.types';

export interface Employee {
  id: string;
  name: string;
  role: string;
}

export interface ShiftSchedule {
  employeeId: string;
  employeeName: string;
  role: string;
  shifts: string[]; // 7 elements, index 0=Mon, 6=Sun. Shift values: 'Sáng', 'Chiều', 'Tối', 'Off'
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'Ontime' | 'Late' | 'Absent' | 'Pending';
}

const defaultEmployees: Record<string, Employee[]> = {
  'CN01': [
    { id: 'EMP-001', name: 'Trần Văn Hoàng', role: 'Cashier' },
    { id: 'EMP-002', name: 'Lê Mỹ Dung', role: 'Cashier' },
    { id: 'EMP-003', name: 'Nguyễn Đình Phong', role: 'Kitchen Staff' },
    { id: 'EMP-004', name: 'Phạm Hồng Thái', role: 'Kitchen Staff' },
    { id: 'EMP-005', name: 'Bùi Thị Hà', role: 'Waiter' }
  ],
  'CN02': [
    { id: 'EMP-101', name: 'Đoàn Gia Bảo', role: 'Cashier' },
    { id: 'EMP-102', name: 'Lê Minh Tuấn', role: 'Kitchen Staff' }
  ],
  'CN03': [
    { id: 'EMP-201', name: 'Tạ Văn Quyết', role: 'Cashier' },
    { id: 'EMP-202', name: 'Đỗ Hải Đăng', role: 'Kitchen Staff' }
  ]
};

const getMockShiftSchedules = (branchId: string): ShiftSchedule[] => {
  const key = `mock_schedules_${branchId}`;
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);

  const emps = defaultEmployees[branchId] || [];
  const defaults: ShiftSchedule[] = emps.map((emp, idx) => ({
    employeeId: emp.id,
    employeeName: emp.name,
    role: emp.role,
    shifts: idx % 2 === 0
      ? ['Sáng', 'Sáng', 'Chiều', 'Off', 'Tối', 'Tối', 'Off']
      : ['Chiều', 'Chiều', 'Off', 'Sáng', 'Sáng', 'Tối', 'Off']
  }));

  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
};

const saveShiftSchedules = (branchId: string, schedules: ShiftSchedule[]) => {
  localStorage.setItem(`mock_schedules_${branchId}`, JSON.stringify(schedules));
};

const getMockAttendance = (branchId: string): AttendanceRecord[] => {
  const key = `mock_attendance_${branchId}`;
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);

  const emps = defaultEmployees[branchId] || [];
  const todayStr = new Date().toLocaleDateString('vi-VN');

  const defaults: AttendanceRecord[] = emps.map((emp, idx) => {
    let checkIn: string | null = null;
    let checkOut: string | null = null;
    let status: AttendanceRecord['status'] = 'Pending';

    if (idx === 0) {
      checkIn = '05:55';
      checkOut = '14:02';
      status = 'Ontime';
    } else if (idx === 1) {
      checkIn = '06:15'; // Late!
      status = 'Late';
    } else if (idx === 2) {
      checkIn = '13:58';
      status = 'Ontime';
    }

    return {
      id: `ATT-${emp.id}-${todayStr.replace(/\//g, '')}`,
      employeeId: emp.id,
      employeeName: emp.name,
      role: emp.role,
      date: todayStr,
      checkIn,
      checkOut,
      status
    };
  });

  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
};

const saveAttendance = (branchId: string, records: AttendanceRecord[]) => {
  localStorage.setItem(`mock_attendance_${branchId}`, JSON.stringify(records));
};

export const fetchShiftScheduleApi = async (branchId: string): Promise<ApiResponse<ShiftSchedule[]>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return { success: true, data: getMockShiftSchedules(branchId) };
};

export const updateShiftScheduleApi = async (
  branchId: string,
  employeeId: string,
  dayIndex: number,
  shiftCode: string
): Promise<ApiResponse<ShiftSchedule[]>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const schedules = getMockShiftSchedules(branchId);
  const idx = schedules.findIndex((s) => s.employeeId === employeeId);
  if (idx > -1) {
    schedules[idx].shifts[dayIndex] = shiftCode;
    saveShiftSchedules(branchId, schedules);
  }
  return { success: true, data: schedules };
};

export const fetchAttendanceApi = async (branchId: string): Promise<ApiResponse<AttendanceRecord[]>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return { success: true, data: getMockAttendance(branchId) };
};

export const checkInEmployeeApi = async (
  branchId: string,
  employeeId: string,
  timeStr: string
): Promise<ApiResponse<AttendanceRecord[]>> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const records = getMockAttendance(branchId);
  const idx = records.findIndex((r) => r.employeeId === employeeId);
  if (idx > -1) {
    records[idx].checkIn = timeStr;
    const hour = parseInt(timeStr.split(':')[0], 10);
    const minute = parseInt(timeStr.split(':')[1], 10);
    const totalMinutes = hour * 60 + minute;
    // Assume shift starts at 06:00 or 14:00. Let's mark as late if check in is after 06:05 or 14:05 respectively
    if ((totalMinutes > 365 && totalMinutes < 840) || totalMinutes > 845) {
      records[idx].status = 'Late';
    } else {
      records[idx].status = 'Ontime';
    }
    saveAttendance(branchId, records);
  }
  return { success: true, data: records };
};

export const checkOutEmployeeApi = async (
  branchId: string,
  employeeId: string,
  timeStr: string
): Promise<ApiResponse<AttendanceRecord[]>> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const records = getMockAttendance(branchId);
  const idx = records.findIndex((r) => r.employeeId === employeeId);
  if (idx > -1) {
    records[idx].checkOut = timeStr;
    saveAttendance(branchId, records);
  }
  return { success: true, data: records };
};
