import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LayoutDashboard, ShoppingCart, Wallet, Warehouse, Users, MoreHorizontal, Store, Package, ShoppingBag, FileBarChart, Settings, Send, X } from 'lucide-react'

const items = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/order', label: 'Order', icon: ShoppingCart },
  { to: '/piutang', label: 'Piutang', icon: Wallet },
  { to: '/inventory', label: 'Gudang', icon: Warehouse },
  { to: '/sales-rep', label: 'Sales', icon: Users },
]

const moreItems = [
  { to: '/outlet', label: 'Outlet / Customer', icon: Store },
  { to: '/produk', label: 'Produk', icon: Package },
  { to: '/pembelian', label: 'Pembelian', icon: ShoppingBag },
  { to: '/laporan', label: 'Laporan', icon: FileBarChart },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function MobileNav() {
  const location = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)
  const isMoreActive = moreItems.some((m) => location.pathname.startsWith(m.to))

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-base-900/95 backdrop-blur-md border-t border-base-800 flex items-stretch">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium ${
                isActive ? 'text-brand' : 'text-base-500'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        <button
          onClick={() => setMoreOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium ${
            isMoreActive ? 'text-brand' : 'text-base-500'
          }`}
        >
          <MoreHorizontal size={18} />
          Lainnya
        </button>
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-900 border-t border-base-800 rounded-t-2xl pb-6"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-base-800">
                <h3 className="font-bold text-base-100 text-sm">Menu Lainnya</h3>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-base-400 hover:text-base-100 hover:bg-base-800"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-3">
                {moreItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium ${
                        isActive ? 'bg-brand/10 text-brand' : 'text-base-300 hover:bg-base-850'
                      }`
                    }
                  >
                    <Icon size={18} />
                    {label}
                  </NavLink>
                ))}
                <a
                  href="/sales"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-brand hover:bg-brand/10"
                >
                  <Send size={18} />
                  Buka Portal Sales
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
