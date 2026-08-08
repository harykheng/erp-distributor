import { formatRupiahCompact } from '../../lib/format'

export default function AgingBar({ buckets, total, size = 'md' }) {
  const height = size === 'sm' ? 'h-2' : 'h-3'
  return (
    <div className="w-full">
      <div className={`w-full ${height} rounded-full overflow-hidden bg-base-800 flex`}>
        {buckets.map((b) => {
          const pct = total > 0 ? (b.total / total) * 100 : 0
          if (pct <= 0) return null
          return (
            <div
              key={b.key}
              style={{ width: `${pct}%`, backgroundColor: b.color }}
              className="h-full transition-all"
              title={`${b.label}: ${formatRupiahCompact(b.total)}`}
            />
          )
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {buckets.map((b) => (
          <div key={b.key} className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
            <span className="text-base-400">{b.label}</span>
            <span className="text-base-200 font-semibold">{formatRupiahCompact(b.total)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
