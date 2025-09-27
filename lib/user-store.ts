import { create } from "zustand"
import axios from "axios"
import Cookies from "js-cookie"
import { toast } from "sonner"
export interface User {
  id: string
  fullName: string
  email: string
  ipAddress: string
  userAgent: string
  lastLoginIP: string
  lastLoginUserAgent: string
  lastLoginAt: string
  createdAt: string
}

interface UserState {
  user: User | null
  isLoading: boolean
  error: string | null

  fetchUser: () => Promise<void>
  updateName: (name: string) => Promise<void>
  updateEmail: (currentPassword: string, email: string) => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>
  clearError: () => void
  logout: () => void
}

const USER_COOKIE_KEY = "user_data"
const api_url = process.env.NEXT_PUBLIC_PROD_API

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  fetchUser: async () => {
    try {
      set({ isLoading: true, error: null })

      const cachedUser = Cookies.get(USER_COOKIE_KEY)
      if (cachedUser) {
        set({ user: JSON.parse(cachedUser), isLoading: false })
        return
      }

      const response = await axios.get(`${api_url}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      })

      const rawUser = response.data.user

      // Normalize to always have fullName
      const user: User = {
        ...rawUser,
        fullName: rawUser.fullName || rawUser.fullname || "",
      }

      Cookies.set(USER_COOKIE_KEY, JSON.stringify(user), { expires: 3 })
      set({ user, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch user data",
        isLoading: false,
      })
    }
  },

  updateName: async (name: string) => {
    try {
      set({ isLoading: true, error: null })
      let response = await axios.put(
        `${api_url}/api/user/profile`,
        { fullName: name },
        { headers: { Authorization: `Bearer ${Cookies.get("token")}` } },
      )

      const updatedUser = { ...get().user!, fullName: name }
      Cookies.set(USER_COOKIE_KEY, JSON.stringify(updatedUser), { expires: 7 })
      set({ user: updatedUser, isLoading: false }) 
      const {message}  = response.data
      toast.success(`Info: ${message}`)
     
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update name",
        isLoading: false,
      })
    }
  },

  updateEmail: async (currentPassword: string, email: string) => {
    try {
      set({ isLoading: true, error: null })
      let response = await axios.put(
        `${api_url}/api/user/email`,
        { newEmail: email, password: currentPassword},
        { headers: { Authorization: `Bearer ${Cookies.get("token")}` } },
      )

      const updatedUser = { ...get().user!, email }
      Cookies.set(USER_COOKIE_KEY, JSON.stringify(updatedUser), { expires: 7 })
      set({ user: updatedUser, isLoading: false })
      const {message}  = response.data
      toast.success(`Info: ${message}`)
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update email",
        isLoading: false,
      })
    }
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    try {
      set({ isLoading: true, error: null })
      let response = await axios.put(
        `${api_url}/api/user/password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${Cookies.get("token")}` } },
      )
      set({ isLoading: false })
      const {message}  = response.data
      toast.success(`Info: ${message}`)
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update password",
        isLoading: false,
      })
    }
  },

  clearError: () => set({ error: null }),

  logout: () => {
    
    Cookies.remove(USER_COOKIE_KEY)
    Cookies.remove("token")
    set({ user: null, error: null })
  },
}))
