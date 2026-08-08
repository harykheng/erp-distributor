import { Sun, Moon } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

export default function ThemeToggle() {
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const isLight = theme === 'light'

  return (
    <button
      onClick={toggleTheme}
      title={isLight ? 'Ganti ke Dark Mode' : 'Ganti ke Light Mode'}
      className="w-9 h-9 flex items-center justify-center rounded-lg border border-base-700 bg-base-850 text-base-400 hover:text-base-100 hover:border-base-600 transition-colors"
    >
      {isLight ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  )
}
