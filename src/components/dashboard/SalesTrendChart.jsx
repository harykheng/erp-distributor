import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { formatRupiahCompact, formatDateShort } from '../../lib/format'

export default function SalesTrendChart({ data }) {
  return (
    <div className="rounded-2xl border border-base-800 bg-base-900 shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-base-100 text-sm">Tren Penjualan 30 Hari</h3>
          <p className="text-xs text-base-500 mt-0.5">Total nilai order per hari</p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF7A1A" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#FF7A1A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#212228" vertical={false} />
            <XAxis
              dataKey="tanggal"
              tickFormatter={(d) => formatDateShort(d)}
              tick={{ fill: '#7b7d87', fontSize: 11 }}
              axisLine={{ stroke: '#2a2b31' }}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tickFormatter={(v) => formatRupiahCompact(v)}
              tick={{ fill: '#7b7d87', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: '#16171a',
                border: '1px solid #2a2b31',
                borderRadius: 10,
                fontSize: 12,
              }}
              labelStyle={{ color: '#c9cad1' }}
              formatter={(v) => [formatRupiahCompact(v), 'Penjualan']}
              labelFormatter={(d) => formatDateShort(d)}
            />
            <Area type="monotone" dataKey="total" stroke="#FF7A1A" strokeWidth={2} fill="url(#salesGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
