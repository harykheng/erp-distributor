import { orders } from './orders'
import { returns } from './returns'
import { purchases } from './purchases'
import { transfers } from './transfers'

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

// masuk: pembelian dari supplier
purchases.forEach((p) => {
  mutations.push({
    id: `mut-${mCounter++}`,
    tanggal: p.tanggal,
    jenis: 'masuk',
    productId: p.productId,
    productNama: p.productNama,
    satuan: p.satuan,
    qty: p.qty,
    warehouseId: p.warehouseId,
    keterangan: `Pembelian dari ${p.supplier}`,
    refNomor: p.nomor,
  })
})

// transfer: perpindahan stok antar gudang, dicatat dua sisi
transfers.forEach((t) => {
  mutations.push({
    id: `mut-${mCounter++}`,
    tanggal: t.tanggal,
    jenis: 'transfer',
    productId: t.productId,
    productNama: t.productNama,
    satuan: t.satuan,
    qty: t.qty,
    warehouseId: t.fromWarehouseId,
    keterangan: `Transfer keluar ke ${t.toWarehouseNama}`,
    refNomor: t.nomor,
  })
  mutations.push({
    id: `mut-${mCounter++}`,
    tanggal: t.tanggal,
    jenis: 'transfer',
    productId: t.productId,
    productNama: t.productNama,
    satuan: t.satuan,
    qty: t.qty,
    warehouseId: t.toWarehouseId,
    keterangan: `Transfer masuk dari ${t.fromWarehouseNama}`,
    refNomor: t.nomor,
  })
})

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

export function logPurchaseMutation(purchase) {
  mutations.unshift({
    id: `mut-${mCounter++}`,
    tanggal: purchase.tanggal,
    jenis: 'masuk',
    productId: purchase.productId,
    productNama: purchase.productNama,
    satuan: purchase.satuan,
    qty: purchase.qty,
    warehouseId: purchase.warehouseId,
    keterangan: `Pembelian dari ${purchase.supplier}`,
    refNomor: purchase.nomor,
  })
}

export function logTransferMutation(transfer) {
  mutations.unshift({
    id: `mut-${mCounter++}`,
    tanggal: transfer.tanggal,
    jenis: 'transfer',
    productId: transfer.productId,
    productNama: transfer.productNama,
    satuan: transfer.satuan,
    qty: transfer.qty,
    warehouseId: transfer.toWarehouseId,
    keterangan: `Transfer masuk dari ${transfer.fromWarehouseNama}`,
    refNomor: transfer.nomor,
  })
  mutations.unshift({
    id: `mut-${mCounter++}`,
    tanggal: transfer.tanggal,
    jenis: 'transfer',
    productId: transfer.productId,
    productNama: transfer.productNama,
    satuan: transfer.satuan,
    qty: transfer.qty,
    warehouseId: transfer.fromWarehouseId,
    keterangan: `Transfer keluar ke ${transfer.toWarehouseNama}`,
    refNomor: transfer.nomor,
  })
}
