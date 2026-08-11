import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, ShoppingCart, Store, Package, Wallet, ArrowRight } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { outlets } from '../../data/outlets'
import { products } from '../../data/products'
import { orders } from '../../data/orders'

export default function CommandPalette() {
  const open = useAppStore((s) => s.commandPaletteOpen)
  const close = useAppStore((s) => s.closeCommandPalette)
  const toggle = useAppStore((s) => s.toggleCommandPalette)
  const openOrderDrawer = useAppStore((s) => s.openOrderDrawer)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggle()
      }
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggle, close])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const actions = [
      { id: 'act-order', type: 'action', label: 'Buat Order Baru', icon: ShoppingCart, run: () => openOrderDrawer() },
      { id: 'act-piutang', type: 'action', label: 'Buka Modul Piutang', icon: Wallet, run: () => navigate('/piutang') },
      { id: 'act-produk', type: 'action', label: 'Buka Produk', icon: Package, run: () => navigate('/produk') },
      { id: 'act-inv', type: 'action', label: 'Buka Inventory / Gudang', icon: Package, run: () => navigate('/inventory') },
    ]
    if (!q) {
      return {
        actions,
        outlets: outlets.slice(0, 4),
        products: products.slice(0, 4),
        orders: orders.slice(0, 3),
      }
    }
    return {
      actions: actions.filter((a) => a.label.toLowerCase().includes(q)),
      outlets: outlets.filter((o) => o.nama.toLowerCase().includes(q) || o.zona.toLowerCase().includes(q)).slice(0, 6),
      products: products.filter((p) => p.nama.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 6),
      orders: orders.filter((o) => o.nomor.toLowerCase().includes(q)).slice(0, 6),
    }
  }, [query, navigate, openOrderDrawer])

  function go(path) {
    navigate(path)
    close()
  }

  const hasResults =
    results.actions.length + results.outlets.length + results.products.length + results.orders.length > 0

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <div className="fixed inset-0 z-[70] flex items-start justify-center pt-24 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-xl bg-base-900 border border-base-700 rounded-2xl shadow-pop overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-base-800">
                <Search size={17} className="text-base-500 shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari outlet, produk, nomor order, atau ketik perintah..."
                  className="flex-1 bg-transparent outline-none text-sm text-base-100 placeholder:text-base-500"
                />
                <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-base-800 border border-base-700 text-base-500">
                  ESC
                </kbd>
              </div>
              <div className="max-h-96 overflow-y-auto p-2">
                {!hasResults && (
                  <div className="py-10 text-center text-sm text-base-500">Tidak ada hasil untuk "{query}"</div>
                )}
                {results.actions.length > 0 && (
                  <Section title="Aksi Cepat">
                    {results.actions.map((a) => (
                      <Row key={a.id} icon={a.icon} label={a.label} onClick={() => { a.run(); close() }} />
                    ))}
                  </Section>
                )}
                {results.outlets.length > 0 && (
                  <Section title="Outlet">
                    {results.outlets.map((o) => (
                      <Row
                        key={o.id}
                        icon={Store}
                        label={o.nama}
                        meta={o.zona}
                        onClick={() => go(`/outlet/${o.id}`)}
                      />
                    ))}
                  </Section>
                )}
                {results.products.length > 0 && (
                  <Section title="Produk">
                    {results.products.map((p) => (
                      <Row key={p.id} icon={Package} label={p.nama} meta={p.sku} onClick={() => go('/produk')} />
                    ))}
                  </Section>
                )}
                {results.orders.length > 0 && (
                  <Section title="Order">
                    {results.orders.map((o) => (
                      <Row key={o.id} icon={ShoppingCart} label={o.nomor} meta={o.status} onClick={() => go('/order')} />
                    ))}
                  </Section>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-1">
      <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-base-500">{title}</div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function Row({ icon: Icon, label, meta, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-base-800 text-left group transition-colors"
    >
      <div className="w-8 h-8 rounded-lg bg-base-850 border border-base-700 flex items-center justify-center text-base-400 shrink-0">
        <Icon size={15} />
      </div>
      <span className="flex-1 text-sm text-base-200 truncate">{label}</span>
      {meta && <span className="text-xs text-base-500 shrink-0">{meta}</span>}
      <ArrowRight size={13} className="text-base-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  )
}
