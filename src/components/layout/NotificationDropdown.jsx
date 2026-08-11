import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, AlertTriangle, Info, BellOff } from 'lucide-react'
import { api } from '../../data/api'
import { useAppStore } from '../../store/useAppStore'

const styles = {
  danger: { icon: AlertTriangle, iconWrap: 'bg-bad/15 text-bad' },
  warning: { icon: AlertTriangle, iconWrap: 'bg-warn/15 text-warn' },
  info: { icon: Info, iconWrap: 'bg-base-800 text-base-400' },
}

export default function NotificationDropdown() {
  const dataVersion = useAppStore((s) => s.dataVersion)
  const [open, setOpen] = useState(false)
  const [insights, setInsights] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    api.getInsights().then(setInsights)
  }, [dataVersion])

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 hidden sm:flex items-center justify-center rounded-lg border border-base-700 bg-base-850 text-base-400 hover:text-base-100"
      >
        <Bell size={16} />
        {insights.length > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 w-80 rounded-2xl border border-base-800 bg-base-900 shadow-pop overflow-hidden z-30"
          >
            <div className="px-4 py-3 border-b border-base-800">
              <h3 className="text-sm font-bold text-base-100">Notifikasi</h3>
              <p className="text-xs text-base-500">{insights.length} hal perlu perhatian</p>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-base-800">
              {insights.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <BellOff size={22} className="text-base-600 mb-2" />
                  <p className="text-sm text-base-500">Belum ada notifikasi baru</p>
                </div>
              ) : (
                insights.map((ins) => {
                  const s = styles[ins.type] || styles.info
                  const Icon = s.icon
                  return (
                    <Link
                      key={ins.id}
                      to={ins.link || '#'}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-base-850 transition-colors"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${s.iconWrap}`}>
                        <Icon size={13} strokeWidth={2.25} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-base-100 leading-snug">{ins.title}</div>
                        <p className="text-xs text-base-400 mt-0.5 leading-relaxed">{ins.message}</p>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
