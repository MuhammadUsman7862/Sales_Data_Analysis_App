import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import ChartCard from '../components/ChartCard.jsx'
import SectionHeader from '../components/SectionHeader.jsx'

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#ec4899', '#14b8a6', '#a855f7', '#fb923c']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#fff' }}>{p.name}: {p.name === 'revenue' ? `$${Number(p.value).toLocaleString()}` : p.value.toLocaleString()}</div>
      ))}
    </div>
  )
}

export default function Products({ data }) {
  if (!data) return null
  const products = data.top_products || []
  const total = products.reduce((s, p) => s + p.revenue, 0)

  return (
    <div>
      <SectionHeader title="Product Analysis" sub="Revenue, units, and order breakdown per product" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <ChartCard title="Revenue by Product" sub="Top products ranked">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={products} margin={{ top: 4, right: 10, bottom: 40, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="product" tick={{ fill: '#475569', fontSize: 10 }} angle={-30} textAnchor="end" axisLine={false} tickLine={false} interval={0} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {products.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Units Sold by Product" sub="Volume comparison">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={products} margin={{ top: 4, right: 10, bottom: 40, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="product" tick={{ fill: '#475569', fontSize: 10 }} angle={-30} textAnchor="end" axisLine={false} tickLine={false} interval={0} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="units" radius={[4, 4, 0, 0]}>
                {products.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.8} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Product table */}
      <ChartCard title="Full Product Leaderboard" sub="All products ranked by revenue">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Rank', 'Product', 'Revenue', '% Share', 'Units', 'Orders'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 14px', color: 'var(--text3)', fontWeight: 500, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => {
                const share = total > 0 ? ((p.revenue / total) * 100).toFixed(1) : 0
                return (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        width: 24, height: 24, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        background: i < 3 ? COLORS[i] + '22' : 'var(--surface2)',
                        color: i < 3 ? COLORS[i] : 'var(--text3)',
                        fontSize: 11, fontWeight: 700,
                      }}>{i + 1}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{p.product}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#10b981', fontWeight: 600 }}>${p.revenue.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 4, background: 'var(--surface2)', borderRadius: 2, maxWidth: 80 }}>
                          <div style={{ width: `${share}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: 2 }} />
                        </div>
                        <span style={{ color: 'var(--text3)', fontSize: 12 }}>{share}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>{p.units.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>{p.orders.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
