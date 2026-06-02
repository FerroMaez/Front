import { useCartStore } from '../store/cartStore'

export function useCart() {
  const store = useCartStore()
  return {
    items: store.items,
    isOpen: store.isOpen,
    count: store.items.reduce((s, i) => s + i.qty, 0),
    total: store.items.reduce((s, i) => s + (i.price || 0) * i.qty, 0),
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQty: store.updateQty,
    clearCart: store.clearCart,
    toggleCart: store.toggleCart,
  }
}
