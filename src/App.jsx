import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import OrderPage from './pages/OrderPage'
import PiutangPage from './pages/PiutangPage'
import OutletPage from './pages/OutletPage'
import OutletDetailPage from './pages/OutletDetailPage'
import SalesRepPage from './pages/SalesRepPage'
import SalesPortalPage from './pages/SalesPortalPage'
import InventoryPage from './pages/InventoryPage'
import LaporanPage from './pages/LaporanPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/piutang" element={<PiutangPage />} />
        <Route path="/outlet" element={<OutletPage />} />
        <Route path="/outlet/:id" element={<OutletDetailPage />} />
        <Route path="/sales-rep" element={<SalesRepPage />} />
        <Route path="/sales-portal" element={<SalesPortalPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/laporan" element={<LaporanPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
