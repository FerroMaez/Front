import { create } from 'zustand'

// Estado visible de la cola offline (la fuente de verdad es IndexedDB, ver ventasOfflineDB).
export const useOfflineStore = create((set) => ({
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
  ventas: [],
  setOnline: (online) => set({ online }),
  setVentas: (ventas) => set({ ventas }),
}))
