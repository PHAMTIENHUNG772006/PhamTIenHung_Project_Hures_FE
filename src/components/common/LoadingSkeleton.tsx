import React from 'react';

interface LoadingSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  count?: number;
  style?: React.CSSProperties;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '8px',
  count = 1,
  style = {},
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          style={{
            width,
            height,
            borderRadius,
            background: 'linear-gradient(90deg, var(--border-color) 25%, var(--bg-secondary) 50%, var(--border-color) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeletonLoading 1.5s infinite linear',
            ...style,
          }}
        />
      ))}
    </div>
  );
};
