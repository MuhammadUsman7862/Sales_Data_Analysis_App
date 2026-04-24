import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import ChartCard from '../components/ChartCard.jsx'
import SectionHeader from '../components/SectionHeader.jsx'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: '#f1f5f9', fontWeight: 600 }}>
          Revenue: ${Number(p.value).toLocaleString()}
        </div>
      ))}
    </div>
  )
}

export default function Trends({ data }) {
  if (!data) return null
  const monthly = data.monthly_trend || []
  const region = data.region_breakdown || []

  // Compute MoM growth
  const withGrowth = monthly.map((m, i) => {
    if (i === 0) return { ...m, growth: 0 }
    const prev = monthly[i - 1].revenue
    const growth = prev > 0 ? (((m.revenue - prev) / prev) * 100).toFixed(1) : 0
    return { ...m, growth: parseFloat(growth) }
  })

  const maxRev = Math.max(...monthly.map(m => m.revenue))
  const peakMonth = monthly.find(m => m.revenue === maxRev)

  const totalRevenue = monthly.reduce((s, m) => s + m.revenue, 0)
  const avgMonthly = totalRevenue / (monthly.length || 1)

  return (
    <div>
      <SectionHeader title="Sales Trends" sub="Monthly performance and growth analysis" />

      {/* Summary stat pills */}
      <div className="fade-up" style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Peak Month', value: peakMonth?.month || '—', color: '#3b82f6' },
          { label: 'Peak Revenue', value: `$${(maxRev/1000).toFixed(1)}K`, color: '#10b981' },
          { label: 'Avg Monthly', value: `$${(avgMonthly/1000).toFixed(1)}K`, color: '#f59e0b' },
          { label: 'Total Annual', value: `$${(totalRevenue/1000).toFixed(1)}K`, color: '#8b5cf6' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '10px 18px', borderRadius: 999,
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'flex', gap: 10, alignItems: 'center',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{s.label}:</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Area chart */}
      <ChartCard title="Monthly Revenue — Area View" sub="Shaded area shows cumulative revenue pattern" style={{ marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthly} margin={{ top: 4, right: 10, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#areaGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* MoM growth */}
        <ChartCard title="Month-over-Month Growth (%)" sub="Percentage change vs previous month">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={withGrowth.slice(1)} margin={{ top: 4, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v) => [`${v}%`, 'Growth']} contentStyle={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="growth" radius={[3, 3, 0, 0]}>
                {withGrowth.slice(1).map((m, i) => (
                  <Cell key={i} fill={m.growth >= 0 ? '#10b981' : '#f43f5e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Region breakdown */}
        {region.length > 0 ? (
          <ChartCard title="Revenue by Region" sub="Geographic performance comparison">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={region} margin={{ top: 4, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="region" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} contentStyle={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {region.map((_, i) => <Cell key={i} fill={['#3b82f6','#06b6d4','#10b981','#f59e0b'][i % 4]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        ) : (
          <ChartCard title="Monthly Revenue Table" sub="Raw monthly revenue values">
            <div style={{ overflowY: 'auto', maxHeight: 200 }}>
              {monthly.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span style={{ color: 'var(--text2)', fontSize: 13 }}>{m.month}</span>
                  <span style={{ color: '#10b981', fontWeight: 600, fontSize: 13 }}>${m.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  )
}
