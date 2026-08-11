import { makeRng } from './rng'
import { orders, TODAY } from './orders'
import { outlets } from './outlets'
import { products } from './products'

const rng = makeRng(404)

const alasanList = [
  { key: 'rusak', label: 'Barang Rusak' },
  { key: 'kadaluarsa', label: 'Kadaluarsa' },
  { key: 'salah_kirim', label: 'Salah Kirim' },
]

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}
function isoDate(d) {
  return d.toISOString().slice(0, 10)
}

const sentOrders = orders.filter((o) => o.isSent)
const returnCount = 9

export const returns = []
for (let i = 0; i < returnCount; i++) {
  const order = rng.pick(sentOrders)
  const item = rng.pick(order.items)
  const outlet = outlets.find((o) => o.id === order.outletId)
  const qtyRetur = Math.min(item.qty, rng.int(1, Math.max(1, Math.floor(item.qty / 2))))
  const tanggalRetur = addDays(new Date(order.tanggal), rng.int(1, 5))
  const alasan = rng.pick(alasanList)
  returns.push({
    id: `retur-${i + 1}`,
    nomor: `RTR-2026-${String(i + 1).padStart(4, '0')}`,
    orderId: order.id,
    nomorOrder: order.nomor,
    outletId: order.outletId,
    outletNama: outlet?.nama,
    productId: item.productId,
    productNama: item.nama,
    satuan: item.satuan,
    qty: qtyRetur,
    nilai: qtyRetur * item.hargaSatuan,
    alasan: alasan.key,
    alasanLabel: alasan.label,
    tanggal: isoDate(tanggalRetur),
    status: rng.pickWeighted(['diajukan', 'disetujui', 'selesai'], [1, 2, 4]),
    warehouseId: order.warehouseId,
  })
}

returns.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))

let runtimeReturnSeq = returnCount + 1

// Retur baru: terikat ke order yang sudah dikirim, otomatis mengurangi
// tagihan (piutang) outlet terkait dan mengembalikan stok ke gudang asal.
export function createReturn({ orderId, productId, qty, alasan }) {
  const order = orders.find((o) => o.id === orderId)
  if (!order) return null
  const item = order.items.find((it) => it.productId === productId)
  if (!item) return null
  const outlet = outlets.find((o) => o.id === order.outletId)
  const alasanObj = alasanList.find((a) => a.key === alasan)
  const nilai = qty * item.hargaSatuan

  const retur = {
    id: `retur-runtime-${runtimeReturnSeq}`,
    nomor: `RTR-2026-${String(returnCount + runtimeReturnSeq).padStart(4, '0')}`,
    orderId: order.id,
    nomorOrder: order.nomor,
    outletId: order.outletId,
    outletNama: outlet?.nama,
    productId,
    productNama: item.nama,
    satuan: item.satuan,
    qty,
    nilai,
    alasan,
    alasanLabel: alasanObj?.label || alasan,
    tanggal: isoDate(new Date()),
    status: 'diajukan',
    warehouseId: order.warehouseId,
  }
  runtimeReturnSeq++
  returns.unshift(retur)

  // pengaruh ke piutang: kurangi total tagihan order terkait
  order.total = Math.max(0, order.total - nilai)
  order.dibayar = Math.min(order.dibayar, order.total)

  // pengaruh ke stok: barang retur kembali ke gudang asal
  const product = products.find((p) => p.id === productId)
  if (product) {
    product.stockByWarehouse[order.warehouseId] = (product.stockByWarehouse[order.warehouseId] || 0) + qty
  }

  return retur
}

export { alasanList }
export const TODAY_REF = TODAY
