import { z } from 'zod';

export const orderItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nonnegative('Giá sản phẩm không thể âm'),
  quantity: z.number().int().positive('Số lượng phải từ 1 trở lên'),
  note: z.string().optional(),
});

export const orderSchema = z.object({
  tableId: z.string().min(1, 'Vui lòng chọn bàn'),
  tableName: z.string(),
  items: z.array(orderItemSchema).min(1, 'Giỏ hàng cần có ít nhất 1 món ăn'),
  discount: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  branchId: z.string().min(1, 'Vui lòng chọn chi nhánh'),
});

export type OrderSchemaType = z.infer<typeof orderSchema>;
