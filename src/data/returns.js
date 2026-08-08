import { makeRng } from './rng'
import { orders, TODAY } from './orders'
import { outlets } from './outlets'

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

export { alasanList }
export const TODAY_REF = TODAY
