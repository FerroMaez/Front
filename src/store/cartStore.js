import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (product) => {
    const items = get().items
    const existing = items.find((i) => i.id === product.id)
    if (existing) {
      set({ items: items.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) })
    } else {
      set({ items: [...items, { ...product, qty: 1 }] })
    }
  },

  removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

  updateQty: (id, qty) => {
    if (qty <= 0) return get().removeItem(id)
    set({ items: get().items.map((i) => i.id === id ? { ...i, qty } : i) })
  },

  clearCart: () => set({ items: [] }),

  toggleCart: () => set({ isOpen: !get().isOpen }),

  get total() {
    return get().items.reduce((sum, i) => sum + (i.price || 0) * i.qty, 0)
  },

  get count() {
    return get().items.reduce((sum, i) => sum + i.qty, 0)
  },
}))
