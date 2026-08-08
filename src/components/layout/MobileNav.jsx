import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, Wallet, Warehouse, Users } from 'lucide-react'

const items = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/order', label: 'Order', icon: ShoppingCart },
  { to: '/piutang', label: 'Piutang', icon: Wallet },
  { to: '/inventory', label: 'Gudang', icon: Warehouse },
  { to: '/sales-rep', label: 'Sales', icon: Users },
]

export default function MobileNav() {
  return (
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
    </nav>
  )
}
