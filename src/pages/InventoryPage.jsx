import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Package, ArrowDownToLine, ArrowUpFromLine, Undo2, Plus, Warehouse as WarehouseIcon } from 'lucide-react'
import { api } from '../data/api'
import { warehouses } from '../data/warehouses'
import { isProductCritical } from '../data/products'
import { useAppStore } from '../store/useAppStore'
import DataTable from '../components/common/DataTable'
import Badge from '../components/common/Badge'
import KpiCard from '../components/common/KpiCard'
import AddProductModal from '../components/inventory/AddProductModal'
import CreateReturnModal from '../components/inventory/CreateReturnModal'
import { formatRupiah, formatDate } from '../lib/format'

const tabs = [
  { key: 'stok', label: 'Stok per Gudang' },
  { key: 'mutasi', label: 'Riwayat Mutasi' },
  { key: 'retur', label: 'Retur Barang' },
]

const jenisMeta = {
  masuk: { label: 'Masuk', variant: 'good', icon: ArrowDownToLine },
  keluar: { label: 'Keluar', variant: 'brand', icon: ArrowUpFromLine },
  retur: { label: 'Retur', variant: 'warn', icon: Undo2 },
}

const alasanVariant = { rusak: 'bad', kadaluarsa: 'warn', salah_kirim: 'brand' }

export default function InventoryPage() {
  const dataVersion = useAppStore((s) => s.dataVersion)
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion)
  const [tab, setTab] = useState('stok')
  const [products, setProducts] = useState([])
  const [mutations, setMutations] = useState([])
  const [returns, setReturns] = useState([])
  const [whFilter, setWhFilter] = useState('semua')
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [createReturnOpen, setCreateReturnOpen] = useState(false)

  useEffect(() => {
    api.getProducts().then(setProducts)
    api.getMutations().then(setMutations)
    api.getReturns().then(setReturns)
  }, [dataVersion])

  const criticalCount = products.filter(isProductCritical).length

  const stokColumns = useMemo(
    () => [
      {
        key: 'nama',
        label: 'Produk',
        sortable: true,
        render: (p) => (
          <div>
            <div className="font-medium text-base-100">{p.nama}</div>
            <div className="text-xs text-base-500">{p.sku} &middot; {p.kategori}</div>
          </div>
        ),
      },
      ...warehouses
        .filter((w) => whFilter === 'semua' || whFilter === w.id)
        .map((w) => ({
          key: w.id,
          label: w.nama,
          sortable: true,
          render: (p) => {
            const stok = p.stockByWarehouse[w.id]
            const critical = stok <= p.stokMinimum
            return (
              <span className={critical ? 'text-bad font-bold' : 'text-base-200'}>
                {stok} {p.satuan}
              </span>
            )
          },
        })),
      { key: 'totalStok', label: 'Total Stok', sortable: true, render: (p) => <span className="font-semibold text-base-100">{p.totalStok} {p.satuan}</span> },
      { key: 'harga', label: 'Harga', sortable: true, render: (p) => formatRupiah(p.harga) },
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
    ],
    [whFilter]
  )

  const mutasiColumns = [
    { key: 'tanggal', label: 'Tanggal', sortable: true, render: (m) => formatDate(m.tanggal) },
    {
      key: 'jenis',
      label: 'Jenis',
      sortable: true,
      render: (m) => {
        const meta = jenisMeta[m.jenis]
        const Icon = meta.icon
        return (
          <Badge variant={meta.variant} dot>
            <span className="flex items-center gap-1"><Icon size={11} /> {meta.label}</span>
          </Badge>
        )
      },
    },
    { key: 'productNama', label: 'Produk', sortable: true },
    { key: 'qty', label: 'Qty', sortable: true, render: (m) => `${m.qty} ${m.satuan}` },
    { key: 'warehouseId', label: 'Gudang', render: (m) => warehouses.find((w) => w.id === m.warehouseId)?.nama },
    { key: 'keterangan', label: 'Keterangan' },
    { key: 'refNomor', label: 'No. Referensi', render: (m) => <span className="text-xs text-base-500">{m.refNomor}</span> },
  ]

  const returColumns = [
    { key: 'nomor', label: 'No. Retur', sortable: true },
    { key: 'tanggal', label: 'Tanggal', sortable: true, render: (r) => formatDate(r.tanggal) },
    { key: 'outletNama', label: 'Outlet', sortable: true },
    { key: 'productNama', label: 'Produk', sortable: true },
    { key: 'qty', label: 'Qty', render: (r) => `${r.qty} ${r.satuan}` },
    { key: 'nilai', label: 'Nilai', sortable: true, render: (r) => formatRupiah(r.nilai) },
    {
      key: 'alasanLabel',
      label: 'Alasan',
      sortable: true,
      render: (r) => <Badge variant={alasanVariant[r.alasan]} dot>{r.alasanLabel}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge variant={r.status === 'selesai' ? 'good' : r.status === 'disetujui' ? 'brand' : 'default'} dot>{r.status}</Badge>,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Total Produk" value={products.length} sub="SKU aktif" icon={Package} accent="brand" />
        <KpiCard label="Stok Kritis" value={criticalCount} sub="produk perlu direstock" icon={AlertTriangle} accent="bad" />
        <KpiCard label="Retur Bulan Ini" value={returns.length} sub="pengajuan retur" icon={Undo2} accent="warn" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === t.key ? 'bg-brand/10 text-brand border border-brand/40' : 'text-base-400 border border-base-800 hover:text-base-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'retur' ? (
          <button
            onClick={() => setCreateReturnOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand text-ink text-sm font-bold hover:bg-brand-400 shadow-card"
          >
            <Undo2 size={16} strokeWidth={2.5} /> Buat Retur
          </button>
        ) : (
          <button
            onClick={() => setAddProductOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand text-ink text-sm font-bold hover:bg-brand-400 shadow-card"
          >
            <Plus size={16} strokeWidth={2.5} /> Tambah Produk
          </button>
        )}
      </div>

      {tab === 'stok' && (
        <div className="flex flex-wrap gap-2">
          <WarehouseChip active={whFilter === 'semua'} onClick={() => setWhFilter('semua')} label="Semua Gudang" sub={`${products.length} produk`} />
          {warehouses.map((w) => (
            <WarehouseChip
              key={w.id}
              active={whFilter === w.id}
              onClick={() => setWhFilter(w.id)}
              label={w.nama}
              sub={w.kota}
            />
          ))}
        </div>
      )}

      {tab === 'stok' && (
        <DataTable columns={stokColumns} data={products} searchKeys={['nama', 'sku', 'kategori']} searchPlaceholder="Cari produk atau SKU..." pageSize={12} />
      )}
      {tab === 'mutasi' && (
        <DataTable columns={mutasiColumns} data={mutations} searchKeys={['productNama', 'refNomor']} searchPlaceholder="Cari produk atau nomor referensi..." pageSize={12} />
      )}
      {tab === 'retur' && (
        <DataTable columns={returColumns} data={returns} searchKeys={['nomor', 'outletNama', 'productNama']} searchPlaceholder="Cari retur, outlet, atau produk..." pageSize={12} />
      )}

      <AddProductModal
        open={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        onCreated={() => {
          setAddProductOpen(false)
          bumpDataVersion()
        }}
      />
      <CreateReturnModal
        open={createReturnOpen}
        onClose={() => setCreateReturnOpen(false)}
        onCreated={() => bumpDataVersion()}
      />
    </div>
  )
}

function WarehouseChip({ active, onClick, label, sub }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left transition-colors ${
        active ? 'bg-brand/10 border-brand/40' : 'bg-base-900 border-base-800 hover:border-base-700'
      }`}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-brand/15 text-brand' : 'bg-base-850 text-base-500'}`}>
        <WarehouseIcon size={14} />
      </div>
      <div>
        <div className={`text-sm font-semibold ${active ? 'text-brand' : 'text-base-200'}`}>{label}</div>
        <div className="text-[11px] text-base-500">{sub}</div>
      </div>
    </button>
  )
}
