import { Search, Plus } from 'lucide-react'
import ThemeToggle from '../common/ThemeToggle'
import NotificationDropdown from './NotificationDropdown'
import { useAppStore } from '../../store/useAppStore'

export default function Topbar({ title, subtitle }) {
  const openCommandPalette = useAppStore((s) => s.openCommandPalette)
  const openOrderDrawer = useAppStore((s) => s.openOrderDrawer)
  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform || navigator.userAgent)

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 h-16 px-4 md:px-6 border-b border-base-800 bg-base-950/80 backdrop-blur-md">
      <div className="min-w-0">
        <h1 className="text-base md:text-lg font-bold text-base-100 truncate">{title}</h1>
        {subtitle && <p className="text-xs text-base-500 hidden sm:block truncate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={openCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-base-700 bg-base-850 text-base-400 text-sm hover:text-base-100 hover:border-base-600 transition-colors"
        >
          <Search size={15} />
          <span>Cari order, outlet, produk...</span>
          <kbd className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-base-800 border border-base-700 text-base-500">
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>
        </button>
        <button
          onClick={openCommandPalette}
          className="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-base-700 bg-base-850 text-base-400"
        >
          <Search size={16} />
        </button>
        <NotificationDropdown />
        <ThemeToggle />
        <button
          onClick={openOrderDrawer}
          className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg bg-brand text-ink text-sm font-bold hover:bg-brand-400 transition-colors shadow-card"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">Order Baru</span>
        </button>
      </div>
    </header>
  )
}
