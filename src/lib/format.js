export function formatRupiah(value) {
  const n = Math.round(value || 0)
  return 'Rp ' + n.toLocaleString('id-ID')
}

export function formatRupiahCompact(value) {
  const n = value || 0
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, '')} M`
  if (abs >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')} Jt`
  if (abs >= 1_000) return `Rp ${(n / 1_000).toFixed(0)} Rb`
  return formatRupiah(n)
}

export function formatDate(date) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateShort(date) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

export function daysBetween(a, b) {
  const d1 = typeof a === 'string' ? new Date(a) : a
  const d2 = typeof b === 'string' ? new Date(b) : b
  return Math.round((d2.setHours(0, 0, 0, 0) - d1.setHours(0, 0, 0, 0)) / 86400000)
}

export function timeAgo(date) {
  const d = typeof date === 'string' ? new Date(date) : date
  const diffMs = Date.now() - d.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return formatDate(d)
}
