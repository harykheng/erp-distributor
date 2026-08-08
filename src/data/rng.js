// Seeded PRNG (mulberry32) supaya mock data konsisten tiap reload.
export function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeRng(seed = 42) {
  const rand = mulberry32(seed)
  return {
    float: () => rand(),
    int: (min, max) => Math.floor(rand() * (max - min + 1)) + min,
    pick: (arr) => arr[Math.floor(rand() * arr.length)],
    pickWeighted: (arr, weights) => {
      const total = weights.reduce((a, b) => a + b, 0)
      let r = rand() * total
      for (let i = 0; i < arr.length; i++) {
        r -= weights[i]
        if (r <= 0) return arr[i]
      }
      return arr[arr.length - 1]
    },
    bool: (p = 0.5) => rand() < p,
    shuffle: (arr) => {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    },
  }
}
