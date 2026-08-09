import { useMemo, useState } from 'react'
import { Plus, Target, Store, Clock, ChevronDown, Search, Boxes } from 'lucide-react'
import { salesReps } from '../data/salesReps'
import { outlets } from '../data/outlets'
import { orders } from '../data/orders'
import { useAppStore } from '../store/useAppStore'
import Badge, { statusVariant, statusLabel } from '../components/common/Badge'
import ThemeToggle from '../components/common/ThemeToggle'
import RequestOrderModal from '../components/salesportal/RequestOrderModal'
import { formatRupiah, formatRupiahCompact, formatDate } from '../lib/format'
import { repPerformance } from '../data/repPerformance'

function outletName(id) {
  return outlets.find((o) => o.id === id)?.nama || '-'
}

export default function SalesAppPage() {
  const dataVersion = useAppStore((s) => s.dataVersion)
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion)
  const [repId, setRepId] = useState(salesReps[0].id)
  const [repPickerOpen, setRepPickerOpen] = useState(false)
  const [requestOpen, setRequestOpen] = useState(false)
  const [query, setQuery] = useState('')

  const performance = useMemo(() => repPerformance().find((r) => r.id === repId), [repId, dataVersion])
  const rep = salesReps.find((r) => r.id === repId)
  const repOutlets = useMemo(() => outlets.filter((o) => o.salesRepId === repId), [repId])

  const myOrders = useMemo(
    () => orders.filter((o) => o.salesRepId === repId).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)),
    [repId, dataVersion]
  )
  const pendingCount = myOrders.filter((o) => o.status === 'diajukan').length
  const filteredOrders = query ? myOrders.filter((o) => o.nomor.toLowerCase().includes(query.toLowerCase())) : myOrders

  return (
    <div className="min-h-screen bg-base-950 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-base-950 md:border-x md:border-base-800 flex flex-col relative">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-base-950/90 backdrop-blur-md border-b border-base-800 px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center shrink-0">
                <Boxes size={15} className="text-ink" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-extrabold text-base-100">Portal Sales</span>
            </div>
            <ThemeToggle />
          </div>

          <div className="relative">
            <button
              onClick={() => setRepPickerOpen((v) => !v)}
              className="w-full flex items-center gap-3 bg-base-900 border border-base-800 rounded-xl px-3 py-2.5"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-ink shrink-0"
                style={{ backgroundColor: rep?.fotoWarna }}
              >
                {rep?.inisial}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-[10px] text-base-500 uppercase tracking-wide">Login sebagai</div>
                <div className="text-sm font-bold text-base-100 truncate">{rep?.nama}</div>
              </div>
              <ChevronDown size={16} className={`text-base-500 transition-transform ${repPickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {repPickerOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-base-900 border border-base-800 rounded-xl overflow-hidden shadow-pop z-30 divide-y divide-base-800">
                {salesReps.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRepId(r.id)
                      setRepPickerOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-base-850 ${
                      r.id === repId ? 'bg-brand/10' : ''
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-ink shrink-0"
                      style={{ backgroundColor: r.fotoWarna }}
                    >
                      {r.inisial}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-sm font-semibold truncate ${r.id === repId ? 'text-brand' : 'text-base-200'}`}>{r.nama}</div>
                      <div className="text-[11px] text-base-500">{r.zona}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-5">
          <div className="grid grid-cols-3 gap-2">
            <StatChip icon={Target} label="Capaian" value={performance ? formatRupiahCompact(performance.capaian) : '...'} accent="brand" />
            <StatChip icon={Store} label="Outlet" value={repOutlets.length} accent="good" />
            <StatChip icon={Clock} label="Menunggu" value={pendingCount} accent="warn" />
          </div>

          {rep && performance && (
            <div className="rounded-2xl border border-base-800 bg-base-900 p-4">
              <div className="flex items-center justify-between text-xs text-base-400 mb-2">
                <span>Target Bulanan</span>
                <span className="font-semibold text-base-200">{formatRupiah(rep.targetBulanan)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-base-800 overflow-hidden">
                <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${performance.persentase}%` }} />
              </div>
              <div className="text-[11px] text-base-500 mt-1.5">{performance.persentase}% tercapai &middot; {formatRupiah(performance.capaian)}</div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-base-100">Order Saya</span>
              <span className="text-xs text-base-500">{filteredOrders.length} order</span>
            </div>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nomor order..."
                className="w-full bg-base-900 border border-base-800 rounded-lg pl-8 pr-3 py-2 text-sm text-base-100 placeholder:text-base-500 focus:outline-none focus:ring-1 focus:ring-brand/60"
              />
            </div>

            <div className="space-y-2">
              {filteredOrders.length === 0 && (
                <div className="text-sm text-base-500 text-center py-8 border border-dashed border-base-800 rounded-xl">
                  Belum ada order
                </div>
              )}
              {filteredOrders.map((o) => (
                <div key={o.id} className="rounded-xl border border-base-800 bg-base-900 p-3.5">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-sm font-bold text-base-100">{o.nomor}</span>
                    <Badge variant={statusVariant[o.status]} dot>{statusLabel[o.status]}</Badge>
                  </div>
                  <div className="text-xs text-base-400">{outletName(o.outletId)} &middot; {formatDate(o.tanggal)}</div>
                  {o.catatan && <div className="text-xs text-base-500 mt-1 italic">"{o.catatan}"</div>}
                  <div className="text-sm font-extrabold text-base-100 mt-2">{formatRupiah(o.total)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating CTA */}
        <div className="sticky bottom-0 px-4 pb-5 pt-3 bg-gradient-to-t from-base-950 via-base-950/95 to-transparent">
          <button
            onClick={() => setRequestOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand text-ink font-bold text-sm hover:bg-brand-400 shadow-pop transition-colors"
          >
            <Plus size={18} strokeWidth={2.5} /> Ajukan Order Baru
          </button>
        </div>

        <RequestOrderModal
          open={requestOpen}
          onClose={() => setRequestOpen(false)}
          repId={repId}
          onCreated={() => bumpDataVersion()}
        />
      </div>
    </div>
  )
}

function StatChip({ icon: Icon, label, value, accent }) {
  const accentClasses = {
    brand: 'text-brand bg-brand/10',
    good: 'text-good bg-good/10',
    warn: 'text-warn bg-warn/10',
  }
  return (
    <div className="rounded-xl border border-base-800 bg-base-900 p-2.5">
      <div className={`w-6 h-6 rounded-md flex items-center justify-center mb-1.5 ${accentClasses[accent]}`}>
        <Icon size={13} />
      </div>
      <div className="text-sm font-extrabold text-base-100 leading-tight">{value}</div>
      <div className="text-[10px] text-base-500">{label}</div>
    </div>
  )
}
