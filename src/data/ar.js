import { orders, TODAY } from './orders'
import { outlets } from './outlets'
import { daysBetween, formatRupiah, formatDate } from '../lib/format'
import { waLink } from '../lib/whatsapp'

export const agingBuckets = [
  { key: 'belum_jatuh_tempo', label: 'Belum Jatuh Tempo', color: '#22c55e' },
  { key: 'lewat_1_7', label: '1-7 Hari', color: '#eab308' },
  { key: 'lewat_8_30', label: '8-30 Hari', color: '#f97316' },
  { key: 'lewat_30', label: '> 30 Hari', color: '#ef4444' },
]

export function getAgingBucket(jatuhTempo) {
  const overdueDays = daysBetween(new Date(jatuhTempo), new Date(TODAY))
  if (overdueDays <= 0) return 'belum_jatuh_tempo'
  if (overdueDays <= 7) return 'lewat_1_7'
  if (overdueDays <= 30) return 'lewat_8_30'
  return 'lewat_30'
}

export function overdueDaysOf(jatuhTempo) {
  return daysBetween(new Date(jatuhTempo), new Date(TODAY))
}

// Piutang = order yang sudah dikirim tapi belum lunas penuh.
// Dihitung ulang tiap dipanggil (bukan cache statis) supaya selalu ikut
// perubahan pembayaran/order terbaru dalam sesi yang sama.
export function getReceivables() {
  return orders
    .filter((o) => o.isSent && o.dibayar < o.total)
    .map((o) => {
      const outlet = outlets.find((x) => x.id === o.outletId)
      const sisa = o.total - o.dibayar
      return {
        id: `ar-${o.id}`,
        orderId: o.id,
        nomorOrder: o.nomor,
        outletId: o.outletId,
        outletNama: outlet?.nama,
        outletTelepon: outlet?.telepon,
        salesRepId: o.salesRepId,
        tanggalOrder: o.tanggal,
        jatuhTempo: o.jatuhTempo,
        total: o.total,
        dibayar: o.dibayar,
        sisa,
        bucket: getAgingBucket(o.jatuhTempo),
        overdueDays: overdueDaysOf(o.jatuhTempo),
      }
    })
    .sort((a, b) => new Date(a.jatuhTempo) - new Date(b.jatuhTempo))
}

export function totalPiutang() {
  return getReceivables().reduce((sum, r) => sum + r.sisa, 0)
}

export function piutangByBucket() {
  const receivables = getReceivables()
  const map = Object.fromEntries(agingBuckets.map((b) => [b.key, 0]))
  receivables.forEach((r) => {
    map[r.bucket] += r.sisa
  })
  return agingBuckets.map((b) => ({ ...b, total: map[b.key] }))
}

export function piutangByOutlet(outletId) {
  return getReceivables().filter((r) => r.outletId === outletId)
}

export function waReminderLink(receivable) {
  const msg = `Halo ${receivable.outletNama}, mengingatkan tagihan order ${receivable.nomorOrder} sebesar ${formatRupiah(receivable.sisa)} yang jatuh tempo pada ${formatDate(receivable.jatuhTempo)}. Mohon konfirmasi pembayarannya ya. Terima kasih 🙏`
  return waLink(receivable.outletTelepon, msg)
}
