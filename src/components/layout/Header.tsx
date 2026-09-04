import React from 'react';
import { BranchSwitcher } from './BranchSwitcher';
import { Bell } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '70px',
      background: 'var(--bg-secondary)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 2rem',
      color: 'var(--text-primary)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Hệ Thống Quản Trị Nhà Hàng
        </h3>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <BranchSwitcher />

        <button style={{
          background: 'rgba(255,255,255,0.05)',
          border: 'none',
          borderRadius: '10px',
          color: '#eee',
          padding: '0.6rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          position: 'relative'
        }}>
          <Bell size={18} />
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#ff4d4d'
          }}></span>
        </button>
      </div>
    </header>
  );
};
