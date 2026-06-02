import { create } from 'zustand'

const saved = localStorage.getItem('manhid-theme')
const initial = saved === 'light' ? 'light' : 'dark'

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem('manhid-theme', theme)
}

applyTheme(initial)

export const useThemeStore = create((set) => ({
  theme: initial,
  toggle: () =>
    set((s) => {
      const next = s.theme === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      return { theme: next }
    }),
}))
