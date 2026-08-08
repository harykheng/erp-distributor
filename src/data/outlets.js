import { makeRng } from './rng'
import { zones } from './salesReps'

const rng = makeRng(101)

const namaToko = [
  'Toko Sumber Rejeki', 'Warung Bu Siti', 'UD Jaya Makmur', 'Toko Makmur Abadi',
  'Warung Pak Darto', 'Toko Sinar Harapan', 'UD Berkah Jaya', 'Toko Anugerah',
  'Warung Bu Yanti', 'Toko Sido Mulyo', 'UD Rezeki Barokah', 'Toko Cahaya Baru',
  'Warung Mas Joko', 'Toko Sejahtera', 'UD Mitra Usaha', 'Toko Sumber Makmur',
  'Warung Bu Endang', 'Toko Karya Mandiri', 'UD Lancar Jaya', 'Toko Bintang Terang',
  'Warung Pak Slamet', 'Toko Aneka Jaya', 'UD Sentosa', 'Toko Rejeki Lancar',
  'Warung Bu Rahma',
]

const jalanList = [
  'Jl. Kebon Jeruk', 'Jl. Sudirman', 'Jl. Cempaka Putih', 'Jl. Pluit Raya',
  'Jl. Tanjung Duren', 'Jl. Kalideres', 'Jl. Cakung', 'Jl. Cengkareng',
  'Jl. Serpong Raya', 'Jl. BSD Boulevard', 'Jl. Ciledug Raya', 'Jl. Bekasi Timur',
  'Jl. Margonda Raya', 'Jl. Cinere', 'Jl. Kalimalang',
]

const tipeOutlet = ['Warung', 'Toko Kelontong', 'Minimarket', 'Grosir Kecil']

export const outlets = namaToko.map((nama, i) => {
  const zona = zones[i % zones.length]
  const kreditLimit = rng.pick([2_000_000, 3_000_000, 5_000_000, 7_500_000, 10_000_000])
  return {
    id: `outlet-${i + 1}`,
    nama,
    tipe: rng.pick(tipeOutlet),
    zona,
    alamat: `${rng.pick(jalanList)} No. ${rng.int(1, 150)}, ${zona}`,
    telepon: `08${rng.int(11, 99)}-${rng.int(1000, 9999)}-${rng.int(1000, 9999)}`,
    kontak: nama.replace(/^(Toko|Warung|UD)\s/, ''),
    kreditLimit,
    salesRepId: `rep-${(i % 6) + 1}`,
    aktif: rng.bool(0.92),
    bergabungSejak: `202${rng.int(1, 4)}-${String(rng.int(1, 12)).padStart(2, '0')}-01`,
  }
})

export { tipeOutlet }

let runtimeOutletSeq = outlets.length + 1

export function createOutlet(payload) {
  const outlet = {
    id: `outlet-runtime-${runtimeOutletSeq++}`,
    nama: payload.nama,
    tipe: payload.tipe,
    zona: payload.zona,
    alamat: payload.alamat,
    telepon: payload.telepon,
    kontak: payload.kontak,
    kreditLimit: payload.kreditLimit,
    salesRepId: payload.salesRepId,
    aktif: true,
    bergabungSejak: new Date().toISOString().slice(0, 10),
  }
  outlets.unshift(outlet)
  return outlet
}

export function setOutletStatus(outletId, aktif) {
  const outlet = outlets.find((o) => o.id === outletId)
  if (!outlet) return null
  outlet.aktif = aktif
  return outlet
}
