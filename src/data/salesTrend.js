import { orders, TODAY } from './orders'

function isoDate(d) {
  return d.toISOString().slice(0, 10)
}
function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function salesTrend30() {
  const days = []
  for (let i = 29; i >= 0; i--) {
    days.push(isoDate(addDays(TODAY, -i)))
  }
  const map = Object.fromEntries(days.map((d) => [d, 0]))
  orders.forEach((o) => {
    if (map[o.tanggal] !== undefined) map[o.tanggal] += o.total
  })
  return days.map((d) => ({ tanggal: d, total: map[d] }))
}

export function penjualanBulanIni() {
  const y = TODAY.getFullYear()
  const m = TODAY.getMonth()
  return orders
    .filter((o) => {
      const d = new Date(o.tanggal)
      return d.getFullYear() === y && d.getMonth() === m
    })
    .reduce((sum, o) => sum + o.total, 0)
}
