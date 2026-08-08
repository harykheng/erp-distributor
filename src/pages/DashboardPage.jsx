import { useEffect, useState } from 'react'
import { Wallet, TrendingUp, Store, PackageX } from 'lucide-react'
import { api } from '../data/api'
import { useAppStore } from '../store/useAppStore'
import KpiCard from '../components/common/KpiCard'
import InsightSection from '../components/dashboard/InsightSection'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import SalesTrendChart from '../components/dashboard/SalesTrendChart'
import AgingBar from '../components/common/AgingBar'
import { formatRupiah, formatRupiahCompact } from '../lib/format'
import { piutangByBucket, totalPiutang } from '../data/ar'

export default function DashboardPage() {
  const dataVersion = useAppStore((s) => s.dataVersion)
  const [kpi, setKpi] = useState(null)
  const [insights, setInsights] = useState([])
  const [trend, setTrend] = useState([])
  const [feed, setFeed] = useState([])

  useEffect(() => {
    api.getDashboardKpi().then(setKpi)
    api.getInsights().then(setInsights)
    api.getSalesTrend().then(setTrend)
    api.getActivityFeed().then(setFeed)
  }, [dataVersion])

  const buckets = piutangByBucket()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Total Piutang Outstanding"
          value={kpi ? formatRupiah(kpi.totalPiutang) : '...'}
          sub="dari seluruh outlet"
          icon={Wallet}
          accent="warn"
        />
        <KpiCard
          label="Penjualan Bulan Ini"
          value={kpi ? formatRupiah(kpi.penjualanBulanIni) : '...'}
          sub="akumulasi order bulan berjalan"
          icon={TrendingUp}
          accent="good"
          trend={8}
        />
        <KpiCard
          label="Outlet Aktif"
          value={kpi ? kpi.outletAktif : '...'}
          sub="toko/warung berlangganan"
          icon={Store}
          accent="brand"
        />
        <KpiCard
          label="Produk Stok Kritis"
          value={kpi ? kpi.stokKritis : '...'}
          sub="perlu segera direstock"
          icon={PackageX}
          accent="bad"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <SalesTrendChart data={trend} />

          <div className="rounded-2xl border border-base-800 bg-base-900 shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base-100 text-sm">Ringkasan Aging Piutang</h3>
              <span className="text-xs text-base-500">Total {formatRupiahCompact(totalPiutang())}</span>
            </div>
            <AgingBar buckets={buckets} total={totalPiutang()} />
          </div>

          <InsightSection insights={insights} />
        </div>

        <div>
          <ActivityFeed events={feed} />
        </div>
      </div>
    </div>
  )
}
