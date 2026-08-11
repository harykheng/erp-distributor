import { motion } from 'framer-motion'

export default function KpiCard({ label, value, sub, icon: Icon, accent = 'brand', trend, valueClassName = '' }) {
  const accentClasses = {
    brand: 'text-brand bg-brand/10',
    good: 'text-good bg-good/10',
    warn: 'text-warn bg-warn/10',
    bad: 'text-bad bg-bad/10',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-base-800 bg-base-900 shadow-card p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-base-400 font-medium">{label}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentClasses[accent]}`}>
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
      </div>
      <div className={`text-2xl md:text-3xl font-extrabold tracking-tight leading-none ${valueClassName || 'text-base-100'}`}>
        {value}
      </div>
      {sub && (
        <div className="flex items-center gap-1.5 text-xs">
          {trend && (
            <span className={trend > 0 ? 'text-good' : trend < 0 ? 'text-bad' : 'text-base-400'}>
              {trend > 0 ? '▲' : trend < 0 ? '▼' : ''} {Math.abs(trend)}%
            </span>
          )}
          <span className="text-base-400">{sub}</span>
        </div>
      )}
    </motion.div>
  )
}
