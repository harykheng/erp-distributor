import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  Store,
  Users,
  Warehouse,
  FileBarChart,
  Settings,
  Boxes,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/order', label: 'Order / Penjualan', icon: ShoppingCart },
  { to: '/piutang', label: 'Piutang', icon: Wallet },
  { to: '/outlet', label: 'Outlet / Customer', icon: Store },
  { to: '/sales-rep', label: 'Sales Rep', icon: Users },
  { to: '/inventory', label: 'Inventory / Gudang', icon: Warehouse },
  { to: '/laporan', label: 'Laporan', icon: FileBarChart },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 shrink-0 flex-col border-r border-base-800 bg-base-900/60 backdrop-blur-sm">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-base-800">
        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shrink-0">
          <Boxes size={18} className="text-base-950" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <div className="font-extrabold text-base-100 text-sm">Harel ERP</div>
          <div className="text-[11px] text-base-500">Distributor Suite</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand/10 text-brand'
                  : 'text-base-400 hover:text-base-100 hover:bg-base-800/70'
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-base-800">
        <div className="rounded-xl bg-base-850 border border-base-800 p-3">
          <div className="text-xs font-semibold text-base-200">UD Sumber Makmur Distribusi</div>
          <div className="text-[11px] text-base-500 mt-0.5">Paket Demo &middot; Studio Harel</div>
        </div>
      </div>
    </aside>
  )
}
