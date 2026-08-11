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
  const subtotal = qty * hargaBeli
  // mayoritas pembelian dari supplier PKP kena PPN masukan, sebagian non-PPN
  const kenaPPN = rng.bool(0.85)
  const ppn = kenaPPN ? Math.round(subtotal * 0.11) : 0
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
    kenaPPN,
    subtotal,
    ppn,
    totalBiaya: subtotal + ppn,
    warehouseId: warehouse.id,
    status: 'diterima',
  })
}

purchases.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))

let runtimePurchaseSeq = purchaseCount + 1

// Pembelian baru: satu PO bisa berisi beberapa item, langsung diterima & menambah stok gudang tujuan.
// Toggle "Kena PPN" berlaku untuk satu PO (bukan per item), jadi jadi basis pajak masukan per PO.
export function createPurchaseOrder({ supplier, warehouseId, tanggal, items, kenaPPN = true }) {
  if (!items || items.length === 0) return null

  const nomor = `PO-2026-${String(purchaseCount + runtimePurchaseSeq).padStart(4, '0')}`
  runtimePurchaseSeq++

  const created = []
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)
    if (!product) continue

    const subtotal = item.qty * item.hargaBeli
    const ppn = kenaPPN ? Math.round(subtotal * 0.11) : 0

    const purchase = {
      id: `pembelian-runtime-${runtimePurchaseSeq}`,
      nomor,
      tanggal: tanggal || isoDate(new Date()),
      supplier,
      productId: item.productId,
      productNama: product.nama,
      satuan: product.satuan,
      qty: item.qty,
      hargaBeli: item.hargaBeli,
      kenaPPN,
      subtotal,
      ppn,
      totalBiaya: subtotal + ppn,
      warehouseId,
      status: 'diterima',
    }
    runtimePurchaseSeq++
    created.push(purchase)

    product.stockByWarehouse[warehouseId] = (product.stockByWarehouse[warehouseId] || 0) + item.qty
  }

  purchases.unshift(...created)

  return created
}
