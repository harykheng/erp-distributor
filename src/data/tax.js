import { orders } from './orders'
import { purchases } from './purchases'
import { outlets } from './outlets'

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function periodKeyOf(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function outletName(id) {
  return outlets.find((o) => o.id === id)?.nama || '-'
}

// daftar periode (bulan) yang ada di data invoice/PO, terbaru duluan, plus opsi "semua"
export function getTaxPeriods() {
  const keys = new Set()
  orders.forEach((o) => keys.add(periodKeyOf(o.tanggal)))
  purchases.forEach((p) => keys.add(periodKeyOf(p.tanggal)))
  const sorted = [...keys].sort().reverse()
  const months = sorted.map((key) => {
    const [y, m] = key.split('-').map(Number)
    return { key, label: `${monthNames[m - 1]} ${y}` }
  })
  return [{ key: 'semua', label: 'Semua Periode' }, ...months]
}

// pajak keluaran: PPN dari invoice (order) kena PPN pada periode terpilih
export function getPajakKeluaran(periodKey) {
  return orders
    .filter((o) => o.kenaPPN && (periodKey === 'semua' || periodKeyOf(o.tanggal) === periodKey))
    .map((o) => ({
      id: o.id,
      nomor: o.nomor,
      outletNama: outletName(o.outletId),
      tanggal: o.tanggal,
      subtotal: o.subtotal,
      ppn: o.ppn,
      total: o.total,
    }))
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
}

// pajak masukan: PPN dari PO (pembelian) kena PPN pada periode terpilih, digabung per nomor PO
export function getPajakMasukan(periodKey) {
  const filtered = purchases.filter(
    (p) => p.kenaPPN && (periodKey === 'semua' || periodKeyOf(p.tanggal) === periodKey)
  )
  const byNomor = new Map()
  filtered.forEach((p) => {
    const cur = byNomor.get(p.nomor) || {
      id: p.nomor,
      nomor: p.nomor,
      supplier: p.supplier,
      tanggal: p.tanggal,
      subtotal: 0,
      ppn: 0,
      total: 0,
    }
    cur.subtotal += p.subtotal
    cur.ppn += p.ppn
    cur.total += p.totalBiaya
    byNomor.set(p.nomor, cur)
  })
  return [...byNomor.values()].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
}

// dihitung ulang tiap dipanggil (bukan cache statis) supaya ikut ter-update
// saat ada invoice/PO baru dalam sesi yang sama
export function getTaxSummary(periodKey) {
  const keluaran = getPajakKeluaran(periodKey)
  const masukan = getPajakMasukan(periodKey)
  const pajakKeluaran = keluaran.reduce((s, r) => s + r.ppn, 0)
  const pajakMasukan = masukan.reduce((s, r) => s + r.ppn, 0)
  return {
    pajakKeluaran,
    pajakMasukan,
    // positif = kurang bayar (keluaran > masukan), negatif = lebih bayar
    selisih: pajakKeluaran - pajakMasukan,
    keluaran,
    masukan,
  }
}
