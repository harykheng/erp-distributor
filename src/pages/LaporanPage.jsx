import { useMemo, useState } from 'react'
import { Download, FileSpreadsheet, FileText, Calendar, Eye } from 'lucide-react'
import { orders, TODAY } from '../data/orders'
import { outlets } from '../data/outlets'
import { salesReps } from '../data/salesReps'
import { computeLabaRugi } from '../data/reports'
import DataTable from '../components/common/DataTable'
import KpiCard from '../components/common/KpiCard'
import Modal from '../components/common/Modal'
import Badge, { statusVariant, statusLabel } from '../components/common/Badge'
import { formatRupiah, formatDate, daysBetween } from '../lib/format'
import { exportCsv } from '../lib/exportCsv'
import { printReport } from '../lib/print'

const periodOptions = [
  { key: 7, label: '7 Hari Terakhir' },
  { key: 30, label: '30 Hari Terakhir' },
  { key: 60, label: '60 Hari Terakhir' },
]

function outletName(id) {
  return outlets.find((o) => o.id === id)?.nama || '-'
}
function repName(id) {
  return salesReps.find((r) => r.id === id)?.nama || '-'
}

export default function LaporanPage() {
  const [period, setPeriod] = useState(30)
  const [repFilter, setRepFilter] = useState('semua')
  const [view, setView] = useState('rep') // rep | outlet | labarugi
  const [detail, setDetail] = useState(null) // { title, subtitle, rows }

  const periodLabel = periodOptions.find((p) => p.key === period)?.label

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
    const repsToShow = repFilter === 'semua' ? salesReps : salesReps.filter((r) => r.id === repFilter)
    return repsToShow
      .map((rep) => {
        const repOrders = filteredOrders.filter((o) => o.salesRepId === rep.id)
        return {
          id: rep.id,
          nama: rep.nama,
          zona: rep.zona,
          jumlahOrder: repOrders.length,
          totalPenjualan: repOrders.reduce((s, o) => s + o.total, 0),
          orders: repOrders,
        }
      })
      .sort((a, b) => b.totalPenjualan - a.totalPenjualan)
  }, [filteredOrders, repFilter])

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
          orders: outletOrders,
        }
      })
      .filter((o) => o.jumlahOrder > 0)
      .sort((a, b) => b.totalPenjualan - a.totalPenjualan)
  }, [filteredOrders])

  const labaRugi = useMemo(() => computeLabaRugi(filteredOrders), [filteredOrders])

  function openOrderList(title, subtitle, rows) {
    setDetail({ title, subtitle, rows })
  }

  const repColumns = [
    { key: 'nama', label: 'Sales Rep', sortable: true },
    { key: 'zona', label: 'Zona', sortable: true },
    { key: 'jumlahOrder', label: 'Jumlah Order', sortable: true },
    { key: 'totalPenjualan', label: 'Total Penjualan', sortable: true, render: (r) => <span className="font-semibold text-base-100">{formatRupiah(r.totalPenjualan)}</span> },
    {
      key: 'action',
      label: '',
      render: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            openOrderList(r.nama, `${r.zona} · ${periodLabel}`, r.orders)
          }}
          className="flex items-center gap-1.5 text-xs text-brand font-semibold hover:underline"
        >
          <Eye size={13} /> Detail
        </button>
      ),
    },
  ]

  const outletColumns = [
    { key: 'nama', label: 'Outlet', sortable: true },
    { key: 'zona', label: 'Zona', sortable: true },
    { key: 'jumlahOrder', label: 'Jumlah Order', sortable: true },
    { key: 'totalPenjualan', label: 'Total Penjualan', sortable: true, render: (r) => <span className="font-semibold text-base-100">{formatRupiah(r.totalPenjualan)}</span> },
    {
      key: 'action',
      label: '',
      render: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            openOrderList(r.nama, `${r.zona} · ${periodLabel}`, r.orders)
          }}
          className="flex items-center gap-1.5 text-xs text-brand font-semibold hover:underline"
        >
          <Eye size={13} /> Detail
        </button>
      ),
    },
  ]

  const labaRugiColumns = [
    { key: 'kategori', label: 'Kategori Produk', sortable: true },
    { key: 'penjualan', label: 'Penjualan', sortable: true, render: (r) => formatRupiah(r.penjualan) },
    { key: 'hpp', label: 'HPP', sortable: true, render: (r) => formatRupiah(r.hpp) },
    { key: 'labaKotor', label: 'Laba Kotor', sortable: true, render: (r) => <span className="font-semibold text-good">{formatRupiah(r.labaKotor)}</span> },
    { key: 'marginPct', label: 'Margin', sortable: true, render: (r) => `${r.marginPct.toFixed(1)}%` },
  ]

  function handleExportExcel() {
    if (view === 'rep') {
      exportCsv(
        `laporan-per-sales-rep-${period}hari.csv`,
        ['Sales Rep', 'Zona', 'Jumlah Order', 'Total Penjualan'],
        byRep.map((r) => [r.nama, r.zona, r.jumlahOrder, r.totalPenjualan])
      )
    } else if (view === 'outlet') {
      exportCsv(
        `laporan-per-outlet-${period}hari.csv`,
        ['Outlet', 'Zona', 'Jumlah Order', 'Total Penjualan'],
        byOutlet.map((r) => [r.nama, r.zona, r.jumlahOrder, r.totalPenjualan])
      )
    } else {
      exportCsv(
        `laporan-laba-rugi-${period}hari.csv`,
        ['Kategori', 'Penjualan', 'HPP', 'Laba Kotor', 'Margin (%)'],
        labaRugi.byKategori.map((r) => [r.kategori, r.penjualan, r.hpp, r.labaKotor, r.marginPct.toFixed(1)])
      )
    }
  }

  function handleExportPdf() {
    if (view === 'rep') {
      printReport({
        title: 'Laporan Penjualan per Sales Rep',
        subtitle: periodLabel,
        headers: ['Sales Rep', 'Zona', 'Jumlah Order', 'Total Penjualan'],
        rows: byRep.map((r) => [r.nama, r.zona, r.jumlahOrder, formatRupiah(r.totalPenjualan)]),
        totalLabel: 'Total',
        totalValue: formatRupiah(totalPenjualan),
      })
    } else if (view === 'outlet') {
      printReport({
        title: 'Laporan Penjualan per Outlet',
        subtitle: periodLabel,
        headers: ['Outlet', 'Zona', 'Jumlah Order', 'Total Penjualan'],
        rows: byOutlet.map((r) => [r.nama, r.zona, r.jumlahOrder, formatRupiah(r.totalPenjualan)]),
        totalLabel: 'Total',
        totalValue: formatRupiah(totalPenjualan),
      })
    } else {
      printReport({
        title: 'Laporan Laba Rugi (Ringkasan)',
        subtitle: periodLabel,
        headers: ['Kategori', 'Penjualan', 'HPP', 'Laba Kotor', 'Margin'],
        rows: labaRugi.byKategori.map((r) => [
          r.kategori,
          formatRupiah(r.penjualan),
          formatRupiah(r.hpp),
          formatRupiah(r.labaKotor),
          `${r.marginPct.toFixed(1)}%`,
        ]),
        totalLabel: 'Laba Kotor',
        totalValue: formatRupiah(labaRugi.labaKotor),
      })
    }
  }

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
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-base-700 bg-base-900 text-xs font-semibold text-base-300 hover:bg-base-850"
          >
            <FileSpreadsheet size={14} /> Export Excel
          </button>
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-base-700 bg-base-900 text-xs font-semibold text-base-300 hover:bg-base-850"
          >
            <FileText size={14} /> Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand text-ink text-xs font-bold hover:bg-brand-400"
          >
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Total Penjualan" value={formatRupiah(totalPenjualan)} sub={periodLabel} accent="brand" />
        <KpiCard label="Jumlah Order" value={totalOrder} sub="order tercatat" accent="good" />
        <KpiCard label="Rata-rata per Order" value={formatRupiah(rataRata)} sub="nilai transaksi" accent="warn" />
      </div>

      <div className="flex flex-wrap gap-2">
        <ViewTab active={view === 'rep'} onClick={() => setView('rep')}>Per Sales Rep</ViewTab>
        <ViewTab active={view === 'outlet'} onClick={() => setView('outlet')}>Per Outlet</ViewTab>
        <ViewTab active={view === 'labarugi'} onClick={() => setView('labarugi')}>Laba Rugi</ViewTab>
      </div>

      {view === 'rep' && (
        <DataTable
          columns={repColumns}
          data={byRep}
          searchKeys={['nama', 'zona']}
          searchPlaceholder="Cari sales rep..."
          pageSize={10}
          onRowClick={(r) => openOrderList(r.nama, `${r.zona} · ${periodLabel}`, r.orders)}
        />
      )}
      {view === 'outlet' && (
        <DataTable
          columns={outletColumns}
          data={byOutlet}
          searchKeys={['nama', 'zona']}
          searchPlaceholder="Cari outlet..."
          pageSize={10}
          onRowClick={(r) => openOrderList(r.nama, `${r.zona} · ${periodLabel}`, r.orders)}
        />
      )}
      {view === 'labarugi' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard label="Total HPP" value={formatRupiah(labaRugi.totalHpp)} sub="harga pokok penjualan" accent="warn" />
            <KpiCard label="Laba Kotor" value={formatRupiah(labaRugi.labaKotor)} sub={periodLabel} accent="good" />
            <KpiCard label="Margin Kotor" value={`${labaRugi.marginPct.toFixed(1)}%`} sub="dari total penjualan" accent="brand" />
          </div>
          <DataTable
            columns={labaRugiColumns}
            data={labaRugi.byKategori}
            searchable={false}
            pageSize={10}
            rowKey={(r) => r.kategori}
            emptyLabel="Tidak ada transaksi pada periode ini"
          />
        </>
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.title} subtitle={detail?.subtitle} width="max-w-lg" bodyClassName="p-0">
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-base-800">
          {detail?.rows.length === 0 && <div className="p-5 text-sm text-base-500">Tidak ada order pada periode ini.</div>}
          {detail?.rows.map((o) => (
            <div key={o.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <div className="text-sm font-medium text-base-200">{o.nomor}</div>
                <div className="text-xs text-base-500">
                  {formatDate(o.tanggal)} &middot; {view === 'rep' ? outletName(o.outletId) : repName(o.salesRepId)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-base-100">{formatRupiah(o.total)}</span>
                <Badge variant={statusVariant[o.status]} dot>{statusLabel[o.status]}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Modal>
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
