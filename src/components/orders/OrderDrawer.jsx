import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Store, Plus, Minus, Trash2, Truck, CheckCircle2, X, Sparkles } from 'lucide-react'
import Drawer from '../common/Drawer'
import { useAppStore } from '../../store/useAppStore'
import { outlets } from '../../data/outlets'
import { products } from '../../data/products'
import { warehouses } from '../../data/warehouses'
import { outletProductAverages } from '../../data/orders'
import { api } from '../../data/api'
import { formatRupiah } from '../../lib/format'

export default function OrderDrawer() {
  const open = useAppStore((s) => s.orderDrawerOpen)
  const close = useAppStore((s) => s.closeOrderDrawer)
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion)
  const setLastCreatedOrder = useAppStore((s) => s.setLastCreatedOrder)

  const [outletId, setOutletId] = useState('')
  const [outletQuery, setOutletQuery] = useState('')
  const [productQuery, setProductQuery] = useState('')
  const [cart, setCart] = useState({}) // productId -> qty
  const [warehouseId, setWarehouseId] = useState(warehouses[0].id)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (!open) {
      setOutletId('')
      setOutletQuery('')
      setProductQuery('')
      setCart({})
      setSuccess(null)
      setSubmitting(false)
    }
  }, [open])

  const selectedOutlet = outlets.find((o) => o.id === outletId)
  const averages = useMemo(() => (outletId ? outletProductAverages(outletId) : {}), [outletId])

  const outletResults = useMemo(() => {
    if (!outletQuery) return outlets.slice(0, 6)
    const q = outletQuery.toLowerCase()
    return outlets.filter((o) => o.nama.toLowerCase().includes(q)).slice(0, 8)
  }, [outletQuery])

  const productResults = useMemo(() => {
    let list = products
    if (productQuery) {
      const q = productQuery.toLowerCase()
      list = list.filter((p) => p.nama.toLowerCase().includes(q) || p.kategori.toLowerCase().includes(q))
    }
    // produk yang biasa dipesan outlet ini muncul duluan
    if (outletId) {
      list = [...list].sort((a, b) => (averages[b.id]?.count || 0) - (averages[a.id]?.count || 0))
    }
    return list.slice(0, 30)
  }, [productQuery, outletId, averages])

  const cartItems = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([productId, qty]) => {
      const product = products.find((p) => p.id === productId)
      return { product, qty, subtotal: product.harga * qty }
    })
  const total = cartItems.reduce((s, it) => s + it.subtotal, 0)

  function setQty(productId, qty) {
    setCart((c) => ({ ...c, [productId]: Math.max(0, qty) }))
  }
  function addSuggested(productId) {
    const suggestedQty = averages[productId]?.avgQty || 1
    setQty(productId, (cart[productId] || 0) + suggestedQty)
  }
  function addOne(productId) {
    setQty(productId, (cart[productId] || 0) + 1)
  }

  async function handleSubmit() {
    if (!outletId || cartItems.length === 0) return
    setSubmitting(true)
    const payload = {
      outletId,
      salesRepId: selectedOutlet.salesRepId,
      warehouseId,
      items: cartItems.map((it) => ({
        productId: it.product.id,
        nama: it.product.nama,
        satuan: it.product.satuan,
        qty: it.qty,
        hargaSatuan: it.product.harga,
        subtotal: it.subtotal,
      })),
    }
    const order = await api.createOrder(payload)
    setSuccess(order)
    setLastCreatedOrder(order)
    bumpDataVersion()
    setSubmitting(false)
  }

  return (
    <Drawer
      open={open}
      onClose={close}
      title="Order Baru"
      subtitle="Cari outlet, tambah produk, langsung jadi surat jalan"
      width="max-w-3xl"
    >
      {success ? (
        <SuccessView order={success} outlet={selectedOutlet} onClose={close} onNew={() => setSuccess(null)} />
      ) : (
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-base-800 space-y-3">
            <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">Outlet Tujuan</label>
            {selectedOutlet ? (
              <div className="flex items-center justify-between bg-base-850 border border-base-700 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                    <Store size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-base-100">{selectedOutlet.nama}</div>
                    <div className="text-xs text-base-500">{selectedOutlet.zona} &middot; Limit kredit {formatRupiah(selectedOutlet.kreditLimit)}</div>
                  </div>
                </div>
                <button onClick={() => setOutletId('')} className="text-base-500 hover:text-base-200">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-500" />
                <input
                  autoFocus
                  value={outletQuery}
                  onChange={(e) => setOutletQuery(e.target.value)}
                  placeholder="Ketik nama toko/warung..."
                  className="w-full bg-base-850 border border-base-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-base-100 placeholder:text-base-500 focus:outline-none focus:ring-1 focus:ring-brand/60"
                />
                {outletResults.length > 0 && (
                  <div className="mt-2 border border-base-800 rounded-xl overflow-hidden divide-y divide-base-800">
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
            <>
              <div className="p-5 border-b border-base-800">
                <div className="relative mb-3">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-500" />
                  <input
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    placeholder="Cari produk..."
                    className="w-full bg-base-850 border border-base-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-base-100 placeholder:text-base-500 focus:outline-none focus:ring-1 focus:ring-brand/60"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {productResults.map((p) => {
                    const avg = averages[p.id]
                    const qty = cart[p.id] || 0
                    return (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-base-850 border border-transparent hover:border-base-800"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-base-200 truncate">{p.nama}</div>
                          <div className="text-xs text-base-500 flex items-center gap-1.5">
                            {formatRupiah(p.harga)} / {p.satuan}
                            {avg && (
                              <span className="inline-flex items-center gap-1 text-brand">
                                <Sparkles size={10} /> biasa order {avg.avgQty} {p.satuan}
                              </span>
                            )}
                          </div>
                        </div>
                        {qty > 0 ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => setQty(p.id, qty - 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md bg-base-800 text-base-300 hover:bg-base-700"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-base-100">{qty}</span>
                            <button
                              onClick={() => setQty(p.id, qty + 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md bg-base-800 text-base-300 hover:bg-base-700"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        ) : avg ? (
                          <button
                            onClick={() => addSuggested(p.id)}
                            className="shrink-0 px-2.5 py-1.5 rounded-md bg-brand/10 text-brand text-xs font-semibold hover:bg-brand/20"
                          >
                            + {avg.avgQty} {p.satuan}
                          </button>
                        ) : (
                          <button
                            onClick={() => addOne(p.id)}
                            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-base-800 text-base-300 hover:bg-brand/20 hover:text-brand"
                          >
                            <Plus size={13} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <div className="text-xs font-semibold text-base-400 uppercase tracking-wide mb-2">
                  Keranjang ({cartItems.length})
                </div>
                {cartItems.length === 0 ? (
                  <div className="text-sm text-base-500 py-6 text-center border border-dashed border-base-800 rounded-xl">
                    Belum ada produk dipilih
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {cartItems.map((it) => (
                      <div key={it.product.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-base-850">
                        <div className="min-w-0">
                          <div className="text-sm text-base-200 truncate">{it.product.nama}</div>
                          <div className="text-xs text-base-500">
                            {it.qty} {it.product.satuan} &times; {formatRupiah(it.product.harga)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-semibold text-base-100">{formatRupiah(it.subtotal)}</span>
                          <button onClick={() => setQty(it.product.id, 0)} className="text-base-500 hover:text-bad">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">Kirim dari Gudang</label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="mt-1.5 w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-base-100"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-5 border-t border-base-800 bg-base-900">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-base-400">Total Order</span>
                  <span className="text-xl font-extrabold text-base-100">{formatRupiah(total)}</span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={cartItems.length === 0 || submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand text-base-950 font-bold hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Truck size={17} strokeWidth={2.5} />
                  {submitting ? 'Memproses...' : 'Buat Order & Surat Jalan'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Drawer>
  )
}

function SuccessView({ order, outlet, onClose, onNew }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full p-8 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-good/10 text-good flex items-center justify-center mb-4">
        <CheckCircle2 size={32} />
      </div>
      <h3 className="text-lg font-bold text-base-100">Order Berhasil Dibuat</h3>
      <p className="text-sm text-base-400 mt-1 max-w-sm">
        {order.nomor} untuk {outlet?.nama} senilai {formatRupiah(order.total)} sudah tercatat dan surat jalan
        otomatis diterbitkan.
      </p>
      <div className="mt-5 w-full max-w-sm rounded-xl border border-base-800 bg-base-850 p-4 text-left space-y-2">
        <Row label="Nomor Order" value={order.nomor} />
        <Row label="Surat Jalan" value={order.suratJalanNumber} />
        <Row label="Jatuh Tempo" value={order.jatuhTempo} />
        <Row label="Total" value={formatRupiah(order.total)} />
      </div>
      <div className="flex gap-2 mt-6">
        <button onClick={onNew} className="px-4 py-2.5 rounded-lg border border-base-700 text-sm font-semibold text-base-200 hover:bg-base-800">
          Buat Order Lagi
        </button>
        <button onClick={onClose} className="px-4 py-2.5 rounded-lg bg-brand text-base-950 text-sm font-bold hover:bg-brand-400">
          Selesai
        </button>
      </div>
    </motion.div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-base-500">{label}</span>
      <span className="text-base-200 font-medium">{value}</span>
    </div>
  )
}
