import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Package, X, CheckCircle2, ArrowLeftRight } from 'lucide-react'
import Modal from '../common/Modal'
import { products } from '../../data/products'
import { warehouses } from '../../data/warehouses'
import { api } from '../../data/api'

export default function CreateTransferModal({ open, onClose, onCreated }) {
  const [productId, setProductId] = useState('')
  const [productQuery, setProductQuery] = useState('')
  const [fromWarehouseId, setFromWarehouseId] = useState(warehouses[0].id)
  const [toWarehouseId, setToWarehouseId] = useState(warehouses[1]?.id || warehouses[0].id)
  const [qty, setQty] = useState(1)
  const [catatan, setCatatan] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      setProductId('')
      setProductQuery('')
      setFromWarehouseId(warehouses[0].id)
      setToWarehouseId(warehouses[1]?.id || warehouses[0].id)
      setQty(1)
      setCatatan('')
      setSuccess(null)
      setSubmitting(false)
      setError('')
    }
  }, [open])

  const selectedProduct = products.find((p) => p.id === productId)

  const productResults = useMemo(() => {
    if (!productQuery) return products.slice(0, 6)
    const q = productQuery.toLowerCase()
    return products.filter((p) => p.nama.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 8)
  }, [productQuery])

  const stokAsal = selectedProduct?.stockByWarehouse[fromWarehouseId] || 0

  useEffect(() => {
    if (toWarehouseId === fromWarehouseId) {
      const alt = warehouses.find((w) => w.id !== fromWarehouseId)
      if (alt) setToWarehouseId(alt.id)
    }
  }, [fromWarehouseId, toWarehouseId])

  useEffect(() => {
    setError('')
  }, [productId, fromWarehouseId, toWarehouseId, qty])

  async function handleSubmit() {
    if (!productId || qty <= 0) return
    if (qty > stokAsal) {
      setError(`Stok di gudang asal cuma ${stokAsal} ${selectedProduct.satuan}`)
      return
    }
    setSubmitting(true)
    const transfer = await api.createTransfer({ productId, qty, fromWarehouseId, toWarehouseId, catatan })
    setSubmitting(false)
    if (transfer) {
      onCreated?.(transfer)
      setSuccess(transfer)
    } else {
      setError('Transfer gagal, coba lagi.')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Transfer Stok" subtitle="Pindahkan stok antar gudang" width="max-w-lg">
      {success ? (
        <SuccessView transfer={success} onClose={onClose} />
      ) : (
        <div className="space-y-4">
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
                        onClick={() => setProductId(p.id)}
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
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">Dari Gudang</label>
                  <select
                    value={fromWarehouseId}
                    onChange={(e) => setFromWarehouseId(e.target.value)}
                    className="mt-1.5 w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nama} ({selectedProduct.stockByWarehouse[w.id] || 0} {selectedProduct.satuan})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-center pb-2.5">
                  <ArrowLeftRight size={16} className="text-base-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">Ke Gudang</label>
                <select
                  value={toWarehouseId}
                  onChange={(e) => setToWarehouseId(e.target.value)}
                  className="mt-1.5 w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100"
                >
                  {warehouses
                    .filter((w) => w.id !== fromWarehouseId)
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nama} ({selectedProduct.stockByWarehouse[w.id] || 0} {selectedProduct.satuan})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">Qty ({selectedProduct.satuan})</label>
                <input
                  type="number"
                  min="1"
                  max={stokAsal}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="mt-1.5 w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100"
                />
                <div className="text-[11px] text-base-500 mt-1">Tersedia {stokAsal} {selectedProduct.satuan} di gudang asal</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">Catatan (opsional)</label>
                <input
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: stok Gudang Utama menipis"
                  className="mt-1.5 w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-base-100 placeholder:text-base-500"
                />
              </div>

              {error && <div className="text-xs text-bad bg-bad/10 rounded-lg px-3 py-2">{error}</div>}
            </>
          )}

          <button
            onClick={handleSubmit}
            disabled={!selectedProduct || submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand text-ink font-bold hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeftRight size={17} strokeWidth={2.5} />
            {submitting ? 'Memproses...' : 'Transfer Stok'}
          </button>
        </div>
      )}
    </Modal>
  )
}

function SuccessView({ transfer, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-4 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-good/10 text-good flex items-center justify-center mb-4">
        <CheckCircle2 size={32} />
      </div>
      <h3 className="text-lg font-bold text-base-100">Transfer Berhasil</h3>
      <p className="text-sm text-base-400 mt-1 max-w-sm">
        {transfer.nomor}: {transfer.qty} {transfer.satuan} {transfer.productNama} dipindahkan dari{' '}
        {transfer.fromWarehouseNama} ke {transfer.toWarehouseNama}.
      </p>
      <button onClick={onClose} className="mt-6 px-4 py-2.5 rounded-lg bg-brand text-ink text-sm font-bold hover:bg-brand-400">
        Selesai
      </button>
    </motion.div>
  )
}
