import { makeRng } from './rng'
import { products } from './products'
import { warehouses } from './warehouses'

const rng = makeRng(707)

const TODAY = new Date('2026-08-08')

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}
function isoDate(d) {
  return d.toISOString().slice(0, 10)
}
function warehouseName(id) {
  return warehouses.find((w) => w.id === id)?.nama || '-'
}

export const transfers = []
let trfCounter = 1
const transferCount = 15

for (let i = 0; i < transferCount; i++) {
  const product = rng.pick(products)
  let from = rng.pick(warehouses)
  let to = rng.pick(warehouses)
  let guard = 0
  while (to.id === from.id && guard < 10) {
    to = rng.pick(warehouses)
    guard++
  }
  const daysAgo = rng.int(0, 59)
  const qty = rng.pick([10, 15, 20, 25, 30])

  transfers.push({
    id: `transfer-${i + 1}`,
    nomor: `TRF-2026-${String(trfCounter++).padStart(4, '0')}`,
    tanggal: isoDate(addDays(TODAY, -daysAgo)),
    productId: product.id,
    productNama: product.nama,
    satuan: product.satuan,
    qty,
    fromWarehouseId: from.id,
    fromWarehouseNama: from.nama,
    toWarehouseId: to.id,
    toWarehouseNama: to.nama,
    catatan: '',
    status: 'selesai',
  })
}

transfers.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))

let runtimeTransferSeq = transferCount + 1

// Transfer stok antar gudang: langsung selesai, mengurangi stok gudang asal
// dan menambah stok gudang tujuan pada produk yang sama.
export function createTransfer({ productId, qty, fromWarehouseId, toWarehouseId, catatan }) {
  const product = products.find((p) => p.id === productId)
  if (!product) return null
  if (fromWarehouseId === toWarehouseId) return null

  const stokAsal = product.stockByWarehouse[fromWarehouseId] || 0
  if (qty <= 0 || qty > stokAsal) return null

  const transfer = {
    id: `transfer-runtime-${runtimeTransferSeq}`,
    nomor: `TRF-2026-${String(transferCount + runtimeTransferSeq).padStart(4, '0')}`,
    tanggal: isoDate(new Date()),
    productId,
    productNama: product.nama,
    satuan: product.satuan,
    qty,
    fromWarehouseId,
    fromWarehouseNama: warehouseName(fromWarehouseId),
    toWarehouseId,
    toWarehouseNama: warehouseName(toWarehouseId),
    catatan: catatan || '',
    status: 'selesai',
  }
  runtimeTransferSeq++
  transfers.unshift(transfer)

  product.stockByWarehouse[fromWarehouseId] = stokAsal - qty
  product.stockByWarehouse[toWarehouseId] = (product.stockByWarehouse[toWarehouseId] || 0) + qty

  return transfer
}
