import { create } from 'zustand'

export const useAppStore = create((set) => ({
  mode: 'simple', // 'simple' | 'power'
  toggleMode: () => set((s) => ({ mode: s.mode === 'simple' ? 'power' : 'simple' })),
  setMode: (mode) => set({ mode }),

  commandPaletteOpen: false,
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),

  orderDrawerOpen: false,
  openOrderDrawer: () => set({ orderDrawerOpen: true, commandPaletteOpen: false }),
  closeOrderDrawer: () => set({ orderDrawerOpen: false }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  dataVersion: 0,
  bumpDataVersion: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),

  lastCreatedOrder: null,
  setLastCreatedOrder: (order) => set({ lastCreatedOrder: order }),
}))
