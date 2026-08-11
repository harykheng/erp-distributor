import { makeRng } from './rng'
import { outlets } from './outlets'
import { products } from './products'
import { warehouses } from './warehouses'
import { formatRupiah, formatDate } from '../lib/format'
import { waLink } from '../lib/whatsapp'

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

export const statusFlow = ['diajukan', 'draft', 'diproses', 'dikirim', 'lunas', 'ditolak']

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
  let subtotal = 0

  for (let j = 0; j < itemCount; j++) {
    let product = rng.pick(products)
    let guard = 0
    while (usedProductIds.has(product.id) && guard < 10) {
      product = rng.pick(products)
      guard++
    }
    usedProductIds.add(product.id)
    const qty = rng.pick([2, 3, 5, 5, 8, 10, 12, 20])
    const itemSubtotal = qty * product.harga
    subtotal += itemSubtotal
    items.push({
      productId: product.id,
      nama: product.nama,
      satuan: product.satuan,
      qty,
      hargaSatuan: product.harga,
      subtotal: itemSubtotal,
    })
  }

  // mayoritas transaksi B2B distributor kena PPN, sebagian kecil non-PKP/bebas PPN
  const kenaPPN = rng.bool(0.85)
  const ppn = kenaPPN ? Math.round(subtotal * 0.11) : 0
  const total = subtotal + ppn

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
    kenaPPN,
    subtotal,
    ppn,
    total,
    status,
    suratJalanNumber: isSent ? `SJ-2026-${String(sjCounter++).padStart(4, '0')}` : null,
    termin,
    jatuhTempo: isoDate(jatuhTempo),
    dibayar,
    isSent,
    sumber: 'admin',
    catatan: '',
  })
}

// beberapa permintaan order dari sales yang masih menunggu verifikasi admin,
// supaya alur verifikasi langsung kelihatan isinya saat demo
const catatanContoh = [
  'Outlet minta tambahan stok buat weekend',
  'Ada promo akhir bulan, outlet order lebih banyak dari biasanya',
  'Outlet baru buka, order perdana',
  'Stok outlet menipis, minta dikirim cepat',
  '',
]

const pendingRequestCount = 5
for (let i = 0; i < pendingRequestCount; i++) {
  const daysAgo = rng.int(0, 2)
  const tanggal = addDays(TODAY, -daysAgo)
  const outlet = rng.pick(outlets.filter((o) => o.aktif))
  const warehouse = rng.pick(warehouses)
  const itemCount = rng.int(2, 4)
  const usedProductIds = new Set()
  const items = []
  let subtotal = 0

  for (let j = 0; j < itemCount; j++) {
    let product = rng.pick(products)
    let guard = 0
    while (usedProductIds.has(product.id) && guard < 10) {
      product = rng.pick(products)
      guard++
    }
    usedProductIds.add(product.id)
    const qty = rng.pick([2, 3, 5, 8, 10])
    const itemSubtotal = qty * product.harga
    subtotal += itemSubtotal
    items.push({
      productId: product.id,
      nama: product.nama,
      satuan: product.satuan,
      qty,
      hargaSatuan: product.harga,
      subtotal: itemSubtotal,
    })
  }

  const kenaPPN = rng.bool(0.85)
  const ppn = kenaPPN ? Math.round(subtotal * 0.11) : 0
  const total = subtotal + ppn

  const termin = rng.pick(termOptions)
  const jatuhTempo = addDays(tanggal, termin)

  orders.push({
    id: `order-pending-${i + 1}`,
    nomor: `ORD-2026-${String(orderCounter++).padStart(4, '0')}`,
    tanggal: isoDate(tanggal),
    outletId: outlet.id,
    salesRepId: outlet.salesRepId,
    warehouseId: warehouse.id,
    items,
    kenaPPN,
    subtotal,
    ppn,
    total,
    status: 'diajukan',
    suratJalanNumber: null,
    termin,
    jatuhTempo: isoDate(jatuhTempo),
    dibayar: 0,
    isSent: false,
    sumber: 'sales',
    catatan: rng.pick(catatanContoh),
  })
}

orders.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))

let runtimeOrderSeq = orderCounter
let runtimeSjSeq = sjCounter

export function createOrder({ outletId, salesRepId, warehouseId, items, termin = 7, kenaPPN = true }) {
  const subtotal = items.reduce((s, it) => s + it.subtotal, 0)
  const ppn = kenaPPN ? Math.round(subtotal * 0.11) : 0
  const total = subtotal + ppn
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
    kenaPPN,
    subtotal,
    ppn,
    total,
    status: 'dikirim',
    suratJalanNumber: `SJ-2026-${String(runtimeSjSeq++).padStart(4, '0')}`,
    termin,
    jatuhTempo: isoDate(jatuhTempo),
    dibayar: 0,
    isSent: true,
    sumber: 'admin',
    catatan: '',
  }
  orders.unshift(order)
  return order
}

// order request dari sales rep — masuk sebagai 'diajukan', menunggu admin verifikasi
export function requestOrder({ outletId, salesRepId, warehouseId, items, termin = 7, catatan = '', kenaPPN = true }) {
  const subtotal = items.reduce((s, it) => s + it.subtotal, 0)
  const ppn = kenaPPN ? Math.round(subtotal * 0.11) : 0
  const total = subtotal + ppn
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
    kenaPPN,
    subtotal,
    ppn,
    total,
    status: 'diajukan',
    suratJalanNumber: null,
    termin,
    jatuhTempo: isoDate(jatuhTempo),
    dibayar: 0,
    isSent: false,
    sumber: 'sales',
    catatan,
  }
  orders.unshift(order)
  return order
}

// admin verifikasi order request: setuju -> langsung dikirim + surat jalan terbit, tolak -> ditolak
export function verifyOrderRequest(orderId, approve) {
  const order = orders.find((o) => o.id === orderId)
  if (!order) return null
  if (approve) {
    order.status = 'dikirim'
    order.suratJalanNumber = `SJ-2026-${String(runtimeSjSeq++).padStart(4, '0')}`
    order.isSent = true
  } else {
    order.status = 'ditolak'
  }
  return order
}

// order draft/diproses -> dikirim: barang jalan, surat jalan terbit
export function markAsShipped(orderId) {
  const order = orders.find((o) => o.id === orderId)
  if (!order) return null
  order.status = 'dikirim'
  order.suratJalanNumber = order.suratJalanNumber || `SJ-2026-${String(runtimeSjSeq++).padStart(4, '0')}`
  order.isSent = true
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

export function orderWaLink(order) {
  const outlet = outlets.find((o) => o.id === order.outletId)
  const lines = [
    `Halo ${outlet?.nama || ''}, berikut detail pesanan Anda:`,
    ``,
    `No. Order: ${order.nomor}`,
    order.suratJalanNumber ? `Surat Jalan: ${order.suratJalanNumber}` : null,
    `Tanggal: ${formatDate(order.tanggal)}`,
    `Total: ${formatRupiah(order.total)}`,
    ``,
    `Terima kasih atas pesanannya! 🙏`,
  ].filter(Boolean)
  return waLink(outlet?.telepon, lines.join('\n'))
}
