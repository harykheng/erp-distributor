import { salesReps } from './salesReps'
import { orders, TODAY } from './orders'
import { outlets } from './outlets'
import { zones } from './salesReps'

export function repPerformance() {
  const y = TODAY.getFullYear()
  const m = TODAY.getMonth()
  return salesReps
    .map((rep) => {
      const monthlyOrders = orders.filter((o) => {
        const d = new Date(o.tanggal)
        return o.salesRepId === rep.id && d.getFullYear() === y && d.getMonth() === m
      })
      const capaian = monthlyOrders.reduce((s, o) => s + o.total, 0)
      const outletCount = outlets.filter((o) => o.salesRepId === rep.id).length
      const orderCount = monthlyOrders.length
      return {
        ...rep,
        capaian,
        persentase: Math.min(100, Math.round((capaian / rep.targetBulanan) * 100)),
        outletCount,
        orderCount,
      }
    })
    .sort((a, b) => b.capaian - a.capaian)
}

// rute kunjungan: grouping outlet per zona untuk rep tsb
export function ruteKunjungan(repId) {
  const repOutlets = outlets.filter((o) => o.salesRepId === repId && o.aktif)
  const byZone = {}
  repOutlets.forEach((o) => {
    if (!byZone[o.zona]) byZone[o.zona] = []
    byZone[o.zona].push(o)
  })
  return Object.entries(byZone).map(([zona, list]) => ({ zona, outlets: list }))
}

export { zones }
