import { useEffect, useMemo, useState } from 'react'
import { Calendar, FileSpreadsheet, ArrowDownCircle, ArrowUpCircle, Scale } from 'lucide-react'
import { api } from '../data/api'
import DataTable from '../components/common/DataTable'
import KpiCard from '../components/common/KpiCard'
import { formatRupiah, formatDate } from '../lib/format'
import { exportCsv } from '../lib/exportCsv'
import { printReport } from '../lib/print'

export default function PajakPage() {
  const [periods, setPeriods] = useState([{ key: 'semua', label: 'Semua Periode' }])
  const [periodKey, setPeriodKey] = useState('semua')
  const [summary, setSummary] = useState({ pajakKeluaran: 0, pajakMasukan: 0, selisih: 0, keluaran: [], masukan: [] })
  const [tab, setTab] = useState('keluaran')

  useEffect(() => {
    api.getTaxPeriods().then((rows) => {
      setPeriods(rows)
      if (rows.length > 1) setPeriodKey(rows[1].key) // default: bulan terbaru yang ada datanya
    })
  }, [])

  useEffect(() => {
    api.getTaxSummary(periodKey).then(setSummary)
  }, [periodKey])

  const periodLabel = useMemo(() => periods.find((p) => p.key === periodKey)?.label || '', [periods, periodKey])
  const kurangBayar = summary.selisih > 0

  const keluaranColumns = [
    { key: 'nomor', label: 'No. Invoice', sortable: true },
    { key: 'outletNama', label: 'Customer', sortable: true },
    { key: 'tanggal', label: 'Tanggal', sortable: true, render: (r) => formatDate(r.tanggal) },
    { key: 'subtotal', label: 'Subtotal', sortable: true, render: (r) => formatRupiah(r.subtotal) },
    { key: 'ppn', label: 'PPN (11%)', sortable: true, render: (r) => <span className="font-semibold text-brand">{formatRupiah(r.ppn)}</span> },
    { key: 'total', label: 'Total', sortable: true, render: (r) => <span className="font-semibold text-base-100">{formatRupiah(r.total)}</span> },
  ]

  const masukanColumns = [
    { key: 'nomor', label: 'No. PO', sortable: true },
    { key: 'supplier', label: 'Supplier', sortable: true },
    { key: 'tanggal', label: 'Tanggal', sortable: true, render: (r) => formatDate(r.tanggal) },
    { key: 'subtotal', label: 'Subtotal', sortable: true, render: (r) => formatRupiah(r.subtotal) },
    { key: 'ppn', label: 'PPN (11%)', sortable: true, render: (r) => <span className="font-semibold text-good">{formatRupiah(r.ppn)}</span> },
    { key: 'total', label: 'Total', sortable: true, render: (r) => <span className="font-semibold text-base-100">{formatRupiah(r.total)}</span> },
  ]

  function handleExport() {
    if (tab === 'keluaran') {
      exportCsv(
        `pajak-keluaran-${periodKey}.csv`,
        ['No. Invoice', 'Customer', 'Tanggal', 'Subtotal', 'PPN', 'Total'],
        summary.keluaran.map((r) => [r.nomor, r.outletNama, r.tanggal, r.subtotal, r.ppn, r.total])
      )
      printReport({
        title: 'Rekap Pajak Keluaran (PPN)',
        subtitle: periodLabel,
        headers: ['No. Invoice', 'Customer', 'Tanggal', 'Subtotal', 'PPN', 'Total'],
        rows: summary.keluaran.map((r) => [r.nomor, r.outletNama, formatDate(r.tanggal), formatRupiah(r.subtotal), formatRupiah(r.ppn), formatRupiah(r.total)]),
        totalLabel: 'Total PPN Keluaran',
        totalValue: formatRupiah(summary.pajakKeluaran),
      })
    } else {
      exportCsv(
        `pajak-masukan-${periodKey}.csv`,
        ['No. PO', 'Supplier', 'Tanggal', 'Subtotal', 'PPN', 'Total'],
        summary.masukan.map((r) => [r.nomor, r.supplier, r.tanggal, r.subtotal, r.ppn, r.total])
      )
      printReport({
        title: 'Rekap Pajak Masukan (PPN)',
        subtitle: periodLabel,
        headers: ['No. PO', 'Supplier', 'Tanggal', 'Subtotal', 'PPN', 'Total'],
        rows: summary.masukan.map((r) => [r.nomor, r.supplier, formatDate(r.tanggal), formatRupiah(r.subtotal), formatRupiah(r.ppn), formatRupiah(r.total)]),
        totalLabel: 'Total PPN Masukan',
        totalValue: formatRupiah(summary.pajakMasukan),
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-base-400">
            <Calendar size={15} /> Periode
          </div>
          <select
            value={periodKey}
            onChange={(e) => setPeriodKey(e.target.value)}
            className="bg-base-850 border border-base-700 rounded-lg px-3 py-1.5 text-xs text-base-200"
          >
            {periods.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-base-700 bg-base-900 text-xs font-semibold text-base-300 hover:bg-base-850"
        >
          <FileSpreadsheet size={14} /> Export
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Pajak Keluaran" value={formatRupiah(summary.pajakKeluaran)} sub={`PPN dari ${summary.keluaran.length} invoice · ${periodLabel}`} icon={ArrowUpCircle} accent="brand" />
        <KpiCard label="Pajak Masukan" value={formatRupiah(summary.pajakMasukan)} sub={`PPN dari ${summary.masukan.length} PO · ${periodLabel}`} icon={ArrowDownCircle} accent="good" />
        <KpiCard
          label={kurangBayar ? 'Kurang Bayar' : 'Lebih Bayar'}
          value={formatRupiah(Math.abs(summary.selisih))}
          sub="selisih pajak keluaran - masukan"
          icon={Scale}
          accent={kurangBayar ? 'bad' : 'good'}
          valueClassName={kurangBayar ? 'text-bad' : 'text-good'}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <ViewTab active={tab === 'keluaran'} onClick={() => setTab('keluaran')}>
          Pajak Keluaran ({summary.keluaran.length})
        </ViewTab>
        <ViewTab active={tab === 'masukan'} onClick={() => setTab('masukan')}>
          Pajak Masukan ({summary.masukan.length})
        </ViewTab>
      </div>

      {tab === 'keluaran' && (
        <DataTable
          columns={keluaranColumns}
          data={summary.keluaran}
          searchKeys={['nomor', 'outletNama']}
          searchPlaceholder="Cari no. invoice atau customer..."
          pageSize={12}
          emptyLabel="Tidak ada invoice kena PPN pada periode ini"
        />
      )}
      {tab === 'masukan' && (
        <DataTable
          columns={masukanColumns}
          data={summary.masukan}
          searchKeys={['nomor', 'supplier']}
          searchPlaceholder="Cari no. PO atau supplier..."
          pageSize={12}
          emptyLabel="Tidak ada PO kena PPN pada periode ini"
        />
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
