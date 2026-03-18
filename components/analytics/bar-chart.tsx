'use client';

import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface BarChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  bars: Array<{ key: string; color: string; name?: string }>;
  title?: string;
  height?: number;
}

export default function BarChart({ data, xKey, bars, title, height = 300 }: BarChartProps) {
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
        <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.5)" />
          <XAxis dataKey={xKey} stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontSize: '13px',
            }}
          />
          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '13px' }} />
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              fill={bar.color}
              name={bar.name || bar.key}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
