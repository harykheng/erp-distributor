import { orders, TODAY } from './orders'
import { returns } from './returns'
import { outlets } from './outlets'
import { salesReps } from './salesReps'
import { formatRupiah } from '../lib/format'

function outletName(id) {
  return outlets.find((o) => o.id === id)?.nama || 'Outlet'
}
function repName(id) {
  return salesReps.find((r) => r.id === id)?.nama || 'Sales'
}

function toTimestamp(dateStr, hourSeed) {
  const d = new Date(dateStr)
  d.setHours(8 + (hourSeed % 10), (hourSeed * 7) % 60, 0, 0)
  return d
}

const events = []

orders.forEach((o, i) => {
  events.push({
    id: `act-order-${o.id}`,
    type: 'order',
    ts: toTimestamp(o.tanggal, i),
    title: `Order baru dari ${outletName(o.outletId)}`,
    detail: `${o.nomor} • ${formatRupiah(o.total)} • oleh ${repName(o.salesRepId)}`,
  })
  if (o.dibayar > 0) {
    events.push({
      id: `act-pay-${o.id}`,
      type: 'payment',
      ts: toTimestamp(o.tanggal, i + 3),
      title: `Pembayaran diterima dari ${outletName(o.outletId)}`,
      detail: `${formatRupiah(o.dibayar)} untuk order ${o.nomor}`,
    })
  }
  if (o.suratJalanNumber) {
    events.push({
      id: `act-sj-${o.id}`,
      type: 'shipment',
      ts: toTimestamp(o.tanggal, i + 5),
      title: `Surat jalan diterbitkan — ${outletName(o.outletId)}`,
      detail: `${o.suratJalanNumber} • ${o.items.length} item`,
    })
  }
})

returns.forEach((r, i) => {
  events.push({
    id: `act-retur-${r.id}`,
    type: 'return',
    ts: toTimestamp(r.tanggal, i + 2),
    title: `Retur diajukan oleh ${r.outletNama}`,
    detail: `${r.productNama} • ${r.alasanLabel} • ${r.nomor}`,
  })
})

events.sort((a, b) => b.ts - a.ts)

export const activityFeed = events.slice(0, 60)
export const TODAY_REF = TODAY
