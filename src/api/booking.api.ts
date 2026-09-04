import { ApiResponse } from '../types/api.types';
import { Booking } from '../types/order.types';

const getMockBookings = (): Booking[] => {
  const data = localStorage.getItem('mock_bookings');
  if (data) return JSON.parse(data);

  const defaults: Booking[] = [
    {
      id: 'BKG-001',
      customerName: 'Lê Văn Nam',
      customerPhone: '0987654321',
      bookingTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      partySize: 4,
      tableId: 'T-02',
      tableName: 'Bàn A2',
      status: 'confirmed',
      notes: 'Bàn cạnh cửa sổ, yêu cầu ghế trẻ em',
      branchId: 'CN01'
    },
    {
      id: 'BKG-002',
      customerName: 'Hoàng Minh Châu',
      customerPhone: '0912345678',
      bookingTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      partySize: 8,
      tableId: 'T-06',
      tableName: 'Bàn VIP 1',
      status: 'pending',
      notes: 'Tiệc kỷ niệm ngày cưới',
      branchId: 'CN01'
    },
    {
      id: 'BKG-003',
      customerName: 'Phạm Thanh Thủy',
      customerPhone: '0905556677',
      bookingTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      partySize: 2,
      status: 'confirmed',
      notes: 'Đồ ăn ít cay',
      branchId: 'CN02'
    }
  ];
  localStorage.setItem('mock_bookings', JSON.stringify(defaults));
  return defaults;
};

export const fetchBookingsApi = async (branchId: string): Promise<ApiResponse<Booking[]>> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const bookings = getMockBookings();
  return {
    success: true,
    data: bookings.filter((b) => b.branchId === branchId)
  };
};

export const createBookingApi = async (booking: Omit<Booking, 'id'>): Promise<ApiResponse<Booking>> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const bookings = getMockBookings();
  const newBooking: Booking = {
    ...booking,
    id: `BKG-${Math.floor(100 + Math.random() * 900)}`
  };
  bookings.push(newBooking);
  localStorage.setItem('mock_bookings', JSON.stringify(bookings));
  return {
    success: true,
    data: newBooking
  };
};

export const updateBookingStatusApi = async (id: string, status: Booking['status']): Promise<ApiResponse<Booking>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const bookings = getMockBookings();
  const index = bookings.findIndex((b) => b.id === id);
  if (index > -1) {
    bookings[index].status = status;
    localStorage.setItem('mock_bookings', JSON.stringify(bookings));
    return { success: true, data: bookings[index] };
  }
  return {
    success: false,
    data: null as any,
    message: 'Không tìm thấy lịch đặt bàn'
  };
};
