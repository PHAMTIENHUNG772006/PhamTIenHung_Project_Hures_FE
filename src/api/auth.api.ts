import { ApiResponse, User } from '../types/api.types';

export const loginApi = async (
  email: string,
  password: string
): Promise<ApiResponse<{ user: User; token: string; refreshToken: string }>> => {
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate latency

  // Mock accounts covering all 5 core restaurant roles
  const users: Record<
    string,
    { name: string; role: 'admin' | 'manager' | 'cashier' | 'chef' | 'waiter' }
  > = {
    'admin@restaurant.com': { name: 'Vinh Khánh (Admin)', role: 'admin' },
    'manager@restaurant.com': { name: 'Nguyễn Quản Lý', role: 'manager' },
    'cashier@restaurant.com': { name: 'Trần Thu Ngân', role: 'cashier' },
    'chef@restaurant.com': { name: 'Lê Bếp Trưởng', role: 'chef' },
    'kitchen@restaurant.com': { name: 'Lê Bếp Trưởng', role: 'chef' },
    'waiter@restaurant.com': { name: 'Phạm Phục Vụ', role: 'waiter' },
  };

  const matched = users[email.toLowerCase()];

  if (matched && password === '123456') {
    const user: User = {
      id: `USR-${matched.role.toUpperCase()}`,
      name: matched.name,
      email: email.toLowerCase(),
      role: matched.role,
      branchId: 'CN01',
    };
    return {
      success: true,
      data: {
        user,
        token: `jwt-token-${matched.role}-${Date.now()}`,
        refreshToken: `refresh-token-${matched.role}-${Date.now()}`,
      },
    };
  }

  return {
    success: false,
    data: null as any,
    message: 'Email hoặc mật khẩu không chính xác (Thử dùng: admin@restaurant.com / 123456)',
  };
};

export const refreshTokenApi = async (
  refreshToken: string
): Promise<ApiResponse<{ token: string; refreshToken: string }>> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (!refreshToken) {
    return { success: false, data: null as any, message: 'Invalid refresh token' };
  }
  return {
    success: true,
    data: {
      token: `refreshed-jwt-token-${Date.now()}`,
      refreshToken: `refreshed-refresh-token-${Date.now()}`,
    },
  };
};

