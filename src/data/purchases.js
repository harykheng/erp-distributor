import { makeRng } from './rng'
import { products } from './products'
import { warehouses } from './warehouses'

const rng = makeRng(606)

export const suppliers = [
  'PT Sumber Pangan Nusantara',
  'CV Aneka Distribusi Jaya',
  'PT Indofood Sales Promotion',
  'PT Sinar Sosro Distribusi',
  'CV Mitra Sembako Sejahtera',
  'PT Unilever Trading',
  'CV Berkah Grosir Utama',
]

const TODAY = new Date('2026-08-08')

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}
function isoDate(d) {
  return d.toISOString().slice(0, 10)
}

export const purchases = []
let poCounter = 1
const purchaseCount = 40

for (let i = 0; i < purchaseCount; i++) {
  const product = rng.pick(products)
  const warehouse = rng.pick(warehouses)
  const supplier = rng.pick(suppliers)
  const daysAgo = rng.int(0, 59)
  const qty = rng.pick([20, 30, 50, 60, 100])
  const hargaBeli = product.hargaModal
  purchases.push({
    id: `pembelian-${i + 1}`,
    nomor: `PO-2026-${String(poCounter++).padStart(4, '0')}`,
    tanggal: isoDate(addDays(TODAY, -daysAgo)),
    supplier,
    productId: product.id,
    productNama: product.nama,
    satuan: product.satuan,
    qty,
    hargaBeli,
    totalBiaya: qty * hargaBeli,
    warehouseId: warehouse.id,
    status: 'diterima',
  })
}

purchases.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))

let runtimePurchaseSeq = purchaseCount + 1

// Pembelian baru: langsung diterima & menambah stok gudang tujuan
export function createPurchase({ supplier, productId, qty, hargaBeli, warehouseId, tanggal }) {
  const product = products.find((p) => p.id === productId)
  if (!product) return null

  const purchase = {
    id: `pembelian-runtime-${runtimePurchaseSeq}`,
    nomor: `PO-2026-${String(purchaseCount + runtimePurchaseSeq).padStart(4, '0')}`,
    tanggal: tanggal || isoDate(new Date()),
    supplier,
    productId,
    productNama: product.nama,
    satuan: product.satuan,
    qty,
    hargaBeli,
    totalBiaya: qty * hargaBeli,
    warehouseId,
    status: 'diterima',
  }
  runtimePurchaseSeq++
  purchases.unshift(purchase)

  product.stockByWarehouse[warehouseId] = (product.stockByWarehouse[warehouseId] || 0) + qty

  return purchase
}
