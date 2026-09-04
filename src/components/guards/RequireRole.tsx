import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types/api.types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: (UserRole | string)[];
  fallbackPath?: string;
}

const normalizeRole = (role?: string): string => {
  if (!role) return '';
  const lower = role.toLowerCase();
  if (lower === 'kitchen') return 'chef';
  return lower;
};

export const RequireRole: React.FC<RequireRoleProps> = ({
  children,
  allowedRoles,
  fallbackPath,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = normalizeRole(user.role);
  const normalizedAllowed = allowedRoles.map((r) => normalizeRole(r));

  const hasPermission = normalizedAllowed.includes(userRole);

  if (!hasPermission) {
    if (fallbackPath) {
      return <Navigate to={fallbackPath} replace />;
    }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '75vh',
          color: 'var(--text-primary)',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid rgba(255, 77, 77, 0.3)',
            borderRadius: '20px',
            padding: '3rem 2.5rem',
            backdropFilter: 'blur(20px)',
            maxWidth: '520px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: '1rem',
              borderRadius: '50%',
              background: 'rgba(255, 77, 77, 0.1)',
              color: '#ff4d4d',
              marginBottom: '1.25rem',
            }}
          >
            <ShieldAlert size={42} />
          </div>
          <h2 style={{ color: '#ff4d4d', margin: '0 0 0.75rem 0', fontSize: '1.6rem', fontWeight: 800 }}>
            Quyền Truy Cập Bị Từ Chối (403)
          </h2>
          <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Tài khoản của bạn với vai trò <strong style={{ color: 'var(--accent-color)' }}>{user.role.toUpperCase()}</strong> không có quyền truy cập vào phân hệ này.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={() => window.history.back()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgba(30, 144, 255, 0.1)',
                color: 'var(--accent-color)',
                border: '1px solid rgba(30, 144, 255, 0.3)',
                borderRadius: '10px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} /> Quay lại
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--accent-color)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Backwards-compatible export
export const RoleGuard = RequireRole;
