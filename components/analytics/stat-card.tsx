'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'yellow';
}

const colorMap = {
  green: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: '#10b981', glow: '0 0 20px rgba(16, 185, 129, 0.15)' },
  blue: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6', glow: '0 0 20px rgba(59, 130, 246, 0.15)' },
  purple: { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.3)', text: '#8b5cf6', glow: '0 0 20px rgba(139, 92, 246, 0.15)' },
  orange: { bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.3)', text: '#f97316', glow: '0 0 20px rgba(249, 115, 22, 0.15)' },
  red: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444', glow: '0 0 20px rgba(239, 68, 68, 0.15)' },
  yellow: { bg: 'rgba(234, 179, 8, 0.1)', border: 'rgba(234, 179, 8, 0.3)', text: '#eab308', glow: '0 0 20px rgba(234, 179, 8, 0.15)' },
};

export default function StatCard({ title, value, subtitle, icon, trend, color = 'green' }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: colors.glow,
        transition: 'all 0.3s ease',
      }}
      className="hover:scale-[1.02]"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </p>
          <p style={{ color: '#f1f5f9', fontSize: '28px', fontWeight: 700, lineHeight: 1.2 }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>{subtitle}</p>
          )}
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
              <span style={{
                color: trend.value >= 0 ? '#10b981' : '#ef4444',
                fontSize: '13px',
                fontWeight: 600,
              }}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span style={{ color: '#64748b', fontSize: '12px' }}>{trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div style={{
            background: colors.bg,
            borderRadius: '10px',
            padding: '10px',
            color: colors.text,
          }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
