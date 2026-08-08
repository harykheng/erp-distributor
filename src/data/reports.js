import { products } from './products'

const productCostMap = new Map(products.map((p) => [p.id, p.hargaModal]))

function hppOfItem(item) {
  const modal = productCostMap.get(item.productId)
  // fallback ke asumsi margin 20% kalau produk sudah dihapus/tidak ketemu
  return (modal ?? item.hargaSatuan * 0.8) * item.qty
}

export function computeLabaRugi(ordersInPeriod) {
  const byKategoriMap = new Map()
  let totalPenjualan = 0
  let totalHpp = 0

  ordersInPeriod.forEach((o) => {
    o.items.forEach((it) => {
      const product = products.find((p) => p.id === it.productId)
      const kategori = product?.kategori || 'Lainnya'
      const hpp = hppOfItem(it)
      totalPenjualan += it.subtotal
      totalHpp += hpp

      const cur = byKategoriMap.get(kategori) || { kategori, penjualan: 0, hpp: 0 }
      cur.penjualan += it.subtotal
      cur.hpp += hpp
      byKategoriMap.set(kategori, cur)
    })
  })

  const labaKotor = totalPenjualan - totalHpp
  const marginPct = totalPenjualan > 0 ? (labaKotor / totalPenjualan) * 100 : 0

  const byKategori = [...byKategoriMap.values()]
    .map((k) => ({
      ...k,
      labaKotor: k.penjualan - k.hpp,
      marginPct: k.penjualan > 0 ? ((k.penjualan - k.hpp) / k.penjualan) * 100 : 0,
    }))
    .sort((a, b) => b.labaKotor - a.labaKotor)

  return { totalPenjualan, totalHpp, labaKotor, marginPct, byKategori }
}
