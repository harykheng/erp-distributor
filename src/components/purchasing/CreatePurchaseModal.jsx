import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Package, X, CheckCircle2, ShoppingBag } from 'lucide-react'
import Modal from '../common/Modal'
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
  const [productId, setProductId] = useState('')
  const [productQuery, setProductQuery] = useState('')
  const [qty, setQty] = useState(10)
  const [hargaBeli, setHargaBeli] = useState(0)
  const [warehouseId, setWarehouseId] = useState(warehouses[0].id)
  const [tanggal, setTanggal] = useState(isoToday())
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (!open) {
      setSupplier(suppliers[0])
      setProductId('')
      setProductQuery('')
      setQty(10)
      setHargaBeli(0)
      setWarehouseId(warehouses[0].id)
      setTanggal(isoToday())
      setSuccess(null)
      setSubmitting(false)
    }
  }, [open])

  const selectedProduct = products.find((p) => p.id === productId)

  const productResults = useMemo(() => {
    if (!productQuery) return products.slice(0, 6)
    const q = productQuery.toLowerCase()
    return products.filter((p) => p.nama.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 8)
  }, [productQuery])

  function selectProduct(p) {
    setProductId(p.id)
    setHargaBeli(p.hargaModal)
  }

  const totalBiaya = qty * hargaBeli

  async function handleSubmit() {
    if (!productId || qty <= 0 || hargaBeli <= 0) return
    setSubmitting(true)
    const purchase = await api.createPurchase({ supplier, productId, qty, hargaBeli, warehouseId, tanggal })
    setSubmitting(false)
    if (purchase) {
      onCreated?.(purchase)
      setSuccess(purchase)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Catat Pembelian" subtitle="Pembelian dari supplier otomatis menambah stok" width="max-w-lg">
      {success ? (
        <SuccessView purchase={success} onClose={onClose} />
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

          <div>
            <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">Produk</label>
            {selectedProduct ? (
              <div className="mt-1.5 flex items-center justify-between bg-base-850 border border-base-700 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                    <Package size={14} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-base-100">{selectedProduct.nama}</div>
                    <div className="text-xs text-base-500">{selectedProduct.sku}</div>
                  </div>
                </div>
                <button onClick={() => setProductId('')} className="text-base-500 hover:text-base-200">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="relative mt-1.5">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-500" />
                <input
                  autoFocus
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  placeholder="Cari produk atau SKU..."
                  className="w-full bg-base-850 border border-base-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-base-100 placeholder:text-base-500 focus:outline-none focus:ring-1 focus:ring-brand/60"
                />
                {productResults.length > 0 && (
                  <div className="mt-2 border border-base-800 rounded-xl overflow-hidden divide-y divide-base-800 max-h-48 overflow-y-auto">
                    {productResults.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => selectProduct(p)}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-base-850 text-left"
                      >
                        <span className="text-sm text-base-200">{p.nama}</span>
                        <span className="text-xs text-base-500">{p.sku}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedProduct && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">Qty ({selectedProduct.satuan})</label>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="mt-1.5 w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">Harga Beli / {selectedProduct.satuan}</label>
                  <input
                    type="number"
                    min="0"
                    value={hargaBeli}
                    onChange={(e) => setHargaBeli(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="mt-1.5 w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100"
                  />
                </div>
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

              <div className="flex items-center justify-between bg-base-850 border border-base-700 rounded-xl px-4 py-3 text-sm">
                <span className="text-base-400">Total Biaya</span>
                <span className="font-bold text-base-100">{formatRupiah(totalBiaya)}</span>
              </div>
            </>
          )}

          <button
            onClick={handleSubmit}
            disabled={!selectedProduct || submitting}
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

function SuccessView({ purchase, onClose }) {
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
        {purchase.nomor} dari {purchase.supplier} sebesar {formatRupiah(purchase.totalBiaya)} sudah tercatat — stok{' '}
        {purchase.productNama} bertambah {purchase.qty} {purchase.satuan}.
      </p>
      <button onClick={onClose} className="mt-6 px-4 py-2.5 rounded-lg bg-brand text-ink text-sm font-bold hover:bg-brand-400">
        Selesai
      </button>
    </motion.div>
  )
}
