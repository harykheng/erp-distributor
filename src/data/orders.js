import { makeRng } from './rng'
import { outlets } from './outlets'
import { products } from './products'
import { warehouses } from './warehouses'

const rng = makeRng(303)

const TODAY = new Date('2026-08-08T09:00:00')

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function isoDate(d) {
  return d.toISOString().slice(0, 10)
}

export const statusFlow = ['draft', 'diproses', 'dikirim', 'lunas']

const termOptions = [7, 14, 30]

let orderCounter = 1
let sjCounter = 1

const orders = []

// distribusikan order selama 60 hari terakhir
const totalOrders = 68

for (let i = 0; i < totalOrders; i++) {
  const daysAgo = rng.int(0, 59)
  const tanggal = addDays(TODAY, -daysAgo)
  const outlet = rng.pick(outlets.filter((o) => o.aktif))
  const warehouse = rng.pick(warehouses)
  const itemCount = rng.int(2, 6)
  const usedProductIds = new Set()
  const items = []
  let total = 0

  for (let j = 0; j < itemCount; j++) {
    let product = rng.pick(products)
    let guard = 0
    while (usedProductIds.has(product.id) && guard < 10) {
      product = rng.pick(products)
      guard++
    }
    usedProductIds.add(product.id)
    const qty = rng.pick([2, 3, 5, 5, 8, 10, 12, 20])
    const subtotal = qty * product.harga
    total += subtotal
    items.push({
      productId: product.id,
      nama: product.nama,
      satuan: product.satuan,
      qty,
      hargaSatuan: product.harga,
      subtotal,
    })
  }

  const termin = rng.pick(termOptions)
  const jatuhTempo = addDays(tanggal, termin)

  // status: makin lama order dibuat, makin besar peluang statusnya sudah lunas
  let status
  if (daysAgo < 2) status = rng.pickWeighted(['draft', 'diproses', 'dikirim'], [3, 4, 3])
  else if (daysAgo < 7) status = rng.pickWeighted(['diproses', 'dikirim', 'lunas'], [2, 5, 3])
  else status = rng.pickWeighted(['dikirim', 'lunas'], [3, 7])

  const isSent = status === 'dikirim' || status === 'lunas'
  const isPaid = status === 'lunas'

  // sebagian order yang sudah dikirim (belum lunas) sengaja dibuat overdue
  let dibayar = 0
  if (isPaid) {
    dibayar = total
  } else if (isSent && rng.bool(0.35)) {
    dibayar = Math.round(total * rng.pick([0.3, 0.5, 0.6])) // pembayaran parsial
  }

  orders.push({
    id: `order-${i + 1}`,
    nomor: `ORD-2026-${String(orderCounter++).padStart(4, '0')}`,
    tanggal: isoDate(tanggal),
    outletId: outlet.id,
    salesRepId: outlet.salesRepId,
    warehouseId: warehouse.id,
    items,
    total,
    status,
    suratJalanNumber: isSent ? `SJ-2026-${String(sjCounter++).padStart(4, '0')}` : null,
    termin,
    jatuhTempo: isoDate(jatuhTempo),
    dibayar,
    isSent,
  })
}

orders.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))

let runtimeOrderSeq = orderCounter
let runtimeSjSeq = sjCounter

export function createOrder({ outletId, salesRepId, warehouseId, items, termin = 7 }) {
  const total = items.reduce((s, it) => s + it.subtotal, 0)
  const tanggal = new Date()
  const jatuhTempo = addDays(tanggal, termin)
  const order = {
    id: `order-runtime-${runtimeOrderSeq}`,
    nomor: `ORD-2026-${String(runtimeOrderSeq++).padStart(4, '0')}`,
    tanggal: isoDate(tanggal),
    outletId,
    salesRepId,
    warehouseId,
    items,
    total,
    status: 'dikirim',
    suratJalanNumber: `SJ-2026-${String(runtimeSjSeq++).padStart(4, '0')}`,
    termin,
    jatuhTempo: isoDate(jatuhTempo),
    dibayar: 0,
    isSent: true,
  }
  orders.unshift(order)
  return order
}

export function recordPayment(orderId, amount) {
  const order = orders.find((o) => o.id === orderId)
  if (!order) return null
  order.dibayar = Math.min(order.total, order.dibayar + amount)
  if (order.dibayar >= order.total) order.status = 'lunas'
  return order
}

export { orders, TODAY }

export function outletOrderHistory(outletId) {
  return orders.filter((o) => o.outletId === outletId).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
}

// rata-rata qty per produk yang biasa dipesan outlet tsb, untuk auto-suggest
export function outletProductAverages(outletId) {
  const hist = outletOrderHistory(outletId)
  const map = {}
  hist.forEach((o) => {
    o.items.forEach((it) => {
      if (!map[it.productId]) map[it.productId] = { qtys: [], nama: it.nama, satuan: it.satuan }
      map[it.productId].qtys.push(it.qty)
    })
  })
  const result = {}
  Object.entries(map).forEach(([pid, v]) => {
    const avg = Math.round(v.qtys.reduce((a, b) => a + b, 0) / v.qtys.length)
    result[pid] = { avgQty: avg, count: v.qtys.length, nama: v.nama, satuan: v.satuan }
  })
  return result
}
