import { makeRng } from './rng'
import { orders } from './orders'
import { returns } from './returns'
import { products } from './products'
import { warehouses } from './warehouses'

const rng = makeRng(505)

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}
function isoDate(d) {
  return d.toISOString().slice(0, 10)
}

export const mutations = []
let mCounter = 1

// keluar: dari order yang sudah dikirim
orders
  .filter((o) => o.isSent)
  .forEach((o) => {
    o.items.forEach((it) => {
      mutations.push({
        id: `mut-${mCounter++}`,
        tanggal: o.tanggal,
        jenis: 'keluar',
        productId: it.productId,
        productNama: it.nama,
        satuan: it.satuan,
        qty: it.qty,
        warehouseId: o.warehouseId,
        keterangan: `Kirim ke outlet — ${o.nomor}`,
        refNomor: o.suratJalanNumber || o.nomor,
      })
    })
  })

// masuk: restock berkala dari supplier, 60 hari terakhir
const restockCount = 40
for (let i = 0; i < restockCount; i++) {
  const product = rng.pick(products)
  const warehouse = rng.pick(warehouses)
  const daysAgo = rng.int(0, 59)
  mutations.push({
    id: `mut-${mCounter++}`,
    tanggal: isoDate(addDays(new Date('2026-08-08'), -daysAgo)),
    jenis: 'masuk',
    productId: product.id,
    productNama: product.nama,
    satuan: product.satuan,
    qty: rng.pick([20, 30, 50, 60, 100]),
    warehouseId: warehouse.id,
    keterangan: 'Restock dari supplier',
    refNomor: `PO-SUP-${String(1000 + i)}`,
  })
}

// retur: kembali ke gudang
returns.forEach((r) => {
  mutations.push({
    id: `mut-${mCounter++}`,
    tanggal: r.tanggal,
    jenis: 'retur',
    productId: r.productId,
    productNama: r.productNama,
    satuan: r.satuan,
    qty: r.qty,
    warehouseId: r.warehouseId,
    keterangan: `Retur dari outlet — ${r.alasanLabel}`,
    refNomor: r.nomor,
  })
})

mutations.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))

export function mutationsByWarehouse(warehouseId) {
  return mutations.filter((m) => m.warehouseId === warehouseId)
}

export function logReturnMutation(retur) {
  mutations.unshift({
    id: `mut-${mCounter++}`,
    tanggal: retur.tanggal,
    jenis: 'retur',
    productId: retur.productId,
    productNama: retur.productNama,
    satuan: retur.satuan,
    qty: retur.qty,
    warehouseId: retur.warehouseId,
    keterangan: `Retur dari outlet — ${retur.alasanLabel}`,
    refNomor: retur.nomor,
  })
}
