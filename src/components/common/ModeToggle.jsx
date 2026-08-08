import { useAppStore } from '../../store/useAppStore'
import { Sparkles, Table2 } from 'lucide-react'

export default function ModeToggle() {
  const mode = useAppStore((s) => s.mode)
  const toggleMode = useAppStore((s) => s.toggleMode)

  return (
    <button
      onClick={toggleMode}
      className="relative flex items-center bg-base-850 border border-base-700 rounded-full p-1 text-xs font-semibold"
      title="Ganti tampilan Simple / Power Mode"
    >
      <span
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-brand transition-all duration-200 ${
          mode === 'simple' ? 'left-1' : 'left-[calc(50%+3px)]'
        }`}
      />
      <span className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${mode === 'simple' ? 'text-base-950' : 'text-base-400'}`}>
        <Sparkles size={13} /> Simple
      </span>
      <span className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${mode === 'power' ? 'text-base-950' : 'text-base-400'}`}>
        <Table2 size={13} /> Power
      </span>
    </button>
  )
}
