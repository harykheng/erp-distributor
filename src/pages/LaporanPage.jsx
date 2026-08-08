import { useMemo, useState } from 'react'
import { Download, FileSpreadsheet, FileText, Calendar } from 'lucide-react'
import { orders } from '../data/orders'
import { outlets } from '../data/outlets'
import { salesReps } from '../data/salesReps'
import DataTable from '../components/common/DataTable'
import KpiCard from '../components/common/KpiCard'
import { formatRupiah, daysBetween } from '../lib/format'
import { TODAY } from '../data/orders'

const periodOptions = [
  { key: 7, label: '7 Hari Terakhir' },
  { key: 30, label: '30 Hari Terakhir' },
  { key: 60, label: '60 Hari Terakhir' },
]

export default function LaporanPage() {
  const [period, setPeriod] = useState(30)
  const [repFilter, setRepFilter] = useState('semua')
  const [view, setView] = useState('rep') // rep | outlet

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const days = daysBetween(new Date(o.tanggal), new Date(TODAY))
      if (days > period) return false
      if (repFilter !== 'semua' && o.salesRepId !== repFilter) return false
      return true
    })
  }, [period, repFilter])

  const totalPenjualan = filteredOrders.reduce((s, o) => s + o.total, 0)
  const totalOrder = filteredOrders.length
  const rataRata = totalOrder ? Math.round(totalPenjualan / totalOrder) : 0

  const byRep = useMemo(() => {
    return salesReps
      .map((rep) => {
        const repOrders = filteredOrders.filter((o) => o.salesRepId === rep.id)
        return {
          id: rep.id,
          nama: rep.nama,
          zona: rep.zona,
          jumlahOrder: repOrders.length,
          totalPenjualan: repOrders.reduce((s, o) => s + o.total, 0),
        }
      })
      .sort((a, b) => b.totalPenjualan - a.totalPenjualan)
  }, [filteredOrders])

  const byOutlet = useMemo(() => {
    return outlets
      .map((o) => {
        const outletOrders = filteredOrders.filter((x) => x.outletId === o.id)
        return {
          id: o.id,
          nama: o.nama,
          zona: o.zona,
          jumlahOrder: outletOrders.length,
          totalPenjualan: outletOrders.reduce((s, x) => s + x.total, 0),
        }
      })
      .filter((o) => o.jumlahOrder > 0)
      .sort((a, b) => b.totalPenjualan - a.totalPenjualan)
  }, [filteredOrders])

  const repColumns = [
    { key: 'nama', label: 'Sales Rep', sortable: true },
    { key: 'zona', label: 'Zona', sortable: true },
    { key: 'jumlahOrder', label: 'Jumlah Order', sortable: true },
    { key: 'totalPenjualan', label: 'Total Penjualan', sortable: true, render: (r) => <span className="font-semibold text-base-100">{formatRupiah(r.totalPenjualan)}</span> },
  ]

  const outletColumns = [
    { key: 'nama', label: 'Outlet', sortable: true },
    { key: 'zona', label: 'Zona', sortable: true },
    { key: 'jumlahOrder', label: 'Jumlah Order', sortable: true },
    { key: 'totalPenjualan', label: 'Total Penjualan', sortable: true, render: (r) => <span className="font-semibold text-base-100">{formatRupiah(r.totalPenjualan)}</span> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-base-400">
            <Calendar size={15} /> Periode
          </div>
          {periodOptions.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                period === p.key ? 'bg-brand/10 border-brand/40 text-brand' : 'bg-base-900 border-base-800 text-base-400 hover:text-base-200'
              }`}
            >
              {p.label}
            </button>
          ))}
          <select
            value={repFilter}
            onChange={(e) => setRepFilter(e.target.value)}
            className="bg-base-850 border border-base-700 rounded-lg px-3 py-1.5 text-xs text-base-200 ml-2"
          >
            <option value="semua">Semua Sales Rep</option>
            {salesReps.map((r) => (
              <option key={r.id} value={r.id}>{r.nama}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-base-700 bg-base-900 text-xs font-semibold text-base-300 hover:bg-base-850">
            <FileSpreadsheet size={14} /> Export Excel
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-base-700 bg-base-900 text-xs font-semibold text-base-300 hover:bg-base-850">
            <FileText size={14} /> Export PDF
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand text-ink text-xs font-bold hover:bg-brand-400">
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Total Penjualan" value={formatRupiah(totalPenjualan)} sub={periodOptions.find((p) => p.key === period)?.label} accent="brand" />
        <KpiCard label="Jumlah Order" value={totalOrder} sub="order tercatat" accent="good" />
        <KpiCard label="Rata-rata per Order" value={formatRupiah(rataRata)} sub="nilai transaksi" accent="warn" />
      </div>

      <div className="flex gap-2">
        <ViewTab active={view === 'rep'} onClick={() => setView('rep')}>Per Sales Rep</ViewTab>
        <ViewTab active={view === 'outlet'} onClick={() => setView('outlet')}>Per Outlet</ViewTab>
      </div>

      {view === 'rep' ? (
        <DataTable columns={repColumns} data={byRep} searchKeys={['nama', 'zona']} searchPlaceholder="Cari sales rep..." pageSize={10} />
      ) : (
        <DataTable columns={outletColumns} data={byOutlet} searchKeys={['nama', 'zona']} searchPlaceholder="Cari outlet..." pageSize={10} />
      )}
    </div>
  )
}

function ViewTab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
        active ? 'bg-brand/10 text-brand border border-brand/40' : 'text-base-400 border border-base-800 hover:text-base-200'
      }`}
    >
      {children}
    </button>
  )
}
