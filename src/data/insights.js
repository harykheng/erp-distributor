import { getReceivables } from './ar'
import { orders, TODAY } from './orders'
import { outlets } from './outlets'
import { products, isProductCritical } from './products'
import { warehouses } from './warehouses'
import { getTaxSummary } from './tax'
import { formatRupiah } from '../lib/format'
import { daysBetween } from '../lib/format'

function buildInsights() {
  const insights = []
  const receivables = getReceivables()

  // 1. Piutang jatuh tempo minggu ini (0-7 hari ke depan, belum overdue)
  const dueThisWeek = receivables.filter((r) => {
    const d = daysBetween(new Date(TODAY), new Date(r.jatuhTempo))
    return d >= 0 && d <= 7
  })
  if (dueThisWeek.length > 0) {
    const total = dueThisWeek.reduce((s, r) => s + r.sisa, 0)
    const outletCount = new Set(dueThisWeek.map((r) => r.outletId)).size
    insights.push({
      id: 'ins-due-week',
      type: 'warning',
      title: 'Piutang Jatuh Tempo Minggu Ini',
      message: `${formatRupiah(total)} dari ${outletCount} outlet jatuh tempo dalam 7 hari ke depan.`,
      link: '/piutang',
    })
  }

  // 2. Outlet belum order 14 hari terakhir
  const lastOrderMap = {}
  orders.forEach((o) => {
    const cur = lastOrderMap[o.outletId]
    if (!cur || new Date(o.tanggal) > new Date(cur)) lastOrderMap[o.outletId] = o.tanggal
  })
  const staleOutlets = outlets.filter((o) => {
    if (!o.aktif) return false
    const last = lastOrderMap[o.id]
    if (!last) return true
    return daysBetween(new Date(last), new Date(TODAY)) >= 14
  })
  if (staleOutlets.length > 0) {
    insights.push({
      id: 'ins-stale-outlets',
      type: 'info',
      title: 'Outlet Perlu Di-follow Up',
      message: `${staleOutlets.length} outlet belum order dalam 14 hari terakhir — worth di-follow up.`,
      link: '/outlet',
      meta: staleOutlets.slice(0, 5).map((o) => o.nama),
    })
  }

  // 3. Stok kritis
  const mainWarehouse = warehouses[0]
  const criticalProducts = products.filter((p) => p.stockByWarehouse[mainWarehouse.id] <= p.stokMinimum)
  if (criticalProducts.length > 0) {
    const worst = [...criticalProducts].sort(
      (a, b) => a.stockByWarehouse[mainWarehouse.id] - b.stockByWarehouse[mainWarehouse.id]
    )[0]
    const stok = worst.stockByWarehouse[mainWarehouse.id]
    const estimasiHari = Math.max(1, Math.round(stok / 3))
    insights.push({
      id: 'ins-low-stock',
      type: 'danger',
      title: 'Stok Hampir Habis',
      message: `${worst.nama} hampir habis di ${mainWarehouse.nama}, stok tersisa untuk sekitar ${estimasiHari} hari.`,
      link: '/inventory',
      meta: criticalProducts.slice(0, 5).map((p) => p.nama),
    })
  }

  // 4. Piutang overdue > 30 hari
  const veryOverdue = receivables.filter((r) => r.bucket === 'lewat_30')
  if (veryOverdue.length > 0) {
    const total = veryOverdue.reduce((s, r) => s + r.sisa, 0)
    insights.push({
      id: 'ins-very-overdue',
      type: 'danger',
      title: 'Piutang Macet (>30 Hari)',
      message: `${formatRupiah(total)} piutang dari ${veryOverdue.length} tagihan sudah lewat jatuh tempo lebih dari 30 hari.`,
      link: '/piutang',
    })
  }

  // 5. Order request dari sales yang menunggu verifikasi
  const pendingRequests = orders.filter((o) => o.status === 'diajukan')
  if (pendingRequests.length > 0) {
    insights.push({
      id: 'ins-pending-requests',
      type: 'warning',
      title: 'Order Menunggu Verifikasi',
      message: `${pendingRequests.length} order dari sales rep menunggu diverifikasi sebelum dikirim.`,
      link: '/order',
    })
  }

  // 6. PPN kurang bayar bulan berjalan
  const currentPeriod = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, '0')}`
  const taxSummary = getTaxSummary(currentPeriod)
  if (taxSummary.selisih > 0) {
    insights.push({
      id: 'ins-tax-due',
      type: 'warning',
      title: 'PPN Kurang Bayar Bulan Ini',
      message: `Pajak keluaran lebih besar ${formatRupiah(taxSummary.selisih)} dari pajak masukan bulan berjalan.`,
      link: '/pajak',
    })
  }

  return insights
}

// dihitung ulang tiap dipanggil (bukan cache statis) supaya ikut ter-update
// saat ada order/piutang baru dalam sesi yang sama
export function getInsights() {
  return buildInsights()
}

export function totalOutletAktif() {
  return outlets.filter((o) => o.aktif).length
}

export function totalStokKritis() {
  return products.filter(isProductCritical).length
}
