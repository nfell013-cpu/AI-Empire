'use client';

import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  height?: number;
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#ef4444',
  '#eab308', '#06b6d4', '#ec4899', '#14b8a6', '#f59e0b',
  '#6366f1', '#84cc16',
];

export default function PieChart({ data, title, height = 300, colors = DEFAULT_COLORS }: PieChartProps) {
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(51, 65, 85, 0.5)',
      borderRadius: '12px',
      padding: '20px',
    }}>
      {title && (
        <h4 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          {title}
        </h4>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={{ stroke: '#64748b' }}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontSize: '13px',
            }}
          />
          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
