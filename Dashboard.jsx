import { DollarSign, ShoppingCart, TrendingUp, Package } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import KpiCard from '../components/KpiCard.jsx'
import ChartCard from '../components/ChartCard.jsx'
import SectionHeader from '../components/SectionHeader.jsx'

const fmt = (n) => n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toFixed(0)}`
const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8, padding: '10px 14px', fontSize: 13,
    }}>
      <div style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#fff', fontWeight: 600 }}>
          {typeof p.value === 'number' && p.value > 100 ? `$${p.value.toLocaleString()}` : p.value}
        </div>
      ))}
    </div>
  )
}

export default function Dashboard({ data }) {
  if (!data) return null
  const { kpis, monthly_trend, top_products, category_breakdown, data_quality } = data

  const topFive = (top_products || []).slice(0, 5)

  return (
    <div>
      <SectionHeader
        title="Dashboard Overview"
        sub={`Dataset: ${data_quality?.total_rows?.toLocaleString()} rows · ${data_quality?.date_range?.start} → ${data_quality?.date_range?.end}`}
      />

      {/* KPIs */}
      <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        <KpiCard label="Total Revenue"    value={fmt(kpis.total_revenue)}      sub="Full period"               color="#3b82f6" icon={DollarSign} delay={0} />
        <KpiCard label="Total Orders"     value={kpis.total_orders.toLocaleString()} sub="Transactions"         color="#06b6d4" icon={ShoppingCart} delay={1} />
        <KpiCard label="Avg Order Value"  value={fmt(kpis.avg_order_value)}    sub="Per transaction"           color="#10b981" icon={TrendingUp}  delay={2} />
        <KpiCard label="Units Sold"       value={kpis.total_units.toLocaleString()} sub="Total quantity"        color="#f59e0b" icon={Package}     delay={3} />
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <ChartCard title="Monthly Revenue Trend" sub="Total revenue aggregated by month">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthly_trend} margin={{ top: 4, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" stroke="url(#lineGrad)" strokeWidth={3} dot={false} activeDot={{ r: 5, fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Category Breakdown" sub="Revenue by category">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={category_breakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="revenue" nameKey="category" paddingAngle={3}>
                {category_breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `$${v.toLocaleString()}`} contentStyle={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 8 }}>
            {category_breakdown.slice(0, 6).map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text3)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                {c.category}
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <ChartCard title="Top 5 Products by Revenue" sub="Ranked by total revenue">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topFive} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="product" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {topFive.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Data quality card */}
        <ChartCard title="Data Quality Report" sub="Dataset health metrics">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
            {[
              { label: 'Total Rows',    value: data_quality.total_rows?.toLocaleString(), color: '#10b981' },
              { label: 'Null Values',   value: data_quality.null_values, color: data_quality.null_values > 0 ? '#f59e0b' : '#10b981' },
              { label: 'Duplicates',    value: data_quality.duplicates,  color: data_quality.duplicates > 0 ? '#f43f5e' : '#10b981' },
              { label: 'Date Range',    value: `${data_quality.date_range?.start} → ${data_quality.date_range?.end}`, color: '#3b82f6' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, background: 'var(--surface2)' }}>
                <span style={{ fontSize: 13, color: 'var(--text3)' }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
