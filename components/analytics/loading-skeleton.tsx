'use client';

export default function LoadingSkeleton({ rows = 4, showChart = true }: { rows?: number; showChart?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stat cards skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(51, 65, 85, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          >
            <div style={{ background: '#1e293b', height: '14px', width: '60%', borderRadius: '4px', marginBottom: '12px' }} />
            <div style={{ background: '#1e293b', height: '28px', width: '40%', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ background: '#1e293b', height: '12px', width: '80%', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
      {showChart && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(51, 65, 85, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          height: '320px',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          <div style={{ background: '#1e293b', height: '16px', width: '30%', borderRadius: '4px', marginBottom: '16px' }} />
          <div style={{ background: '#1e293b', height: '240px', width: '100%', borderRadius: '8px' }} />
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
