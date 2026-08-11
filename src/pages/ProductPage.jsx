import { useEffect, useState } from 'react'
import { Package, AlertTriangle, Tag, Plus } from 'lucide-react'
import { api } from '../data/api'
import { isProductCritical } from '../data/products'
import { useAppStore } from '../store/useAppStore'
import DataTable from '../components/common/DataTable'
import Badge from '../components/common/Badge'
import KpiCard from '../components/common/KpiCard'
import AddProductModal from '../components/inventory/AddProductModal'
import { formatRupiah } from '../lib/format'

export default function ProductPage() {
  const dataVersion = useAppStore((s) => s.dataVersion)
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion)
  const [products, setProducts] = useState([])
  const [addProductOpen, setAddProductOpen] = useState(false)

  useEffect(() => {
    api.getProducts().then(setProducts)
  }, [dataVersion])

  const criticalCount = products.filter(isProductCritical).length
  const categoryCount = new Set(products.map((p) => p.kategori)).size

  const columns = [
    {
      key: 'nama',
      label: 'Produk',
      sortable: true,
      render: (p) => (
        <div>
          <div className="font-medium text-base-100">{p.nama}</div>
          <div className="text-xs text-base-500">{p.sku}</div>
        </div>
      ),
    },
    { key: 'kategori', label: 'Kategori', sortable: true },
    { key: 'satuan', label: 'Satuan', sortable: true },
    { key: 'isi', label: 'Isi', render: (p) => <span className="text-base-400">{p.isi}</span> },
    { key: 'harga', label: 'Harga Jual', sortable: true, render: (p) => formatRupiah(p.harga) },
    { key: 'hargaModal', label: 'Harga Modal', sortable: true, render: (p) => <span className="text-base-400">{formatRupiah(p.hargaModal)}</span> },
    { key: 'totalStok', label: 'Total Stok', sortable: true, render: (p) => <span className="font-semibold text-base-100">{p.totalStok} {p.satuan}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (p) =>
        isProductCritical(p) ? (
          <Badge variant="bad" dot>Kritis</Badge>
        ) : (
          <Badge variant="good" dot>Aman</Badge>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Total Produk" value={products.length} sub="SKU terdaftar" icon={Package} accent="brand" />
        <KpiCard label="Stok Kritis" value={criticalCount} sub="perlu segera direstock" icon={AlertTriangle} accent="bad" />
        <KpiCard label="Kategori" value={categoryCount} sub="kategori produk" icon={Tag} accent="good" />
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={() => setAddProductOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand text-ink text-sm font-bold hover:bg-brand-400 shadow-card"
        >
          <Plus size={16} strokeWidth={2.5} /> Tambah Produk
        </button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        searchKeys={['nama', 'sku', 'kategori']}
        searchPlaceholder="Cari produk, SKU, atau kategori..."
        pageSize={14}
        toolbarRight={<span className="text-xs text-base-500">{products.length} produk terdaftar</span>}
      />

      <AddProductModal
        open={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        onCreated={() => {
          setAddProductOpen(false)
          bumpDataVersion()
        }}
      />
    </div>
  )
}
