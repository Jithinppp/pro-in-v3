import { create } from 'zustand'

interface AuthState {
  session: any | null
  role: string | null
  setSession: (session: any | null) => void
  setRole: (role: string | null) => void
  clearAuth: () => void
}

const useAuthStore = create<AuthState>((set) => ({
  session: null,
  role: null,
  setSession: (session) => set({ session }),
  setRole: (role) => set({ role }),
  clearAuth: () => set({ session: null, role: null }),
}))

export default useAuthStore
