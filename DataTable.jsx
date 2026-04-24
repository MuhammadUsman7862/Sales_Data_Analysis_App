import { useState } from 'react'
import ChartCard from '../components/ChartCard.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { Search } from 'lucide-react'

export default function DataTable({ data }) {
  const [search, setSearch] = useState('')

  if (!data) return null
  const sample = data.sample || []
  const columns = data.columns || []

  const filtered = sample.filter(row =>
    Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <SectionHeader title="Raw Data Preview" sub="First 8 rows of your dataset after cleaning" />

      {/* Schema pills */}
      <div className="fade-up" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {columns.map((col, i) => (
          <span key={i} style={{
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
            color: '#60a5fa', fontSize: 12, fontFamily: 'monospace',
          }}>
            {col}
          </span>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16, maxWidth: 320 }}>
        <Search size={14} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search rows…"
          style={{
            width: '100%', padding: '9px 12px 9px 34px', borderRadius: 8,
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--text)', fontSize: 13, outline: 'none',
            fontFamily: 'var(--font-body)',
          }}
        />
      </div>

      <ChartCard>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {columns.map(col => (
                  <th key={col} style={{
                    textAlign: 'left', padding: '8px 14px',
                    color: 'var(--text3)', fontWeight: 500, fontSize: 11,
                    letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {columns.map(col => {
                    const val = row[col]
                    const isNum = typeof val === 'number'
                    const isRev = col === 'revenue'
                    return (
                      <td key={col} style={{
                        padding: '10px 14px', whiteSpace: 'nowrap',
                        color: isRev ? '#10b981' : isNum ? 'var(--text2)' : 'var(--text)',
                        fontWeight: isRev ? 600 : 400,
                        fontFamily: isNum ? 'monospace' : 'inherit',
                      }}>
                        {isRev ? `$${Number(val).toLocaleString()}` : String(val ?? '—')}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
              No matching rows found.
            </div>
          )}
        </div>
        <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text3)', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          Showing {filtered.length} of {sample.length} preview rows · Full dataset: {data.data_quality?.total_rows?.toLocaleString()} rows
        </div>
      </ChartCard>
    </div>
  )
}
