import { ShoppingCart, Wallet, Truck, Undo2 } from 'lucide-react'
import { timeAgo } from '../../lib/format'

const iconMap = {
  order: { icon: ShoppingCart, color: 'text-brand bg-brand/10' },
  payment: { icon: Wallet, color: 'text-good bg-good/10' },
  shipment: { icon: Truck, color: 'text-blue-400 bg-blue-400/10' },
  return: { icon: Undo2, color: 'text-warn bg-warn/10' },
}

export default function ActivityFeed({ events }) {
  return (
    <div className="rounded-2xl border border-base-800 bg-base-900 shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base-100 text-sm">Activity Feed</h3>
        <span className="flex items-center gap-1.5 text-xs text-good">
          <span className="w-1.5 h-1.5 rounded-full bg-good animate-pulse-dot" /> Live
        </span>
      </div>
      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 scrollbar-none">
        {events.map((e) => {
          const meta = iconMap[e.type] || iconMap.order
          const Icon = meta.icon
          return (
            <div key={e.id} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                <Icon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-base-200 leading-snug">{e.title}</div>
                <div className="text-xs text-base-500 mt-0.5">{e.detail}</div>
              </div>
              <span className="text-[11px] text-base-600 shrink-0 whitespace-nowrap">{timeAgo(e.ts)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
