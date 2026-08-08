import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Store, Phone, MapPin, Wallet, User, Calendar } from 'lucide-react'
import { api } from '../data/api'
import { salesReps } from '../data/salesReps'
import { useAppStore } from '../store/useAppStore'
import KpiCard from '../components/common/KpiCard'
import Badge, { statusVariant, statusLabel } from '../components/common/Badge'
import { formatRupiah, formatDate } from '../lib/format'

export default function OutletDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dataVersion = useAppStore((s) => s.dataVersion)
  const [outlet, setOutlet] = useState(null)
  const [history, setHistory] = useState([])
  const [piutang, setPiutang] = useState([])

  useEffect(() => {
    api.getOutlet(id).then(setOutlet)
    api.getOutletHistory(id).then(setHistory)
    api.getPiutangByOutlet(id).then(setPiutang)
  }, [id, dataVersion])

  if (!outlet) return <div className="text-base-500 text-sm">Memuat...</div>

  const rep = salesReps.find((r) => r.id === outlet.salesRepId)
  const totalPiutangOutlet = piutang.reduce((s, r) => s + r.sisa, 0)
  const totalBelanja = history.reduce((s, o) => s + o.total, 0)

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/outlet')}
        className="flex items-center gap-1.5 text-sm text-base-400 hover:text-base-100"
      >
        <ArrowLeft size={15} /> Kembali ke Daftar Outlet
      </button>

      <div className="rounded-2xl border border-base-800 bg-base-900 shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <Store size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-base-100">{outlet.nama}</h2>
              <div className="flex items-center gap-3 text-sm text-base-400 mt-1">
                <span>{outlet.tipe}</span>
                <span className="w-1 h-1 rounded-full bg-base-600" />
                <span>{outlet.zona}</span>
              </div>
            </div>
          </div>
          <Badge variant={outlet.aktif ? 'good' : 'default'} dot>
            {outlet.aktif ? 'Aktif' : 'Nonaktif'}
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 text-sm">
          <DetailRow icon={MapPin} label="Alamat" value={outlet.alamat} />
          <DetailRow icon={Phone} label="Telepon" value={outlet.telepon} />
          <DetailRow icon={User} label="Sales Rep" value={rep?.nama} />
          <DetailRow icon={Calendar} label="Bergabung Sejak" value={formatDate(outlet.bergabungSejak)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Total Belanja" value={formatRupiah(totalBelanja)} sub={`${history.length} order`} icon={Wallet} accent="brand" />
        <KpiCard label="Piutang Berjalan" value={formatRupiah(totalPiutangOutlet)} sub={`${piutang.length} tagihan`} icon={Wallet} accent="warn" />
        <KpiCard label="Limit Kredit" value={formatRupiah(outlet.kreditLimit)} sub="batas piutang diizinkan" icon={Wallet} accent="good" />
      </div>

      <div className="rounded-2xl border border-base-800 bg-base-900 shadow-card p-5">
        <h3 className="font-bold text-base-100 text-sm mb-4">Histori Order</h3>
        <div className="space-y-2">
          {history.length === 0 && <div className="text-sm text-base-500">Belum ada order dari outlet ini.</div>}
          {history.map((o) => (
            <div key={o.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-base-850">
              <div>
                <div className="text-sm text-base-200 font-medium">{o.nomor}</div>
                <div className="text-xs text-base-500">{formatDate(o.tanggal)} &middot; {o.items.length} item</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-base-100">{formatRupiah(o.total)}</span>
                <Badge variant={statusVariant[o.status]} dot>{statusLabel[o.status]}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="text-base-500 mt-0.5 shrink-0" />
      <div>
        <div className="text-[11px] text-base-500 uppercase tracking-wide">{label}</div>
        <div className="text-base-200">{value}</div>
      </div>
    </div>
  )
}
