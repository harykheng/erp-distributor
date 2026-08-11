import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Store, X, CheckCircle2, Undo2 } from 'lucide-react'
import Modal from '../common/Modal'
import { outlets } from '../../data/outlets'
import { outletOrderHistory } from '../../data/orders'
import { alasanList } from '../../data/returns'
import { api } from '../../data/api'
import { formatRupiah, formatDate } from '../../lib/format'

export default function CreateReturnModal({ open, onClose, onCreated }) {
  const [outletId, setOutletId] = useState('')
  const [outletQuery, setOutletQuery] = useState('')
  const [orderId, setOrderId] = useState('')
  const [productId, setProductId] = useState('')
  const [qty, setQty] = useState(1)
  const [alasan, setAlasan] = useState(alasanList[0].key)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (!open) {
      setOutletId('')
      setOutletQuery('')
      setOrderId('')
      setProductId('')
      setQty(1)
      setAlasan(alasanList[0].key)
      setSuccess(null)
      setSubmitting(false)
    }
  }, [open])

  const selectedOutlet = outlets.find((o) => o.id === outletId)

  const outletResults = useMemo(() => {
    if (!outletQuery) return outlets.slice(0, 6)
    const q = outletQuery.toLowerCase()
    return outlets.filter((o) => o.nama.toLowerCase().includes(q)).slice(0, 8)
  }, [outletQuery])

  const sentOrders = useMemo(
    () => (outletId ? outletOrderHistory(outletId).filter((o) => o.isSent) : []),
    [outletId]
  )
  const selectedOrder = sentOrders.find((o) => o.id === orderId)
  const selectedItem = selectedOrder?.items.find((it) => it.productId === productId)

  useEffect(() => {
    setOrderId('')
    setProductId('')
  }, [outletId])

  useEffect(() => {
    setProductId('')
    setQty(1)
  }, [orderId])

  useEffect(() => {
    if (selectedItem) setQty(1)
  }, [selectedItem])

  async function handleSubmit() {
    if (!orderId || !productId || qty <= 0) return
    setSubmitting(true)
    const retur = await api.createReturn({ orderId, productId, qty, alasan })
    setSubmitting(false)
    if (retur) {
      onCreated?.(retur)
      setSuccess(retur)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Buat Retur" subtitle="Retur otomatis mengurangi tagihan & kembalikan stok" width="max-w-lg">
      {success ? (
        <SuccessView retur={success} outlet={selectedOutlet} onClose={onClose} />
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">Outlet</label>
            {selectedOutlet ? (
              <div className="mt-1.5 flex items-center justify-between bg-base-850 border border-base-700 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                    <Store size={14} />
                  </div>
                  <div className="text-sm font-semibold text-base-100">{selectedOutlet.nama}</div>
                </div>
                <button onClick={() => setOutletId('')} className="text-base-500 hover:text-base-200">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="relative mt-1.5">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-500" />
                <input
                  autoFocus
                  value={outletQuery}
                  onChange={(e) => setOutletQuery(e.target.value)}
                  placeholder="Ketik nama toko/warung..."
                  className="w-full bg-base-850 border border-base-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-base-100 placeholder:text-base-500 focus:outline-none focus:ring-1 focus:ring-brand/60"
                />
                {outletResults.length > 0 && (
                  <div className="mt-2 border border-base-800 rounded-xl overflow-hidden divide-y divide-base-800 max-h-48 overflow-y-auto">
                    {outletResults.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setOutletId(o.id)}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-base-850 text-left"
                      >
                        <span className="text-sm text-base-200">{o.nama}</span>
                        <span className="text-xs text-base-500">{o.zona}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedOutlet && (
            <div>
              <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">Order Terkait</label>
              {sentOrders.length === 0 ? (
                <div className="mt-1.5 text-sm text-base-500 py-3 text-center border border-dashed border-base-800 rounded-xl">
                  Outlet ini belum punya order yang sudah dikirim
                </div>
              ) : (
                <select
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="mt-1.5 w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100"
                >
                  <option value="">Pilih nomor order...</option>
                  {sentOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nomor} &middot; {formatDate(o.tanggal)} &middot; {formatRupiah(o.total)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {selectedOrder && (
            <div>
              <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">Produk yang Diretur</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="mt-1.5 w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100"
              >
                <option value="">Pilih produk...</option>
                {selectedOrder.items.map((it) => (
                  <option key={it.productId} value={it.productId}>
                    {it.nama} (dipesan {it.qty} {it.satuan})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedItem && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">Qty Retur</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedItem.qty}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Math.min(selectedItem.qty, parseInt(e.target.value, 10) || 1)))}
                    className="mt-1.5 w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100"
                  />
                  <div className="text-[11px] text-base-500 mt-1">Maks {selectedItem.qty} {selectedItem.satuan}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">Alasan</label>
                  <select
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    className="mt-1.5 w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100"
                  >
                    {alasanList.map((a) => (
                      <option key={a.key} value={a.key}>{a.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between bg-base-850 border border-base-700 rounded-xl px-4 py-3 text-sm">
                <span className="text-base-400">Nilai retur (mengurangi tagihan)</span>
                <span className="font-bold text-base-100">{formatRupiah(qty * selectedItem.hargaSatuan)}</span>
              </div>
            </>
          )}

          <button
            onClick={handleSubmit}
            disabled={!selectedItem || submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand text-ink font-bold hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Undo2 size={17} strokeWidth={2.5} />
            {submitting ? 'Memproses...' : 'Buat Retur'}
          </button>
        </div>
      )}
    </Modal>
  )
}

function SuccessView({ retur, outlet, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-4 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-good/10 text-good flex items-center justify-center mb-4">
        <CheckCircle2 size={32} />
      </div>
      <h3 className="text-lg font-bold text-base-100">Retur Berhasil Dibuat</h3>
      <p className="text-sm text-base-400 mt-1 max-w-sm">
        {retur.nomor} untuk {outlet?.nama} senilai {formatRupiah(retur.nilai)} sudah tercatat — tagihan order{' '}
        {retur.nomorOrder} otomatis dikurangi dan stok dikembalikan ke gudang.
      </p>
      <button onClick={onClose} className="mt-6 px-4 py-2.5 rounded-lg bg-brand text-ink text-sm font-bold hover:bg-brand-400">
        Selesai
      </button>
    </motion.div>
  )
}
