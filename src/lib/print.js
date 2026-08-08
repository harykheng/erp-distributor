import { formatRupiah, formatDate } from './format'
import { warehouses } from '../data/warehouses'

const COMPANY = {
  nama: 'UD Sumber Makmur Distribusi',
  alamat: 'Jl. Daan Mogot No. 88, Jakarta Barat',
  telepon: '021-5678-1234',
}

function baseStyles() {
  return `
    <style>
      * { box-sizing: border-box; }
      body { font-family: Arial, Helvetica, sans-serif; color: #111; padding: 32px; }
      h1 { font-size: 18px; margin: 0 0 4px; }
      .muted { color: #555; font-size: 12px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border-bottom: 1px solid #ddd; padding: 8px 6px; font-size: 13px; text-align: left; }
      th { background: #f4f4f4; text-transform: uppercase; font-size: 11px; letter-spacing: 0.03em; }
      .text-right { text-align: right; }
      .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #111; padding-bottom: 16px; }
      .doc-title { font-size: 20px; font-weight: bold; text-transform: uppercase; }
      .meta { margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; font-size: 13px; }
      .meta div span { display: block; }
      .label { color: #777; font-size: 11px; text-transform: uppercase; }
      .total-row td { font-weight: bold; font-size: 15px; border-top: 2px solid #111; border-bottom: none; }
      .signature { display: flex; justify-content: space-between; margin-top: 64px; }
      .signature div { text-align: center; width: 200px; }
      .signature .line { margin-top: 60px; border-top: 1px solid #333; padding-top: 4px; font-size: 12px; }
      @media print { body { padding: 0; } }
    </style>
  `
}

function openPrintWindow(html) {
  const win = window.open('', '_blank', 'width=850,height=960')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 300)
}

export function printInvoice(order, outlet) {
  const rows = order.items
    .map(
      (it) => `
        <tr>
          <td>${it.nama}</td>
          <td>${it.qty} ${it.satuan}</td>
          <td class="text-right">${formatRupiah(it.hargaSatuan)}</td>
          <td class="text-right">${formatRupiah(it.subtotal)}</td>
        </tr>`
    )
    .join('')

  const html = `
    <html>
      <head><title>Invoice ${order.nomor}</title>${baseStyles()}</head>
      <body>
        <div class="header-row">
          <div>
            <h1>${COMPANY.nama}</h1>
            <div class="muted">${COMPANY.alamat}<br/>${COMPANY.telepon}</div>
          </div>
          <div style="text-align:right">
            <div class="doc-title">Invoice</div>
            <div class="muted">${order.nomor}</div>
          </div>
        </div>
        <div class="meta">
          <div><span class="label">Ditagihkan Kepada</span><span>${outlet?.nama || '-'}</span><span class="muted">${outlet?.alamat || ''}</span></div>
          <div><span class="label">Status</span><span>${order.status}</span></div>
          <div><span class="label">Tanggal</span><span>${formatDate(order.tanggal)}</span></div>
          <div><span class="label">Jatuh Tempo</span><span>${formatDate(order.jatuhTempo)}</span></div>
        </div>
        <table>
          <thead>
            <tr><th>Produk</th><th>Qty</th><th class="text-right">Harga</th><th class="text-right">Subtotal</th></tr>
          </thead>
          <tbody>
            ${rows}
            <tr class="total-row"><td colspan="3" class="text-right">Total</td><td class="text-right">${formatRupiah(order.total)}</td></tr>
          </tbody>
        </table>
        <div class="signature">
          <div><div class="line">Hormat Kami</div></div>
          <div><div class="line">Diterima Oleh</div></div>
        </div>
      </body>
    </html>
  `
  openPrintWindow(html)
}

export function printSuratJalan(order, outlet) {
  const rows = order.items
    .map(
      (it) => `
        <tr>
          <td>${it.nama}</td>
          <td class="text-right">${it.qty} ${it.satuan}</td>
        </tr>`
    )
    .join('')

  const html = `
    <html>
      <head><title>Surat Jalan ${order.suratJalanNumber || order.nomor}</title>${baseStyles()}</head>
      <body>
        <div class="header-row">
          <div>
            <h1>${COMPANY.nama}</h1>
            <div class="muted">${COMPANY.alamat}<br/>${COMPANY.telepon}</div>
          </div>
          <div style="text-align:right">
            <div class="doc-title">Surat Jalan</div>
            <div class="muted">${order.suratJalanNumber || '-'}</div>
          </div>
        </div>
        <div class="meta">
          <div><span class="label">Dikirim Kepada</span><span>${outlet?.nama || '-'}</span><span class="muted">${outlet?.alamat || ''}</span></div>
          <div><span class="label">No. Order</span><span>${order.nomor}</span></div>
          <div><span class="label">Tanggal Kirim</span><span>${formatDate(order.tanggal)}</span></div>
          <div><span class="label">Dikirim dari</span><span>${warehouses.find((w) => w.id === order.warehouseId)?.nama || '-'}</span></div>
        </div>
        <table>
          <thead>
            <tr><th>Produk</th><th class="text-right">Jumlah</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="signature">
          <div><div class="line">Pengirim</div></div>
          <div><div class="line">Penerima</div></div>
        </div>
      </body>
    </html>
  `
  openPrintWindow(html)
}
