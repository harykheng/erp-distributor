import { useState } from 'react'
import Modal from '../common/Modal'
import { api } from '../../data/api'
import { productCategories, productUnits } from '../../data/products'
import { warehouses } from '../../data/warehouses'

function emptyForm() {
  return {
    nama: '',
    kategori: productCategories[0],
    satuan: productUnits[0],
    isi: '',
    harga: 0,
    stokMinimum: 20,
    stockByWarehouse: Object.fromEntries(warehouses.map((w) => [w.id, 0])),
  }
}

export default function AddProductModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }
  function updateStock(warehouseId, value) {
    setForm((f) => ({
      ...f,
      stockByWarehouse: { ...f.stockByWarehouse, [warehouseId]: Math.max(0, Number(value) || 0) },
    }))
  }

  function handleClose() {
    setForm(emptyForm())
    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nama.trim() || !form.isi.trim()) return
    setSubmitting(true)
    const product = await api.createProduct({
      ...form,
      harga: Number(form.harga),
      stokMinimum: Number(form.stokMinimum),
    })
    setSubmitting(false)
    setForm(emptyForm())
    onCreated?.(product)
  }

  return (
    <Modal open={open} onClose={handleClose} title="Tambah Produk" subtitle="Daftarkan produk baru ke katalog" width="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nama Produk">
          <input
            required
            value={form.nama}
            onChange={(e) => update('nama', e.target.value)}
            placeholder="Contoh: Minyak Goreng Fortune 2L"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Kategori">
            <input
              required
              list="product-categories"
              value={form.kategori}
              onChange={(e) => update('kategori', e.target.value)}
              className={inputClass}
            />
            <datalist id="product-categories">
              {productCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Satuan">
            <input
              required
              list="product-units"
              value={form.satuan}
              onChange={(e) => update('satuan', e.target.value)}
              className={inputClass}
            />
            <datalist id="product-units">
              {productUnits.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Isi per Satuan">
            <input
              required
              value={form.isi}
              onChange={(e) => update('isi', e.target.value)}
              placeholder="Contoh: 12 pcs"
              className={inputClass}
            />
          </Field>
          <Field label="Harga (Rp)">
            <input
              type="number"
              min="0"
              value={form.harga}
              onChange={(e) => update('harga', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Stok Minimum (ambang kritis)">
          <input
            type="number"
            min="0"
            value={form.stokMinimum}
            onChange={(e) => update('stokMinimum', e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Stok Awal per Gudang">
          <div className="grid grid-cols-2 gap-3">
            {warehouses.map((w) => (
              <div key={w.id}>
                <label className="text-xs text-base-500">{w.nama}</label>
                <input
                  type="number"
                  min="0"
                  value={form.stockByWarehouse[w.id]}
                  onChange={(e) => updateStock(w.id, e.target.value)}
                  className={`${inputClass} mt-1`}
                />
              </div>
            ))}
          </div>
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-brand text-ink font-bold text-sm hover:bg-brand-400 disabled:opacity-40"
        >
          {submitting ? 'Menyimpan...' : 'Simpan Produk'}
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
