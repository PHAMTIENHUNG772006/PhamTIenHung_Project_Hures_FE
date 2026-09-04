import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();
  
  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager' || user?.role === 'admin',
    isCashier: user?.role === 'cashier' || user?.role === 'admin',
    isKitchen: user?.role === 'kitchen' || user?.role === 'admin',
  };
};
