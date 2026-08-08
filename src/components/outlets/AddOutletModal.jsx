import { useState } from 'react'
import Modal from '../common/Modal'
import { api } from '../../data/api'
import { tipeOutlet } from '../../data/outlets'
import { zones, salesReps } from '../../data/salesReps'

const emptyForm = {
  nama: '',
  tipe: tipeOutlet[0],
  zona: zones[0],
  alamat: '',
  telepon: '',
  kontak: '',
  kreditLimit: 3_000_000,
  salesRepId: salesReps[0].id,
}

export default function AddOutletModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleClose() {
    setForm(emptyForm)
    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nama.trim() || !form.alamat.trim() || !form.telepon.trim()) return
    setSubmitting(true)
    const outlet = await api.createOutlet({ ...form, kreditLimit: Number(form.kreditLimit) })
    setSubmitting(false)
    setForm(emptyForm)
    onCreated?.(outlet)
  }

  return (
    <Modal open={open} onClose={handleClose} title="Tambah Outlet" subtitle="Daftarkan toko/warung pelanggan baru" width="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nama Outlet">
          <input
            required
            value={form.nama}
            onChange={(e) => update('nama', e.target.value)}
            placeholder="Toko / Warung / UD..."
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Tipe Outlet">
            <select value={form.tipe} onChange={(e) => update('tipe', e.target.value)} className={inputClass}>
              {tipeOutlet.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Zona">
            <select value={form.zona} onChange={(e) => update('zona', e.target.value)} className={inputClass}>
              {zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Alamat">
          <input
            required
            value={form.alamat}
            onChange={(e) => update('alamat', e.target.value)}
            placeholder="Jl. ..."
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Nama Kontak">
            <input value={form.kontak} onChange={(e) => update('kontak', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Telepon">
            <input
              required
              value={form.telepon}
              onChange={(e) => update('telepon', e.target.value)}
              placeholder="08xx-xxxx-xxxx"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Limit Kredit (Rp)">
            <input
              type="number"
              min="0"
              value={form.kreditLimit}
              onChange={(e) => update('kreditLimit', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Sales Rep">
            <select value={form.salesRepId} onChange={(e) => update('salesRepId', e.target.value)} className={inputClass}>
              {salesReps.map((r) => (
                <option key={r.id} value={r.id}>{r.nama}</option>
              ))}
            </select>
          </Field>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-brand text-ink font-bold text-sm hover:bg-brand-400 disabled:opacity-40"
        >
          {submitting ? 'Menyimpan...' : 'Simpan Outlet'}
        </button>
      </form>
    </Modal>
  )
}

const inputClass =
  'w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 placeholder:text-base-500 focus:outline-none focus:ring-1 focus:ring-brand/60'

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}
