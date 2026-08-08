import { makeRng } from './rng'
import { warehouses } from './warehouses'

const rng = makeRng(202)

const catalog = [
  // Sembako
  { nama: 'Minyak Goreng Bimoli 2L', kategori: 'Sembako', satuan: 'dus', isi: '6 pcs', harga: 185_000 },
  { nama: 'Minyak Goreng Sania 1L', kategori: 'Sembako', satuan: 'dus', isi: '12 pcs', harga: 168_000 },
  { nama: 'Beras Rojolele 5kg', kategori: 'Sembako', satuan: 'karung', isi: '1 pcs', harga: 68_000 },
  { nama: 'Gula Pasir Gulaku 1kg', kategori: 'Sembako', satuan: 'dus', isi: '12 pcs', harga: 210_000 },
  { nama: 'Tepung Terigu Segitiga Biru 1kg', kategori: 'Sembako', satuan: 'dus', isi: '12 pcs', harga: 156_000 },
  { nama: 'Garam Dapur Cap Kapal 500gr', kategori: 'Sembako', satuan: 'dus', isi: '24 pcs', harga: 72_000 },
  { nama: 'Telur Ayam Negeri per Kg', kategori: 'Sembako', satuan: 'kg', isi: '1 kg', harga: 28_000 },
  { nama: 'Mie Instan Indomie Goreng', kategori: 'Sembako', satuan: 'dus', isi: '40 pcs', harga: 112_000 },
  { nama: 'Mie Instan Sedaap Kuah', kategori: 'Sembako', satuan: 'dus', isi: '40 pcs', harga: 108_000 },
  { nama: 'Kecap Manis Bango 620ml', kategori: 'Sembako', satuan: 'dus', isi: '12 pcs', harga: 198_000 },
  // Minuman
  { nama: 'Air Mineral Aqua 600ml', kategori: 'Minuman', satuan: 'dus', isi: '24 pcs', harga: 42_000 },
  { nama: 'Air Mineral Le Minerale 600ml', kategori: 'Minuman', satuan: 'dus', isi: '24 pcs', harga: 40_000 },
  { nama: 'Teh Botol Sosro 350ml', kategori: 'Minuman', satuan: 'krat', isi: '24 pcs', harga: 66_000 },
  { nama: 'Coca-Cola Kaleng 330ml', kategori: 'Minuman', satuan: 'dus', isi: '24 pcs', harga: 96_000 },
  { nama: 'Susu Kental Manis Frisian Flag', kategori: 'Minuman', satuan: 'dus', isi: '48 pcs', harga: 210_000 },
  { nama: 'Kopi Kapal Api Sachet', kategori: 'Minuman', satuan: 'dus', isi: '10 renceng', harga: 145_000 },
  { nama: 'Teh Celup Sariwangi', kategori: 'Minuman', satuan: 'dus', isi: '24 pcs', harga: 132_000 },
  { nama: 'Minuman Isotonik Pocari Sweat 500ml', kategori: 'Minuman', satuan: 'dus', isi: '24 pcs', harga: 168_000 },
  // Rokok
  { nama: 'Rokok Gudang Garam Surya 16', kategori: 'Rokok', satuan: 'slop', isi: '10 bks', harga: 245_000 },
  { nama: 'Rokok Sampoerna Mild', kategori: 'Rokok', satuan: 'slop', isi: '10 bks', harga: 258_000 },
  { nama: 'Rokok Djarum Super', kategori: 'Rokok', satuan: 'slop', isi: '10 bks', harga: 232_000 },
  { nama: 'Rokok Marlboro Merah', kategori: 'Rokok', satuan: 'slop', isi: '10 bks', harga: 275_000 },
  // Makanan Ringan
  { nama: 'Biskuit Roma Kelapa', kategori: 'Makanan Ringan', satuan: 'dus', isi: '24 pcs', harga: 98_000 },
  { nama: 'Wafer Tango', kategori: 'Makanan Ringan', satuan: 'dus', isi: '24 pcs', harga: 105_000 },
  { nama: 'Chitato Sapi Panggang', kategori: 'Makanan Ringan', satuan: 'dus', isi: '20 pcs', harga: 140_000 },
  { nama: 'Chiki Balls', kategori: 'Makanan Ringan', satuan: 'dus', isi: '20 pcs', harga: 60_000 },
  { nama: 'Permen Kopiko', kategori: 'Makanan Ringan', satuan: 'dus', isi: '24 pcs', harga: 84_000 },
  { nama: 'Wafer Nissin', kategori: 'Makanan Ringan', satuan: 'dus', isi: '24 pcs', harga: 90_000 },
  // Perawatan & Kebersihan
  { nama: 'Sabun Mandi Lifebuoy', kategori: 'Perawatan', satuan: 'dus', isi: '48 pcs', harga: 168_000 },
  { nama: 'Shampo Sunsilk Sachet', kategori: 'Perawatan', satuan: 'dus', isi: '12 renceng', harga: 96_000 },
  { nama: 'Pasta Gigi Pepsodent 190gr', kategori: 'Perawatan', satuan: 'dus', isi: '24 pcs', harga: 180_000 },
  { nama: 'Deterjen Rinso 800gr', kategori: 'Perawatan', satuan: 'dus', isi: '12 pcs', harga: 156_000 },
  { nama: 'Sabun Cuci Piring Sunlight 750ml', kategori: 'Perawatan', satuan: 'dus', isi: '12 pcs', harga: 168_000 },
  { nama: 'Pembalut Charm', kategori: 'Perawatan', satuan: 'dus', isi: '24 pcs', harga: 216_000 },
  { nama: 'Popok Bayi Pampers M', kategori: 'Perawatan', satuan: 'dus', isi: '6 pcs', harga: 390_000 },
  // Bumbu Dapur
  { nama: 'Bumbu Masak Royco Ayam', kategori: 'Bumbu Dapur', satuan: 'dus', isi: '40 sachet', harga: 60_000 },
  { nama: 'Saus Sambal ABC 340ml', kategori: 'Bumbu Dapur', satuan: 'dus', isi: '12 pcs', harga: 132_000 },
  { nama: 'Saus Tomat ABC 340ml', kategori: 'Bumbu Dapur', satuan: 'dus', isi: '12 pcs', harga: 126_000 },
  { nama: 'Bawang Goreng Bawang Jawa', kategori: 'Bumbu Dapur', satuan: 'dus', isi: '24 pcs', harga: 108_000 },
]

export const products = catalog.map((p, i) => {
  const stockByWarehouse = {}
  warehouses.forEach((w, wi) => {
    // Beberapa produk sengaja dibuat stok kritis untuk insight demo
    const isCritical = (i + wi) % 9 === 0
    stockByWarehouse[w.id] = isCritical ? rng.int(2, 8) : rng.int(15, 220)
  })
  // margin kotor khas distributor FMCG: sekitar 12-28% dari harga jual
  const marginPct = rng.int(12, 28)
  const hargaModal = Math.round((p.harga * (100 - marginPct)) / 100 / 100) * 100

  return {
    id: `prod-${i + 1}`,
    sku: `SKU${String(i + 1).padStart(4, '0')}`,
    ...p,
    hargaModal,
    stokMinimum: rng.int(15, 30),
    stockByWarehouse,
  }
})

export function totalStok(product) {
  return Object.values(product.stockByWarehouse).reduce((a, b) => a + b, 0)
}

// kritis jika stok di salah satu gudang sudah di bawah ambang minimum
export function isProductCritical(product) {
  return Object.values(product.stockByWarehouse).some((stok) => stok <= product.stokMinimum)
}

export const productCategories = [...new Set(products.map((p) => p.kategori))]
export const productUnits = [...new Set(products.map((p) => p.satuan))]

let runtimeProductSeq = products.length + 1

export function createProduct(payload) {
  const stockByWarehouse = {}
  warehouses.forEach((w) => {
    stockByWarehouse[w.id] = payload.stockByWarehouse?.[w.id] ?? 0
  })
  const product = {
    id: `prod-runtime-${runtimeProductSeq}`,
    sku: `SKU${String(products.length + runtimeProductSeq).padStart(4, '0')}`,
    nama: payload.nama,
    kategori: payload.kategori,
    satuan: payload.satuan,
    isi: payload.isi,
    harga: payload.harga,
    hargaModal: payload.hargaModal || Math.round((payload.harga * 0.8) / 100) * 100,
    stokMinimum: payload.stokMinimum,
    stockByWarehouse,
  }
  runtimeProductSeq++
  products.unshift(product)
  return product
}
