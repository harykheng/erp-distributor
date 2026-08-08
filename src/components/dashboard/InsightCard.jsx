import { Link } from 'react-router-dom'
import { AlertTriangle, Info } from 'lucide-react'
import { motion } from 'framer-motion'

const styles = {
  danger: {
    icon: AlertTriangle,
    card: 'border-bad/30 bg-bad/[0.06] hover:bg-bad/[0.1]',
    iconWrap: 'bg-bad/15 text-bad',
  },
  warning: {
    icon: AlertTriangle,
    card: 'border-warn/30 bg-warn/[0.06] hover:bg-warn/[0.1]',
    iconWrap: 'bg-warn/15 text-warn',
  },
  info: {
    icon: Info,
    card: 'border-base-800 bg-base-850 hover:bg-base-800/70',
    iconWrap: 'bg-base-800 text-base-400',
  },
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
        className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors shadow-card h-full ${s.card}`}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${s.iconWrap}`}>
          <Icon size={15} strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-base-100 leading-snug">{insight.title}</div>
          <p className="text-xs text-base-400 mt-1 leading-relaxed">{insight.message}</p>
        </div>
      </Link>
    </motion.div>
  )
}
