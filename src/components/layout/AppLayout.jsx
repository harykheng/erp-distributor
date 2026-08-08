import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileNav from './MobileNav'
import CommandPalette from './CommandPalette'
import OrderModal from '../orders/OrderModal'

const titles = {
  '/': { title: 'Dashboard Utama', subtitle: 'Ringkasan operasional hari ini' },
  '/order': { title: 'Order / Penjualan', subtitle: 'Kelola pesanan dan surat jalan' },
  '/piutang': { title: 'Piutang (AR)', subtitle: 'Aging piutang dan penagihan' },
  '/outlet': { title: 'Outlet / Customer', subtitle: 'Daftar toko dan warung pelanggan' },
  '/sales-rep': { title: 'Sales Rep', subtitle: 'Target, capaian, dan rute kunjungan' },
  '/sales-portal': { title: 'Portal Sales', subtitle: 'Ajukan order dan pantau status verifikasi' },
  '/inventory': { title: 'Inventory / Gudang', subtitle: 'Stok, mutasi, dan retur barang' },
  '/laporan': { title: 'Laporan', subtitle: 'Rekap penjualan dan performa' },
  '/settings': { title: 'Settings', subtitle: 'Profil bisnis dan konfigurasi' },
}

function resolveTitle(pathname) {
  if (titles[pathname]) return titles[pathname]
  const base = '/' + pathname.split('/')[1]
  return titles[base] || { title: 'Harel ERP' }
}

export default function AppLayout() {
  const location = useLocation()
  const { title, subtitle } = resolveTitle(location.pathname)

  return (
    <div className="flex h-screen bg-base-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="max-w-[1600px] mx-auto p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
      <CommandPalette />
      <OrderModal />
    </div>
  )
}
