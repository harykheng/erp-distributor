import { Link } from 'react-router-dom'
import { AlertTriangle, Info, AlertOctagon, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const styles = {
  danger: { icon: AlertOctagon, ring: 'border-bad/30', bg: 'bg-bad/10', text: 'text-bad' },
  warning: { icon: AlertTriangle, ring: 'border-warn/30', bg: 'bg-warn/10', text: 'text-warn' },
  info: { icon: Info, ring: 'border-brand/30', bg: 'bg-brand/10', text: 'text-brand' },
}

export default function InsightCard({ insight, index = 0 }) {
  const s = styles[insight.type] || styles.info
  const Icon = s.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        to={insight.link || '#'}
        className={`flex items-start gap-3 p-4 rounded-2xl border ${s.ring} bg-base-900 hover:bg-base-850 transition-colors shadow-card group`}
      >
        <div className={`w-9 h-9 rounded-xl ${s.bg} ${s.text} flex items-center justify-center shrink-0`}>
          <Icon size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-base-100">{insight.title}</div>
          <p className="text-xs text-base-400 mt-0.5 leading-relaxed">{insight.message}</p>
        </div>
        <ArrowRight size={15} className="text-base-600 group-hover:text-base-300 shrink-0 mt-1.5 transition-colors" />
      </Link>
    </motion.div>
  )
}
