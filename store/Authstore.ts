import { create } from "zustand"
import { getCookie, removeCookie } from "@/lib/cookies"

interface AuthState {
  isRegisterModalOpen: boolean
  isLoginModalOpen: boolean
  isAuthenticated: boolean
  regStatus: boolean
  token: string | null
  setRegisterModalOpen: (open: boolean) => void
  setLoginModalOpen: (open: boolean) => void
  setAuthStatus: (status: boolean) => void
  setRegStatus: (status: boolean) => void
  setToken: (token: string | null) => void
  initializeAuth: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isRegisterModalOpen: false,
  isLoginModalOpen: false,
  isAuthenticated: false,
  regStatus: false,
  token: null,

  setRegisterModalOpen: (open) => set({ isRegisterModalOpen: open }),
  setLoginModalOpen: (open) => set({ isLoginModalOpen: open }),
  setAuthStatus: (status) => set({ isAuthenticated: status }),
  setRegStatus: (status) => set({ regStatus: status }),
  setToken: (token) => set({ token }),

  initializeAuth: () => {
    // This function should be called on the client-side to initialize the store
    // based on existing cookies.
    const token = getCookie("token")
    const regStatus = getCookie("regstatus") === "true"

    set({
      token: token || null,
      isAuthenticated: !!token,
      regStatus: regStatus,
    })
  },

  logout: () => {
    removeCookie("token")
    removeCookie("user_data")
    removeCookie("user");
    // removeCookie("regstatus") //Remove regstatus on explicit logout
    set({
      isAuthenticated: false,
      // regStatus: false,
      token: null,
    })
  },
}))
