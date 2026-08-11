import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import OrderPage from './pages/OrderPage'
import PiutangPage from './pages/PiutangPage'
import PajakPage from './pages/PajakPage'
import OutletPage from './pages/OutletPage'
import OutletDetailPage from './pages/OutletDetailPage'
import SalesRepPage from './pages/SalesRepPage'
import SalesAppPage from './pages/SalesAppPage'
import ProductPage from './pages/ProductPage'
import PurchasingPage from './pages/PurchasingPage'
import InventoryPage from './pages/InventoryPage'
import LaporanPage from './pages/LaporanPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      {/* Portal Sales: aplikasi terpisah dari admin, mobile-only, tanpa Sidebar/Topbar admin */}
      <Route path="/sales" element={<SalesAppPage />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/piutang" element={<PiutangPage />} />
        <Route path="/pajak" element={<PajakPage />} />
        <Route path="/outlet" element={<OutletPage />} />
        <Route path="/outlet/:id" element={<OutletDetailPage />} />
        <Route path="/sales-rep" element={<SalesRepPage />} />
        <Route path="/produk" element={<ProductPage />} />
        <Route path="/pembelian" element={<PurchasingPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/laporan" element={<LaporanPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
