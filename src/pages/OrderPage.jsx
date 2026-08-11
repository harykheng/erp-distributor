import { useEffect, useMemo, useState } from 'react'
import { Plus, Truck, Eye, Printer, FileText, MessageCircle, CheckCircle2, XCircle, Send } from 'lucide-react'
import { api } from '../data/api'
import { outlets } from '../data/outlets'
import { salesReps } from '../data/salesReps'
import { useAppStore } from '../store/useAppStore'
import DataTable from '../components/common/DataTable'
import Badge, { statusVariant, statusLabel } from '../components/common/Badge'
import Modal from '../components/common/Modal'
import { formatRupiah, formatDate } from '../lib/format'
import { statusFlow, orderWaLink } from '../data/orders'
import { printInvoice, printSuratJalan } from '../lib/print'

function outletName(id) {
  return outlets.find((o) => o.id === id)?.nama || '-'
}
function repName(id) {
  return salesReps.find((r) => r.id === id)?.nama || '-'
}

export default function OrderPage() {
  const dataVersion = useAppStore((s) => s.dataVersion)
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion)
  const openOrderDrawer = useAppStore((s) => s.openOrderDrawer)
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('semua')
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    api.getOrders().then((rows) =>
      setOrders(rows.map((o) => ({ ...o, outletNama: outletName(o.outletId), repNama: repName(o.salesRepId) })))
    )
  }, [dataVersion])

  async function handleVerify(orderId, approve) {
    await api.verifyOrderRequest(orderId, approve)
    bumpDataVersion()
    setDetail(null)
  }

  async function handleShip(orderId) {
    await api.markAsShipped(orderId)
    bumpDataVersion()
    setDetail(null)
  }

  const filtered = useMemo(() => {
    if (statusFilter === 'semua') return orders
    return orders.filter((o) => o.status === statusFilter)
  }, [orders, statusFilter])

  const columns = [
    { key: 'nomor', label: 'No. Order', sortable: true },
    { key: 'outletNama', label: 'Outlet', sortable: true },
    { key: 'repNama', label: 'Sales Rep', sortable: true },
    { key: 'tanggal', label: 'Tanggal', sortable: true, render: (r) => formatDate(r.tanggal) },
    { key: 'total', label: 'Total', sortable: true, render: (r) => <span className="font-semibold text-base-100">{formatRupiah(r.total)}</span> },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (r) => <Badge variant={statusVariant[r.status]} dot>{statusLabel[r.status]}</Badge>,
    },
    {
      key: 'suratJalanNumber',
      label: 'Surat Jalan',
      render: (r) => (r.suratJalanNumber ? <span className="text-xs text-base-400">{r.suratJalanNumber}</span> : <span className="text-xs text-base-600">-</span>),
    },
    {
      key: 'action',
      label: '',
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDetail(r)}
            className="flex items-center gap-1.5 text-xs text-brand font-semibold hover:underline"
          >
            <Eye size={13} /> Detail
          </button>
          {r.status === 'diajukan' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleVerify(r.id, true)
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-good/10 text-good text-xs font-semibold hover:bg-good/20"
              >
                <CheckCircle2 size={13} /> Verifikasi
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleVerify(r.id, false)
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-bad/10 text-bad text-xs font-semibold hover:bg-bad/20"
              >
                <XCircle size={13} /> Tolak
              </button>
            </>
          )}
          {(r.status === 'draft' || r.status === 'diproses') && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleShip(r.id)
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-brand/10 text-brand text-xs font-semibold hover:bg-brand/20"
            >
              <Truck size={13} /> Kirim Sekarang
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={statusFilter === 'semua'} onClick={() => setStatusFilter('semua')}>
            Semua ({orders.length})
          </FilterChip>
          {statusFlow.map((s) => (
            <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              {statusLabel[s]} ({orders.filter((o) => o.status === s).length})
            </FilterChip>
          ))}
        </div>
        <button
          onClick={openOrderDrawer}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand text-ink text-sm font-bold hover:bg-brand-400 shadow-card"
        >
          <Plus size={16} strokeWidth={2.5} /> Order Baru
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchKeys={['nomor', 'outletNama', 'repNama']}
        searchPlaceholder="Cari nomor order atau outlet..."
        emptyLabel="Belum ada order untuk status ini"
      />

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.nomor} width="max-w-lg">
        {detail && (
          <div className="space-y-4">
            {detail.sumber === 'sales' && (
              <div className="flex items-center gap-2 bg-warn/10 text-warn text-xs font-semibold rounded-lg px-3 py-2.5">
                <Send size={14} /> Diajukan oleh {detail.repNama}
                {detail.catatan ? ` — "${detail.catatan}"` : ''}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="Outlet" value={detail.outletNama} />
              <InfoRow label="Sales Rep" value={detail.repNama} />
              <InfoRow label="Tanggal" value={formatDate(detail.tanggal)} />
              <InfoRow label="Jatuh Tempo" value={formatDate(detail.jatuhTempo)} />
              <InfoRow label="Status" value={statusLabel[detail.status]} />
              <InfoRow label="Surat Jalan" value={detail.suratJalanNumber || '-'} />
              <InfoRow label="Pajak" value={detail.kenaPPN ? 'Kena PPN 11%' : 'Non-PPN'} />
            </div>
            <div className="border-t border-base-800 pt-3">
              <div className="text-xs font-semibold text-base-400 uppercase tracking-wide mb-2">Item</div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {detail.items.map((it) => (
                  <div key={it.productId} className="flex items-center justify-between text-sm">
                    <span className="text-base-300">{it.qty} {it.satuan} &times; {it.nama}</span>
                    <span className="text-base-100 font-medium">{formatRupiah(it.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-base-800 mt-3 pt-3 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-base-400">Subtotal</span>
                  <span className="text-base-200 font-medium">{formatRupiah(detail.subtotal ?? detail.total)}</span>
                </div>
                {detail.kenaPPN && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-400">PPN (11%)</span>
                    <span className="text-base-200 font-medium">{formatRupiah(detail.ppn)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-base-800 pt-1.5">
                  <span className="text-sm font-semibold text-base-200">Total</span>
                  <span className="text-base font-extrabold text-base-100">{formatRupiah(detail.total)}</span>
                </div>
              </div>
            </div>
            {detail.suratJalanNumber && (
              <div className="flex items-center gap-2 bg-brand/10 text-brand text-xs font-semibold rounded-lg px-3 py-2.5">
                <Truck size={14} /> Surat jalan {detail.suratJalanNumber} sudah diterbitkan
              </div>
            )}

            {detail.status === 'diajukan' ? (
              <div className="flex gap-2 border-t border-base-800 pt-4">
                <button
                  onClick={() => handleVerify(detail.id, true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-good/10 text-good text-sm font-bold hover:bg-good/20"
                >
                  <CheckCircle2 size={15} /> Verifikasi & Kirim
                </button>
                <button
                  onClick={() => handleVerify(detail.id, false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-bad/10 text-bad text-sm font-bold hover:bg-bad/20"
                >
                  <XCircle size={15} /> Tolak
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 border-t border-base-800 pt-4">
                {(detail.status === 'draft' || detail.status === 'diproses') && (
                  <button
                    onClick={() => handleShip(detail.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand/10 text-brand text-xs font-semibold hover:bg-brand/20"
                  >
                    <Truck size={13} /> Kirim Sekarang
                  </button>
                )}
                <button
                  onClick={() => printInvoice(detail, outlets.find((o) => o.id === detail.outletId))}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-base-700 bg-base-850 text-xs font-semibold text-base-200 hover:bg-base-800"
                >
                  <Printer size={13} /> Print Invoice
                </button>
                <button
                  onClick={() => printSuratJalan(detail, outlets.find((o) => o.id === detail.outletId))}
                  disabled={!detail.suratJalanNumber}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-base-700 bg-base-850 text-xs font-semibold text-base-200 hover:bg-base-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FileText size={13} /> Print Surat Jalan
                </button>
                <a
                  href={orderWaLink(detail)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-good/10 text-good text-xs font-semibold hover:bg-good/20"
                >
                  <MessageCircle size={13} /> Kirim WhatsApp
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
        active
          ? 'bg-brand/10 border-brand/40 text-brand'
          : 'bg-base-900 border-base-800 text-base-400 hover:text-base-200 hover:border-base-700'
      }`}
    >
      {children}
    </button>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div className="text-[11px] text-base-500 uppercase tracking-wide">{label}</div>
      <div className="text-base-200 font-medium mt-0.5">{value}</div>
    </div>
  )
}
