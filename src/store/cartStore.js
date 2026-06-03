import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (product, qty = 1) => {
    const items = get().items
    const existing = items.find(i => i.id === product.id)
    if (existing) {
      const newQty = Math.min(existing.qty + qty, product.stock_disponible)
      set({ items: items.map(i => i.id === product.id ? { ...i, qty: newQty } : i) })
    } else {
      set({ items: [...items, { ...product, qty: Math.min(qty, product.stock_disponible) }] })
    }
  },

  removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),

  updateQty: (id, qty) => {
    if (qty <= 0) { get().removeItem(id); return }
    const items = get().items
    const item = items.find(i => i.id === id)
    if (!item) return
    const capped = Math.min(qty, item.stock_disponible)
    set({ items: items.map(i => i.id === id ? { ...i, qty: capped } : i) })
  },

  clearCart: () => set({ items: [] }),
  openCart:  () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart:() => set({ isOpen: !get().isOpen }),

  getCount: () => get().items.reduce((s, i) => s + i.qty, 0),
  getTotal: () => get().items.reduce((s, i) => s + (i.precio_unitario || 0) * i.qty, 0),

  updateStockFromSSE: (productoId, nuevoStock) => {
    set({
      items: get().items.map(i => {
        if (i.id !== productoId) return i
        const newQty = Math.min(i.qty, nuevoStock)
        return { ...i, stock_disponible: nuevoStock, qty: newQty }
      })
    })
  },
}))
