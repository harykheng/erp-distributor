import { useState } from 'react'
import { Building2, Warehouse, Users, Save } from 'lucide-react'
import { warehouses } from '../data/warehouses'
import { salesReps } from '../data/salesReps'

const tabs = [
  { key: 'profil', label: 'Profil Bisnis', icon: Building2 },
  { key: 'gudang', label: 'Daftar Gudang', icon: Warehouse },
  { key: 'sales', label: 'Sales Rep', icon: Users },
]

export default function SettingsPage() {
  const [tab, setTab] = useState('profil')

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1 space-y-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-brand/10 text-brand' : 'text-base-400 hover:text-base-100 hover:bg-base-850'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div className="md:col-span-3">
        {tab === 'profil' && <ProfilBisnis />}
        {tab === 'gudang' && <DaftarGudang />}
        {tab === 'sales' && <DaftarSales />}
      </div>
    </div>
  )
}

function Field({ label, defaultValue }) {
  return (
    <div>
      <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">{label}</label>
      <input
        defaultValue={defaultValue}
        className="mt-1.5 w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 focus:outline-none focus:ring-1 focus:ring-brand/60"
      />
    </div>
  )
}

function ProfilBisnis() {
  return (
    <div className="rounded-2xl border border-base-800 bg-base-900 shadow-card p-6 space-y-4">
      <h3 className="font-bold text-base-100">Profil Bisnis</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nama Perusahaan" defaultValue="UD Sumber Makmur Distribusi" />
        <Field label="NPWP" defaultValue="01.234.567.8-901.000" />
        <Field label="Alamat" defaultValue="Jl. Daan Mogot No. 88, Jakarta Barat" />
        <Field label="Telepon" defaultValue="021-5678-1234" />
        <Field label="Email" defaultValue="admin@sumbermakmur.co.id" />
        <Field label="Termin Default" defaultValue="14 hari" />
      </div>
      <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand text-base-950 text-sm font-bold hover:bg-brand-400">
        <Save size={15} /> Simpan Perubahan
      </button>
    </div>
  )
}

function DaftarGudang() {
  return (
    <div className="rounded-2xl border border-base-800 bg-base-900 shadow-card p-6">
      <h3 className="font-bold text-base-100 mb-4">Daftar Gudang</h3>
      <div className="space-y-2">
        {warehouses.map((w) => (
          <div key={w.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-base-850 border border-base-800">
            <div>
              <div className="text-sm font-semibold text-base-100">{w.nama}</div>
              <div className="text-xs text-base-500">{w.alamat}</div>
            </div>
            <span className="text-xs text-base-500">{w.kota}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DaftarSales() {
  return (
    <div className="rounded-2xl border border-base-800 bg-base-900 shadow-card p-6">
      <h3 className="font-bold text-base-100 mb-4">Daftar Sales Rep</h3>
      <div className="space-y-2">
        {salesReps.map((r) => (
          <div key={r.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-base-850 border border-base-800">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-base-950 shrink-0"
              style={{ backgroundColor: r.fotoWarna }}
            >
              {r.inisial}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-base-100">{r.nama}</div>
              <div className="text-xs text-base-500">{r.zona} &middot; {r.telepon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
