import { create } from 'zustand'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const newNotif = { id: Date.now(), read: false, timestamp: new Date(), ...notification }
    set({
      notifications: [newNotif, ...get().notifications],
      unreadCount: get().unreadCount + 1,
    })
  },

  markRead: (id) => {
    const notifications = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    )
    set({ notifications, unreadCount: notifications.filter((n) => !n.read).length })
  },

  markAllRead: () =>
    set({ notifications: get().notifications.map((n) => ({ ...n, read: true })), unreadCount: 0 }),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}))
