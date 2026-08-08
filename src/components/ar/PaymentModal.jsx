import { useState } from 'react'
import Modal from '../common/Modal'
import { formatRupiah } from '../../lib/format'
import { api } from '../../data/api'
import { useAppStore } from '../../store/useAppStore'

export default function PaymentModal({ receivable, onClose }) {
  const bumpDataVersion = useAppStore((s) => s.bumpDataVersion)
  const [amount, setAmount] = useState(receivable?.sisa || 0)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!receivable || amount <= 0) return
    setSubmitting(true)
    await api.recordPayment(receivable.orderId, Number(amount))
    bumpDataVersion()
    setSubmitting(false)
    onClose()
  }

  return (
    <Modal open={!!receivable} onClose={onClose} title="Catat Pembayaran">
      {receivable && (
        <div className="space-y-4">
          <div className="text-sm text-base-400">
            {receivable.outletNama} &middot; {receivable.nomorOrder}
          </div>
          <div className="flex items-center justify-between text-sm bg-base-850 rounded-lg px-3 py-2.5">
            <span className="text-base-400">Sisa Tagihan</span>
            <span className="font-bold text-base-100">{formatRupiah(receivable.sisa)}</span>
          </div>
          <div>
            <label className="text-xs font-semibold text-base-400 uppercase tracking-wide">Jumlah Dibayar</label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-500 text-sm">Rp</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={receivable.sisa}
                className="w-full bg-base-850 border border-base-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-base-100 focus:outline-none focus:ring-1 focus:ring-brand/60"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setAmount(receivable.sisa)}
                className="text-xs px-2.5 py-1 rounded-md bg-base-800 text-base-300 hover:bg-base-700"
              >
                Lunas Penuh
              </button>
              <button
                onClick={() => setAmount(Math.round(receivable.sisa / 2))}
                className="text-xs px-2.5 py-1 rounded-md bg-base-800 text-base-300 hover:bg-base-700"
              >
                50%
              </button>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || amount <= 0}
            className="w-full py-2.5 rounded-lg bg-brand text-ink font-bold text-sm hover:bg-brand-400 disabled:opacity-40"
          >
            {submitting ? 'Menyimpan...' : 'Simpan Pembayaran'}
          </button>
        </div>
      )}
    </Modal>
  )
}
