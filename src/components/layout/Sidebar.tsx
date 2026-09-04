import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Utensils,
  Receipt,
  Boxes,
  Import,
  ChefHat,
  CalendarRange,
  UserCheck,
  TrendingUp,
  PieChart,
  Crown,
  LogOut
} from 'lucide-react';

interface SidebarItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  allowedRoles?: string[];
}

const normalizeRole = (role?: string): string => {
  if (!role) return '';
  const lower = role.toLowerCase();
  if (lower === 'kitchen') return 'chef';
  return lower;
};

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  
  const menuItems: SidebarItem[] = [
    {
      path: '/dashboard',
      label: 'Bảng Điều Khiển',
      icon: <LayoutDashboard size={18} />,
      allowedRoles: ['admin', 'manager']
    },
    {
      path: '/branches',
      label: 'Quản Lý Chi Nhánh',
      icon: <Building2 size={18} />,
      allowedRoles: ['admin', 'manager']
    },
    {
      path: '/kds',
      label: 'Bếp KDS Realtime',
      icon: <ChefHat size={18} />,
      allowedRoles: ['chef', 'kitchen', 'admin', 'manager']
    },
    {
      path: '/pos',
      label: 'Màn POS Order',
      icon: <Receipt size={18} />,
      allowedRoles: ['waiter', 'cashier', 'admin', 'manager']
    },
    {
      path: '/reservation/bookings',
      label: 'Lịch Đặt Bàn',
      icon: <CalendarDays size={18} />,
      allowedRoles: ['waiter', 'cashier', 'admin', 'manager']
    },
    {
      path: '/reservation/tables',
      label: 'Sơ Đồ Bàn Realtime',
      icon: <Utensils size={18} />,
      allowedRoles: ['waiter', 'cashier', 'chef', 'kitchen', 'admin', 'manager']
    },
    {
      path: '/inventory/ingredients',
      label: 'Quản Lý Kho',
      icon: <Boxes size={18} />,
      allowedRoles: ['admin', 'manager']
    },
    {
      path: '/inventory/imports',
      label: 'Nhập Hàng Kho',
      icon: <Import size={18} />,
      allowedRoles: ['admin', 'manager']
    },
    {
      path: '/inventory/recipes',
      label: 'Định Lượng (BOM)',
      icon: <ChefHat size={18} />,
      allowedRoles: ['admin', 'manager']
    },
    {
      path: '/hrm/schedule',
      label: 'Lịch Làm Việc',
      icon: <CalendarRange size={18} />,
      allowedRoles: ['admin', 'manager']
    },
    {
      path: '/hrm/attendance',
      label: 'Chấm Công Nhân Viên',
      icon: <UserCheck size={18} />,
      allowedRoles: ['admin', 'manager', 'cashier', 'chef', 'waiter']
    },
    {
      path: '/reports/financial',
      label: 'Báo Cáo Tài Chính',
      icon: <TrendingUp size={18} />,
      allowedRoles: ['admin', 'manager']
    },
    {
      path: '/reports/menu-engineering',
      label: 'Báo Cáo Thực Đơn',
      icon: <PieChart size={18} />,
      allowedRoles: ['admin', 'manager']
    }
  ];

  // Filter items matching user role
  const userRoleNormalized = normalizeRole(user?.role);
  const filteredItems = menuItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.map(normalizeRole).includes(userRoleNormalized)
  );


  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-secondary)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      color: 'var(--text-primary)',
      position: 'sticky',
      top: 0
    }}>
      {/* Brand Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(30, 144, 255, 0.05)'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent-color), #54a5ff)',
          padding: '0.4rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Crown size={22} style={{ color: '#fff' }} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '0.5px', color: 'var(--text-primary)' }}>
            Hures POS
          </h2>
        </div>
      </div>

      {/* Navigation list */}
      <nav style={{
        flex: 1,
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        overflowY: 'auto'
      }}>
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              textDecoration: 'none',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              background: isActive
                ? 'linear-gradient(135deg, var(--accent-color), #54a5ff)'
                : 'transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              boxShadow: isActive ? '0 4px 15px rgba(30, 144, 255, 0.3)' : 'none'
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Section & Logout */}
      <div style={{
        padding: '1rem 1.25rem',
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(30, 144, 255, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-color), #54a5ff)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1rem',
            boxShadow: '0 0 10px rgba(30, 144, 255, 0.4)'
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </span>
            <span style={{
              fontSize: '0.7rem',
              color: 'var(--accent-color)',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}>
              {user?.role}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            background: 'rgba(255, 77, 77, 0.1)',
            border: '1px solid rgba(255, 77, 77, 0.2)',
            color: '#ff4d4d',
            cursor: 'pointer',
            padding: '0.55rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            transition: 'all 0.2s',
            width: '100%'
          }}
          title="Đăng xuất"
        >
          <LogOut size={14} />
          <span>Đăng xuất</span>
        </button>
      </div>

      {/* Roster Badge */}
      <div style={{
        padding: '1.25rem',
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(0, 0, 0, 0.02)',
        fontSize: '0.75rem',
        textAlign: 'center',
        color: 'var(--text-secondary)'
      }}>
        Hệ thống KDS kết nối <span style={{ color: '#4caf50', fontWeight: 'bold' }}>● Online</span>
      </div>
    </aside>
  );
};
