import { useEffect, useMemo, useState } from 'react'
import { MessageCircle, Wallet, Landmark } from 'lucide-react'
import { api } from '../data/api'
import { useAppStore } from '../store/useAppStore'
import DataTable from '../components/common/DataTable'
import KpiCard from '../components/common/KpiCard'
import AgingBar from '../components/common/AgingBar'
import Badge from '../components/common/Badge'
import PaymentModal from '../components/ar/PaymentModal'
import { formatRupiah, formatDate } from '../lib/format'
import { agingBuckets } from '../data/ar'
import { waReminderLink } from '../data/api'

const bucketVariant = {
  belum_jatuh_tempo: 'good',
  lewat_1_7: 'warn',
  lewat_8_30: 'bad',
  lewat_30: 'bad',
}

export default function PiutangPage() {
  const dataVersion = useAppStore((s) => s.dataVersion)
  const [receivables, setReceivables] = useState([])
  const [bucketFilter, setBucketFilter] = useState('semua')
  const [payReceivable, setPayReceivable] = useState(null)

  useEffect(() => {
    api.getReceivables().then(setReceivables)
  }, [dataVersion])

  const buckets = useMemo(() => {
    const map = Object.fromEntries(agingBuckets.map((b) => [b.key, 0]))
    receivables.forEach((r) => (map[r.bucket] += r.sisa))
    return agingBuckets.map((b) => ({ ...b, total: map[b.key] }))
  }, [receivables])

  const total = receivables.reduce((s, r) => s + r.sisa, 0)
  const overdueCount = receivables.filter((r) => r.bucket !== 'belum_jatuh_tempo').length

  const filtered = bucketFilter === 'semua' ? receivables : receivables.filter((r) => r.bucket === bucketFilter)

  const columns = [
    { key: 'outletNama', label: 'Outlet', sortable: true },
    { key: 'nomorOrder', label: 'No. Order', sortable: true },
    { key: 'jatuhTempo', label: 'Jatuh Tempo', sortable: true, render: (r) => formatDate(r.jatuhTempo) },
    {
      key: 'bucket',
      label: 'Status',
      sortable: true,
      render: (r) => {
        const b = agingBuckets.find((x) => x.key === r.bucket)
        return (
          <Badge variant={bucketVariant[r.bucket]} dot>
            {r.overdueDays > 0 ? `Telat ${r.overdueDays} hari` : b.label}
          </Badge>
        )
      },
    },
    { key: 'sisa', label: 'Sisa Tagihan', sortable: true, render: (r) => <span className="font-bold text-base-100">{formatRupiah(r.sisa)}</span> },
    {
      key: 'action',
      label: '',
      render: (r) => (
        <div className="flex items-center gap-2">
          <a
            href={waReminderLink(r)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-good/10 text-good text-xs font-semibold hover:bg-good/20"
          >
            <MessageCircle size={13} /> Reminder
          </a>
          <button
            onClick={() => setPayReceivable(r)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-brand/10 text-brand text-xs font-semibold hover:bg-brand/20"
          >
            <Wallet size={13} /> Bayar
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Total Piutang Outstanding" value={formatRupiah(total)} sub="seluruh outlet" icon={Landmark} accent="warn" />
        <KpiCard label="Jumlah Tagihan" value={receivables.length} sub="invoice belum lunas" icon={Wallet} accent="brand" />
        <KpiCard label="Sudah Lewat Jatuh Tempo" value={overdueCount} sub="perlu ditagih segera" icon={MessageCircle} accent="bad" />
      </div>

      <div className="rounded-2xl border border-base-800 bg-base-900 shadow-card p-5">
        <h3 className="font-bold text-base-100 text-sm mb-4">Aging Piutang</h3>
        <AgingBar buckets={buckets} total={total} />
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={bucketFilter === 'semua'} onClick={() => setBucketFilter('semua')}>
          Semua ({receivables.length})
        </FilterChip>
        {agingBuckets.map((b) => (
          <FilterChip key={b.key} active={bucketFilter === b.key} onClick={() => setBucketFilter(b.key)} color={b.color}>
            {b.label} ({receivables.filter((r) => r.bucket === b.key).length})
          </FilterChip>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchKeys={['outletNama', 'nomorOrder']}
        searchPlaceholder="Cari outlet atau nomor order..."
        emptyLabel="Tidak ada piutang pada kategori ini"
      />

      <PaymentModal receivable={payReceivable} onClose={() => setPayReceivable(null)} />
    </div>
  )
}

function FilterChip({ active, onClick, children, color }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
        active
          ? 'bg-base-800 border-base-600 text-base-100'
          : 'bg-base-900 border-base-800 text-base-400 hover:text-base-200 hover:border-base-700'
      }`}
    >
      {color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
      {children}
    </button>
  )
}
