import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Package, Trash2, CheckCircle2, ShoppingBag } from 'lucide-react'
import Modal from '../common/Modal'
import Switch from '../common/Switch'
import { products } from '../../data/products'
import { warehouses } from '../../data/warehouses'
import { suppliers } from '../../data/purchases'
import { api } from '../../data/api'
import { formatRupiah } from '../../lib/format'

function isoToday() {
  return new Date().toISOString().slice(0, 10)
}

export default function CreatePurchaseModal({ open, onClose, onCreated }) {
  const [supplier, setSupplier] = useState(suppliers[0])
  const [productQuery, setProductQuery] = useState('')
  const [cart, setCart] = useState({}) // productId -> { qty, hargaBeli }
  const [warehouseId, setWarehouseId] = useState(warehouses[0].id)
  const [tanggal, setTanggal] = useState(isoToday())
  const [kenaPPN, setKenaPPN] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (!open) {
      setSupplier(suppliers[0])
      setProductQuery('')
      setCart({})
      setWarehouseId(warehouses[0].id)
      setTanggal(isoToday())
      setKenaPPN(true)
      setSuccess(null)
      setSubmitting(false)
    }
  }, [open])

  const productResults = useMemo(() => {
    if (!productQuery) return products.slice(0, 6)
    const q = productQuery.toLowerCase()
    return products.filter((p) => p.nama.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 8)
  }, [productQuery])

  function addProduct(p) {
    setCart((c) => (c[p.id] ? c : { ...c, [p.id]: { qty: 10, hargaBeli: p.hargaModal } }))
  }
  function updateItem(productId, field, value) {
    setCart((c) => ({ ...c, [productId]: { ...c[productId], [field]: value } }))
  }
  function removeItem(productId) {
    setCart((c) => {
      const next = { ...c }
      delete next[productId]
      return next
    })
  }

  const cartItems = Object.entries(cart).map(([productId, v]) => {
    const product = products.find((p) => p.id === productId)
    return { product, qty: v.qty, hargaBeli: v.hargaBeli, subtotal: v.qty * v.hargaBeli }
  })
  const subtotal = cartItems.reduce((s, it) => s + it.subtotal, 0)
  const ppn = kenaPPN ? Math.round(subtotal * 0.11) : 0
  const totalBiaya = subtotal + ppn
  const isValid = cartItems.length > 0 && cartItems.every((it) => it.qty > 0 && it.hargaBeli > 0)

  async function handleSubmit() {
    if (!isValid) return
    setSubmitting(true)
    const payload = {
      supplier,
      warehouseId,
      tanggal,
      kenaPPN,
      items: cartItems.map((it) => ({ productId: it.product.id, qty: it.qty, hargaBeli: it.hargaBeli })),
    }
    const created = await api.createPurchase(payload)
    setSubmitting(false)
    if (created && created.length > 0) {
      onCreated?.(created)
      setSuccess(created)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Catat Pembelian" subtitle="Pembelian dari supplier otomatis menambah stok" width="max-w-lg">
      {success ? (
        <SuccessView purchases={success} onClose={onClose} />
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">Supplier</label>
            <input
              list="supplier-list"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="mt-1.5 w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100"
            />
            <datalist id="supplier-list">
              {suppliers.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">Gudang Tujuan</label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="mt-1.5 w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.nama}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">Tanggal</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="mt-1.5 w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">Tambah Produk</label>
            <div className="relative mt-1.5">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-500" />
              <input
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                placeholder="Cari produk atau SKU..."
                className="w-full bg-base-850 border border-base-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-base-100 placeholder:text-base-500 focus:outline-none focus:ring-1 focus:ring-brand/60"
              />
              {productResults.length > 0 && (
                <div className="mt-2 border border-base-800 rounded-xl overflow-hidden divide-y divide-base-800 max-h-40 overflow-y-auto">
                  {productResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addProduct(p)}
                      disabled={!!cart[p.id]}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-base-850 text-left disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="text-sm text-base-200">{p.nama}</span>
                      <span className="text-xs text-base-500">{cart[p.id] ? 'sudah ditambah' : p.sku}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-base-400 uppercase tracking-wide mb-2">
              Item Pembelian ({cartItems.length})
            </div>
            {cartItems.length === 0 ? (
              <div className="text-sm text-base-500 py-6 text-center border border-dashed border-base-800 rounded-xl">
                Belum ada produk ditambahkan
              </div>
            ) : (
              <div className="space-y-2">
                {cartItems.map((it) => (
                  <div key={it.product.id} className="flex items-center gap-2 bg-base-850 border border-base-700 rounded-xl px-3 py-2.5">
                    <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                      <Package size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-base-100 truncate">{it.product.nama}</div>
                      <div className="text-xs text-base-500">{formatRupiah(it.subtotal)}</div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={it.qty}
                      onChange={(e) => updateItem(it.product.id, 'qty', Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-16 text-center bg-base-800 border border-base-700 rounded-md text-sm font-semibold text-base-100 py-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      title={`Qty (${it.product.satuan})`}
                    />
                    <input
                      type="number"
                      min="0"
                      value={it.hargaBeli}
                      onChange={(e) => updateItem(it.product.id, 'hargaBeli', Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-24 text-center bg-base-800 border border-base-700 rounded-md text-sm font-semibold text-base-100 py-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      title="Harga beli / satuan"
                    />
                    <button onClick={() => removeItem(it.product.id)} className="text-base-500 hover:text-bad shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between bg-base-850 border border-base-700 rounded-xl px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-base-200">Kena PPN</div>
              <div className="text-xs text-base-500">PPN 11% dihitung otomatis dari subtotal — jadi basis pajak masukan</div>
            </div>
            <Switch checked={kenaPPN} onChange={setKenaPPN} />
          </div>

          {cartItems.length > 0 && (
            <div className="bg-base-850 border border-base-700 rounded-xl px-4 py-3 text-sm space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-base-400">Subtotal</span>
                <span className="text-base-200 font-medium">{formatRupiah(subtotal)}</span>
              </div>
              {kenaPPN && (
                <div className="flex items-center justify-between">
                  <span className="text-base-400">PPN (11%)</span>
                  <span className="text-base-200 font-medium">{formatRupiah(ppn)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-base-800 pt-1.5">
                <span className="text-base-300 font-semibold">Total Biaya</span>
                <span className="font-bold text-base-100">{formatRupiah(totalBiaya)}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand text-ink font-bold hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingBag size={17} strokeWidth={2.5} />
            {submitting ? 'Memproses...' : 'Catat Pembelian'}
          </button>
        </div>
      )}
    </Modal>
  )
}

function SuccessView({ purchases, onClose }) {
  const nomor = purchases[0].nomor
  const kenaPPN = purchases[0].kenaPPN
  const subtotal = purchases.reduce((s, p) => s + p.subtotal, 0)
  const ppn = purchases.reduce((s, p) => s + p.ppn, 0)
  const totalBiaya = purchases.reduce((s, p) => s + p.totalBiaya, 0)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-4 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-good/10 text-good flex items-center justify-center mb-4">
        <CheckCircle2 size={32} />
      </div>
      <h3 className="text-lg font-bold text-base-100">Pembelian Tercatat</h3>
      <p className="text-sm text-base-400 mt-1 max-w-sm">
        {nomor} dari {purchases[0].supplier} sebesar {formatRupiah(totalBiaya)} sudah tercatat — stok{' '}
        {purchases.length} produk bertambah sesuai qty pembelian.
      </p>
      <div className="mt-5 w-full max-w-sm rounded-xl border border-base-800 bg-base-850 p-4 text-left space-y-1.5">
        {purchases.map((p) => (
          <div key={p.id} className="flex items-center justify-between text-sm">
            <span className="text-base-300 truncate">{p.productNama}</span>
            <span className="text-base-100 font-medium shrink-0 ml-2">+{p.qty} {p.satuan}</span>
          </div>
        ))}
        <div className="border-t border-base-800 pt-1.5 mt-1.5 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-500">Subtotal</span>
            <span className="text-base-300">{formatRupiah(subtotal)}</span>
          </div>
          {kenaPPN && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-base-500">PPN (11%)</span>
              <span className="text-base-300">{formatRupiah(ppn)}</span>
            </div>
          )}
        </div>
      </div>
      <button onClick={onClose} className="mt-6 px-4 py-2.5 rounded-lg bg-brand text-ink text-sm font-bold hover:bg-brand-400">
        Selesai
      </button>
    </motion.div>
  )
}
