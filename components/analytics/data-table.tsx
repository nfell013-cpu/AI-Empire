'use client';

import { useState, useMemo } from 'react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: Array<Record<string, any>>;
  title?: string;
  pageSize?: number;
}

export default function DataTable({ columns, data, title, pageSize = 10 }: DataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    if (!filter) return data;
    return data.filter((row) =>
      columns.some((col) =>
        String(row[col.key] ?? '').toLowerCase().includes(filter.toLowerCase())
      )
    );
  }, [data, filter, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const pageData = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(51, 65, 85, 0.5)',
      borderRadius: '12px',
      padding: '20px',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        {title && (
          <h4 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 600 }}>{title}</h4>
        )}
        <input
          type="text"
          placeholder="Filter..."
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(0); }}
          style={{
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '6px 12px',
            color: '#f1f5f9',
            fontSize: '13px',
            outline: 'none',
          }}
        />
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    color: '#94a3b8',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #334155',
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label}
                  {sortKey === col.key && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                  No data available
                </td>
              </tr>
            ) : (
              pageData.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: '10px 12px', color: '#e2e8f0', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <span style={{ color: '#64748b', fontSize: '12px' }}>
            {sorted.length} results · Page {page + 1} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              style={{
                background: page === 0 ? '#1e293b' : '#334155',
                border: '1px solid #475569',
                borderRadius: '6px',
                padding: '4px 12px',
                color: page === 0 ? '#475569' : '#e2e8f0',
                fontSize: '12px',
                cursor: page === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Prev
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              style={{
                background: page >= totalPages - 1 ? '#1e293b' : '#334155',
                border: '1px solid #475569',
                borderRadius: '6px',
                padding: '4px 12px',
                color: page >= totalPages - 1 ? '#475569' : '#e2e8f0',
                fontSize: '12px',
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
