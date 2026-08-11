import { useEffect, useMemo, useState } from 'react'
import { ShoppingBag, Wallet, Package, Plus } from 'lucide-react'
import { api } from '../data/api'
import { warehouses } from '../data/warehouses'
import { useAppStore } from '../store/useAppStore'
import DataTable from '../components/common/DataTable'
import Badge from '../components/common/Badge'
import KpiCard from '../components/common/KpiCard'
import CreatePurchaseModal from '../components/purchasing/CreatePurchaseModal'
import { formatRupiah, formatDate, daysBetween } from '../lib/format'

export default function PurchasingPage() {
  const dataVersion = useAppStore((s) => s.dataVersion)
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion)
  const [purchases, setPurchases] = useState([])
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    api.getPurchases().then(setPurchases)
  }, [dataVersion])

  const purchasesThisMonth = useMemo(
    () => purchases.filter((p) => daysBetween(new Date(p.tanggal), new Date('2026-08-08')) <= 30),
    [purchases]
  )
  const totalBulanIni = purchasesThisMonth.reduce((s, p) => s + p.totalBiaya, 0)
  const supplierCount = new Set(purchases.map((p) => p.supplier)).size

  const columns = [
    { key: 'nomor', label: 'No. PO', sortable: true },
    { key: 'tanggal', label: 'Tanggal', sortable: true, render: (p) => formatDate(p.tanggal) },
    { key: 'supplier', label: 'Supplier', sortable: true },
    { key: 'productNama', label: 'Produk', sortable: true },
    { key: 'qty', label: 'Qty', sortable: true, render: (p) => `${p.qty} ${p.satuan}` },
    { key: 'hargaBeli', label: 'Harga Beli', sortable: true, render: (p) => formatRupiah(p.hargaBeli) },
    { key: 'totalBiaya', label: 'Total Biaya', sortable: true, render: (p) => <span className="font-semibold text-base-100">{formatRupiah(p.totalBiaya)}</span> },
    { key: 'warehouseId', label: 'Gudang', render: (p) => warehouses.find((w) => w.id === p.warehouseId)?.nama },
    {
      key: 'status',
      label: 'Status',
      render: () => <Badge variant="good" dot>Diterima</Badge>,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Pembelian Bulan Ini" value={formatRupiah(totalBulanIni)} sub="30 hari terakhir" icon={Wallet} accent="brand" />
        <KpiCard label="Jumlah PO" value={purchases.length} sub="total pembelian tercatat" icon={ShoppingBag} accent="good" />
        <KpiCard label="Supplier Aktif" value={supplierCount} sub="pemasok berbeda" icon={Package} accent="warn" />
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand text-ink text-sm font-bold hover:bg-brand-400 shadow-card"
        >
          <Plus size={16} strokeWidth={2.5} /> Catat Pembelian
        </button>
      </div>

      <DataTable
        columns={columns}
        data={purchases}
        searchKeys={['nomor', 'supplier', 'productNama']}
        searchPlaceholder="Cari no. PO, supplier, atau produk..."
        pageSize={12}
        toolbarRight={<span className="text-xs text-base-500">{purchases.length} pembelian tercatat</span>}
      />

      <CreatePurchaseModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => bumpDataVersion()}
      />
    </div>
  )
}
