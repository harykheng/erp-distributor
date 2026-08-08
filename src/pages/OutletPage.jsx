import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store } from 'lucide-react'
import { api } from '../data/api'
import { salesReps } from '../data/salesReps'
import { orders } from '../data/orders'
import { receivables } from '../data/ar'
import DataTable from '../components/common/DataTable'
import Badge from '../components/common/Badge'
import { formatRupiah, formatDate } from '../lib/format'

function repName(id) {
  return salesReps.find((r) => r.id === id)?.nama || '-'
}

export default function OutletPage() {
  const navigate = useNavigate()
  const [outlets, setOutlets] = useState([])

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
  }, [])

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
        render: (r) => <Badge variant={r.aktif ? 'good' : 'default'} dot>{r.aktif ? 'Aktif' : 'Nonaktif'}</Badge>,
      },
    ],
    []
  )

  return (
    <div className="space-y-5">
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
    </div>
  )
}
