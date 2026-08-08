import { useMemo, useState } from 'react'
import { Plus, Target, Store, Clock, UserCircle2 } from 'lucide-react'
import { salesReps } from '../data/salesReps'
import { outlets } from '../data/outlets'
import { orders } from '../data/orders'
import { useAppStore } from '../store/useAppStore'
import KpiCard from '../components/common/KpiCard'
import DataTable from '../components/common/DataTable'
import Badge, { statusVariant, statusLabel } from '../components/common/Badge'
import RequestOrderModal from '../components/salesportal/RequestOrderModal'
import { formatRupiah, formatDate } from '../lib/format'
import { repPerformance } from '../data/repPerformance'

function outletName(id) {
  return outlets.find((o) => o.id === id)?.nama || '-'
}

export default function SalesPortalPage() {
  const dataVersion = useAppStore((s) => s.dataVersion)
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion)
  const [repId, setRepId] = useState(salesReps[0].id)
  const [requestOpen, setRequestOpen] = useState(false)

  // repPerformance() dihitung dari data orders langsung (bukan lewat api.js) supaya
  // selalu sinkron dengan dataVersion tanpa perlu effect tambahan
  const performance = useMemo(() => repPerformance().find((r) => r.id === repId), [repId, dataVersion])
  const rep = salesReps.find((r) => r.id === repId)

  const repOutlets = useMemo(() => outlets.filter((o) => o.salesRepId === repId), [repId])

  const myOrders = useMemo(
    () => orders.filter((o) => o.salesRepId === repId).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)),
    [repId, dataVersion]
  )
  const pendingCount = myOrders.filter((o) => o.status === 'diajukan').length

  const columns = [
    { key: 'nomor', label: 'No. Order', sortable: true },
    { key: 'outletId', label: 'Outlet', sortable: true, render: (r) => outletName(r.outletId) },
    { key: 'tanggal', label: 'Tanggal', sortable: true, render: (r) => formatDate(r.tanggal) },
    { key: 'total', label: 'Total', sortable: true, render: (r) => <span className="font-semibold text-base-100">{formatRupiah(r.total)}</span> },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (r) => <Badge variant={statusVariant[r.status]} dot>{statusLabel[r.status]}</Badge>,
    },
    {
      key: 'catatan',
      label: 'Catatan',
      render: (r) => (r.catatan ? <span className="text-xs text-base-400">{r.catatan}</span> : <span className="text-xs text-base-600">-</span>),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-base-800 bg-base-900 shadow-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <UserCircle2 size={18} />
          </div>
          <div>
            <div className="text-xs text-base-500">Login sebagai Sales Rep</div>
            <select
              value={repId}
              onChange={(e) => setRepId(e.target.value)}
              className="bg-transparent text-sm font-bold text-base-100 focus:outline-none -ml-0.5"
            >
              {salesReps.map((r) => (
                <option key={r.id} value={r.id} className="bg-base-900 text-base-100">
                  {r.nama}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => setRequestOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand text-ink text-sm font-bold hover:bg-brand-400 shadow-card"
        >
          <Plus size={16} strokeWidth={2.5} /> Ajukan Order Baru
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Capaian Bulan Ini"
          value={performance ? formatRupiah(performance.capaian) : '...'}
          sub={rep ? `Target ${formatRupiah(rep.targetBulanan)}` : ''}
          icon={Target}
          accent="brand"
        />
        <KpiCard label="Outlet Di-assign" value={repOutlets.length} sub={rep?.zona} icon={Store} accent="good" />
        <KpiCard label="Menunggu Verifikasi" value={pendingCount} sub="order request ke admin" icon={Clock} accent="warn" />
      </div>

      <div className="text-sm font-bold text-base-100">Order Saya</div>
      <DataTable
        columns={columns}
        data={myOrders}
        searchKeys={['nomor']}
        searchPlaceholder="Cari nomor order..."
        pageSize={10}
        emptyLabel="Belum ada order yang diajukan"
      />

      <RequestOrderModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        repId={repId}
        onCreated={() => bumpDataVersion()}
      />
    </div>
  )
}
