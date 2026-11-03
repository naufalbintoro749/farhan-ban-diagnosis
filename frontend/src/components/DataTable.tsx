import React, { useState } from 'react';

export interface Column<T> {
  key: string;
  title: string;
  render?: (row: T, index: number) => React.ReactNode;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  onAdd?: () => void;
  addLabel?: string;
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  searchPlaceholder = 'Cari data...',
  searchFilter,
  onAdd,
  addLabel = '+ Tambah Data',
  title,
  subtitle,
  emptyMessage = 'Tidak ada data yang tersedia.',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();

    if (searchFilter) {
      return data.filter((item) => searchFilter(item, q));
    }

    // Default search across all primitive fields
    return data.filter((item) =>
      Object.values(item).some(
        (val) =>
          typeof val === 'string' && val.toLowerCase().includes(q) ||
          typeof val === 'number' && String(val).includes(q)
      )
    );
  }, [data, searchQuery, searchFilter]);

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--slate-200)',
        overflow: 'hidden',
      }}
    >
      {/* Table Header Section */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--slate-200)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          {title && (
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-800)', margin: 0 }}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', margin: '0.2rem 0 0' }}>
              {subtitle} ({data.length} item)
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '0.55rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-300)',
              fontSize: '0.88rem',
              outline: 'none',
              minWidth: '220px',
            }}
          />
          {onAdd && (
            <button
              onClick={onAdd}
              style={{
                padding: '0.55rem 1rem',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              {addLabel}
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '0.75rem 1rem',
                    color: 'var(--slate-600)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    width: col.width,
                  }}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="spinner-primary" />
                    <span style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Memuat data...</span>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: '3rem 1rem',
                    textAlign: 'center',
                    color: 'var(--slate-400)',
                    fontStyle: 'italic',
                  }}
                >
                  {searchQuery ? 'Tidak ada data yang sesuai dengan pencarian.' : emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr
                  key={row.id ?? idx}
                  style={{
                    borderBottom: '1px solid var(--slate-100)',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-50)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding: '0.85rem 1rem',
                        color: 'var(--slate-800)',
                        verticalAlign: 'middle',
                      }}
                    >
                      {col.render ? col.render(row, idx) : row[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer bar */}
      <div
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: 'var(--slate-50)',
          borderTop: '1px solid var(--slate-200)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: 'var(--slate-500)',
        }}
      >
        <span>
          Menampilkan {filteredData.length} dari {data.length} data
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Reset Pencarian
          </button>
        )}
      </div>
    </div>
  );
}

export default DataTable;
