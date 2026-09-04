import React, { useState } from 'react';
import { useBranch } from '../../hooks/useBranch';
import { ChevronDown, MapPin } from 'lucide-react';

export const BranchSwitcher: React.FC = () => {
  const { currentBranchId, activeBranch, branches, setCurrentBranch } = useBranch();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(30, 144, 255, 0.05)',
          border: '1px solid var(--border-color)',
          padding: '0.5rem 1rem',
          borderRadius: '12px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontWeight: 500,
          fontSize: '0.9rem',
          transition: 'all 0.2s',
        }}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      >
        <MapPin size={16} style={{ color: 'var(--accent-color)' }} />
        <span style={{
          maxWidth: '180px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>{activeBranch?.name}</span>
        <ChevronDown size={14} style={{ opacity: 0.7 }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '120%',
          right: 0,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          boxShadow: '0 12px 30px rgba(30, 144, 255, 0.15)',
          width: '300px',
          zIndex: 1000,
          overflow: 'hidden',
          padding: '0.5rem 0',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            color: 'var(--accent-color)',
            fontWeight: 700,
            padding: '0.5rem 1rem 0.25rem 1rem',
            letterSpacing: '1px'
          }}>Chọn Chi Nhánh</div>
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                setCurrentBranch(b.id);
                setIsOpen(false);
                // Force a query invalidate by refetching page contents
                window.location.reload();
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.8rem 1.2rem',
                background: b.id === currentBranchId ? 'rgba(30, 144, 255, 0.15)' : 'transparent',
                border: 'none',
                color: b.id === currentBranchId ? 'var(--accent-color)' : '#eee',
                cursor: 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.name}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{b.address}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
