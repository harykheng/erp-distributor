import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, Plus } from 'lucide-react'
import { api } from '../data/api'
import { salesReps } from '../data/salesReps'
import { orders } from '../data/orders'
import { receivables } from '../data/ar'
import { useAppStore } from '../store/useAppStore'
import DataTable from '../components/common/DataTable'
import Switch from '../components/common/Switch'
import AddOutletModal from '../components/outlets/AddOutletModal'
import { formatRupiah, formatDate } from '../lib/format'

function repName(id) {
  return salesReps.find((r) => r.id === id)?.nama || '-'
}

export default function OutletPage() {
  const navigate = useNavigate()
  const dataVersion = useAppStore((s) => s.dataVersion)
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion)
  const [outlets, setOutlets] = useState([])
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => {
    api.getOutlets().then((rows) => {
      setOutlets(
        rows.map((o) => {
          const outletOrders = orders.filter((x) => x.outletId === o.id)
          const lastOrder = outletOrders[0]
          const piutang = receivables.filter((r) => r.outletId === o.id).reduce((s, r) => s + r.sisa, 0)
          return {
            ...o,
            repNama: repName(o.salesRepId),
            totalOrder: outletOrders.length,
            lastOrderDate: lastOrder?.tanggal || null,
            piutang,
          }
        })
      )
    })
  }, [dataVersion])

  async function handleToggleStatus(outletId, aktif) {
    await api.setOutletStatus(outletId, aktif)
    bumpDataVersion()
  }

  const columns = useMemo(
    () => [
      {
        key: 'nama',
        label: 'Outlet',
        sortable: true,
        render: (r) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <Store size={14} />
            </div>
            <div>
              <div className="font-medium text-base-100">{r.nama}</div>
              <div className="text-xs text-base-500">{r.tipe}</div>
            </div>
          </div>
        ),
      },
      { key: 'zona', label: 'Zona', sortable: true },
      { key: 'repNama', label: 'Sales Rep', sortable: true },
      { key: 'kreditLimit', label: 'Limit Kredit', sortable: true, render: (r) => formatRupiah(r.kreditLimit) },
      {
        key: 'piutang',
        label: 'Piutang Berjalan',
        sortable: true,
        render: (r) => (r.piutang > 0 ? <span className="text-warn font-semibold">{formatRupiah(r.piutang)}</span> : <span className="text-base-500">-</span>),
      },
      {
        key: 'lastOrderDate',
        label: 'Order Terakhir',
        sortable: true,
        render: (r) => (r.lastOrderDate ? formatDate(r.lastOrderDate) : <span className="text-base-500">Belum pernah</span>),
      },
      {
        key: 'aktif',
        label: 'Status',
        render: (r) => (
          <div className="flex items-center gap-2">
            <Switch checked={r.aktif} onChange={(next) => handleToggleStatus(r.id, next)} />
            <span className={`text-xs font-semibold ${r.aktif ? 'text-good' : 'text-base-500'}`}>
              {r.aktif ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand text-ink text-sm font-bold hover:bg-brand-400 shadow-card"
        >
          <Plus size={16} strokeWidth={2.5} /> Tambah Outlet
        </button>
      </div>

      <DataTable
        columns={columns}
        data={outlets}
        searchKeys={['nama', 'zona', 'repNama']}
        searchPlaceholder="Cari outlet, zona, atau sales rep..."
        pageSize={12}
        rowKey={(r) => r.id}
        onRowClick={(row) => navigate(`/outlet/${row.id}`)}
        toolbarRight={<span className="text-xs text-base-500">{outlets.length} outlet terdaftar</span>}
      />
      <div className="text-xs text-base-500">Klik baris untuk melihat detail — atau gunakan Cmd/Ctrl+K untuk pencarian cepat.</div>

      <AddOutletModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          setAddOpen(false)
          bumpDataVersion()
        }}
      />
    </div>
  )
}
