import { create } from "zustand"
import { getCookie, removeCookie } from "@/lib/cookies"

interface AuthState {
  isRegisterModalOpen: boolean
  isLoginModalOpen: boolean
  isForgotModalOpen: boolean
  isAuthenticated: boolean
  regStatus: boolean
  token: string | null
  user: any | null
  tempEmail: string
  setRegisterModalOpen: (open: boolean) => void
  setLoginModalOpen: (open: boolean) => void
  setForgotModalOpen: (open: boolean) => void
  setAuthStatus: (status: boolean) => void
  setRegStatus: (status: boolean) => void
  setToken: (token: string | null) => void
  setUser: (user: any | null) => void
  setTempEmail: (email: string) => void
  initializeAuth: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isRegisterModalOpen: false,
  isLoginModalOpen: false,
  isForgotModalOpen: false,
  isAuthenticated: false,
  regStatus: false,
  token: null,
  user: null,
  tempEmail: "",

  setRegisterModalOpen: (open) => set({ isRegisterModalOpen: open }),
  setLoginModalOpen: (open) => set({ isLoginModalOpen: open }),
  setForgotModalOpen: (open) => set({ isForgotModalOpen: open }),
  setAuthStatus: (status) => set({ isAuthenticated: status }),
  setRegStatus: (status) => set({ regStatus: status }),
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  setTempEmail: (tempEmail) => set({ tempEmail }),

  initializeAuth: () => {
    const token = getCookie("token")
    const regStatus = getCookie("regstatus") === "true"
    const userStr = getCookie("user")
    let user = null
    if (userStr) {
      try { user = JSON.parse(userStr) } catch(e) {}
    }

    set({
      token: token || null,
      isAuthenticated: !!token,
      regStatus: regStatus,
      user
    })
  },

  logout: () => {
    removeCookie("token")
    removeCookie("user_data")
    removeCookie("user");
    set({
      isAuthenticated: false,
      // regStatus: false,
      token: null,
    })
  },
}))
