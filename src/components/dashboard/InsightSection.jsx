import { Sparkles } from 'lucide-react'
import InsightCard from './InsightCard'

export default function InsightSection({ insights }) {
  if (!insights?.length) return null
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles size={15} className="text-brand" />
        <h3 className="text-sm font-bold text-brand">AI-Assisted Insight</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {insights.map((ins, i) => (
          <InsightCard key={ins.id} insight={ins} index={i} />
        ))}
      </div>
    </div>
  )
}
