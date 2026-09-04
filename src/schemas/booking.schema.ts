import { z } from 'zod';

export const bookingSchema = z.object({
  customerName: z.string().min(2, 'Tên khách hàng phải từ 2 ký tự trở lên'),
  customerPhone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không đúng định dạng'),
  bookingTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Thời gian đặt bàn không hợp lệ',
  }),
  partySize: z.number().int().min(1, 'Số lượng khách phải ít nhất là 1'),
  tableId: z.string().optional(),
  notes: z.string().optional(),
  branchId: z.string().min(1, 'Vui lòng chọn chi nhánh'),
});

export type BookingSchemaType = z.infer<typeof bookingSchema>;
