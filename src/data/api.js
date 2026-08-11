// Lapisan query terpusat. Semua komponen mengambil data lewat fungsi di sini,
// bukan import langsung dari file mock — supaya saat migrasi ke Supabase asli,
// cukup ganti isi fungsi (jadi `supabase.from(...).select(...)`) tanpa ubah UI.
import { outlets, createOutlet, setOutletStatus } from './outlets'
import { salesReps } from './salesReps'
import { products, totalStok, createProduct } from './products'
import { warehouses } from './warehouses'
import { orders, outletOrderHistory, outletProductAverages, createOrder, recordPayment, requestOrder, verifyOrderRequest, markAsShipped } from './orders'
import { getReceivables, totalPiutang, piutangByBucket, piutangByOutlet, waReminderLink, agingBuckets } from './ar'
import { returns } from './returns'
import { mutations, mutationsByWarehouse } from './stockMutations'
import { activityFeed } from './activity'
import { getInsights, totalOutletAktif, totalStokKritis } from './insights'
import { salesTrend30, penjualanBulanIni } from './salesTrend'
import { repPerformance, ruteKunjungan } from './repPerformance'

const delay = (ms = 120) => new Promise((res) => setTimeout(res, ms))

export const api = {
  async getOutlets() {
    await delay()
    return outlets
  },
  async getOutlet(id) {
    await delay()
    return outlets.find((o) => o.id === id)
  },
  async createOutlet(payload) {
    await delay(200)
    return createOutlet(payload)
  },
  async setOutletStatus(outletId, aktif) {
    await delay(150)
    return setOutletStatus(outletId, aktif)
  },
  async getSalesReps() {
    await delay()
    return salesReps
  },
  async getProducts() {
    await delay()
    return products.map((p) => ({ ...p, totalStok: totalStok(p) }))
  },
  async createProduct(payload) {
    await delay(200)
    return createProduct(payload)
  },
  async getWarehouses() {
    await delay()
    return warehouses
  },
  async getOrders() {
    await delay()
    return orders
  },
  async createOrder(payload) {
    await delay(200)
    return createOrder(payload)
  },
  async recordPayment(orderId, amount) {
    await delay(200)
    return recordPayment(orderId, amount)
  },
  async requestOrder(payload) {
    await delay(200)
    return requestOrder(payload)
  },
  async verifyOrderRequest(orderId, approve) {
    await delay(200)
    return verifyOrderRequest(orderId, approve)
  },
  async markAsShipped(orderId) {
    await delay(200)
    return markAsShipped(orderId)
  },
  async getOutletHistory(outletId) {
    await delay()
    return outletOrderHistory(outletId)
  },
  async getOutletProductAverages(outletId) {
    await delay()
    return outletProductAverages(outletId)
  },
  async getReceivables() {
    await delay()
    return getReceivables()
  },
  async getPiutangByOutlet(outletId) {
    await delay()
    return piutangByOutlet(outletId)
  },
  async getReturns() {
    await delay()
    return returns
  },
  async getMutations(warehouseId) {
    await delay()
    return warehouseId ? mutationsByWarehouse(warehouseId) : mutations
  },
  async getActivityFeed() {
    await delay()
    return activityFeed
  },
  async getInsights() {
    await delay()
    return getInsights()
  },
  async getSalesTrend() {
    await delay()
    return salesTrend30()
  },
  async getRepPerformance() {
    await delay()
    return repPerformance()
  },
  async getRuteKunjungan(repId) {
    await delay()
    return ruteKunjungan(repId)
  },
  async getDashboardKpi() {
    await delay()
    return {
      totalPiutang: totalPiutang(),
      penjualanBulanIni: penjualanBulanIni(),
      outletAktif: totalOutletAktif(),
      stokKritis: totalStokKritis(),
    }
  },
}

export { agingBuckets, waReminderLink }
