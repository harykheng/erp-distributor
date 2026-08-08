import { useEffect, useState } from 'react'
import { Trophy, MapPin, Target } from 'lucide-react'
import { api } from '../data/api'
import { formatRupiah, formatRupiahCompact } from '../lib/format'

export default function SalesRepPage() {
  const [reps, setReps] = useState([])
  const [selectedRep, setSelectedRep] = useState(null)
  const [rute, setRute] = useState([])

  useEffect(() => {
    api.getRepPerformance().then((rows) => {
      setReps(rows)
      if (rows.length) setSelectedRep(rows[0].id)
    })
  }, [])

  useEffect(() => {
    if (selectedRep) api.getRuteKunjungan(selectedRep).then(setRute)
  }, [selectedRep])

  const activeRep = reps.find((r) => r.id === selectedRep)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-base-800 bg-base-900 shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={17} className="text-brand" />
          <h3 className="font-bold text-base-100 text-sm">Leaderboard Penjualan Bulan Ini</h3>
        </div>
        <div className="space-y-3">
          {reps.map((rep, i) => (
            <button
              key={rep.id}
              onClick={() => setSelectedRep(rep.id)}
              className={`w-full flex items-center gap-4 p-3.5 rounded-xl border transition-colors text-left ${
                selectedRep === rep.id ? 'bg-brand/10 border-brand/40' : 'bg-base-850 border-base-800 hover:border-base-700'
              }`}
            >
              <div className="w-7 text-center font-extrabold text-base-500 shrink-0">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-base-950 shrink-0"
                style={{ backgroundColor: rep.fotoWarna }}
              >
                {rep.inisial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-base-100 truncate">{rep.nama}</span>
                  <span className="text-sm font-bold text-base-100 shrink-0">{formatRupiahCompact(rep.capaian)}</span>
                </div>
                <div className="text-xs text-base-500 mt-0.5">
                  {rep.zona} &middot; {rep.outletCount} outlet &middot; {rep.orderCount} order
                </div>
                <div className="w-full h-1.5 rounded-full bg-base-800 mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand transition-all"
                    style={{ width: `${rep.persentase}%` }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0 w-14">
                <div className="text-sm font-bold text-base-100">{rep.persentase}%</div>
                <div className="text-[10px] text-base-500">target</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeRep && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-base-800 bg-base-900 shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target size={17} className="text-brand" />
              <h3 className="font-bold text-base-100 text-sm">Target vs Capaian — {activeRep.nama}</h3>
            </div>
            <div className="space-y-3 text-sm">
              <Row label="Target Bulanan" value={formatRupiah(activeRep.targetBulanan)} />
              <Row label="Capaian" value={formatRupiah(activeRep.capaian)} />
              <Row label="Sisa Menuju Target" value={formatRupiah(Math.max(0, activeRep.targetBulanan - activeRep.capaian))} />
              <Row label="Jumlah Outlet Di-assign" value={activeRep.outletCount} />
              <Row label="Order Bulan Ini" value={activeRep.orderCount} />
            </div>
          </div>

          <div className="rounded-2xl border border-base-800 bg-base-900 shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={17} className="text-brand" />
              <h3 className="font-bold text-base-100 text-sm">Rute Kunjungan — {activeRep.nama}</h3>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {rute.map((zona) => (
                <div key={zona.zona}>
                  <div className="text-xs font-semibold text-base-400 uppercase tracking-wide mb-2">
                    {zona.zona} ({zona.outlets.length} outlet)
                  </div>
                  <div className="space-y-1">
                    {zona.outlets.map((o) => (
                      <div key={o.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-base-850 text-sm">
                        <span className="text-base-200">{o.nama}</span>
                        <span className="text-xs text-base-500">{o.tipe}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-base-500">{label}</span>
      <span className="font-semibold text-base-100">{value}</span>
    </div>
  )
}
