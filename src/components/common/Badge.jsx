const variants = {
  default: 'bg-base-800 text-base-200 border-base-700',
  brand: 'bg-brand/10 text-brand border-brand/30',
  good: 'bg-good/10 text-good border-good/30',
  warn: 'bg-warn/10 text-warn border-warn/30',
  bad: 'bg-bad/10 text-bad border-bad/30',
}

export default function Badge({ children, variant = 'default', dot = false, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export const statusVariant = {
  draft: 'default',
  diproses: 'warn',
  dikirim: 'brand',
  lunas: 'good',
}

export const statusLabel = {
  draft: 'Draft',
  diproses: 'Diproses',
  dikirim: 'Dikirim',
  lunas: 'Lunas',
}
