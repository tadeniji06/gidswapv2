import { create } from "zustand"
import { persist } from "zustand/middleware"
import axios from "axios"
import Cookies from "js-cookie"
import { toast } from "sonner"

interface PasswordResetState {
  currentStep: "email" | "otp" | "password"
  email: string
  otp: string
  newPassword: string
  confirmPassword: string
  isLoading: boolean
  error: string | null
  emailSent: boolean
  otpVerified: boolean
  passwordReset: boolean
  resetToken: string | null
}

interface PasswordResetActions {
  setStep: (step: PasswordResetState["currentStep"]) => void
  nextStep: () => void
  previousStep: () => void
  setEmail: (email: string) => void
  setOtp: (otp: string) => void
  setNewPassword: (password: string) => void
  setConfirmPassword: (password: string) => void
  sendOtp: () => Promise<void>
  verifyOtp: () => Promise<void>
  resetPassword: () => Promise<void>
  setError: (error: string | null) => void
  resetState: () => void
}

type PasswordResetStore = PasswordResetState & PasswordResetActions
const initialState: PasswordResetState = {
  currentStep: "email",
  email: "",
  otp: "",
  newPassword: "",
  resetToken: "",
  confirmPassword: "",
  isLoading: false,
  error: null,
  emailSent: false,
  otpVerified: false,
  passwordReset: false,
}

export const usePasswordResetStore = create<PasswordResetStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const { currentStep } = get()
        if (currentStep === "email") set({ currentStep: "otp" })
        else if (currentStep === "otp") set({ currentStep: "password" })
      },

      previousStep: () => {
        const { currentStep } = get()
        if (currentStep === "otp") set({ currentStep: "email" })
        else if (currentStep === "password") set({ currentStep: "otp" })
      },

      setEmail: (email) => set({ email, error: null }),
      setOtp: (otp) => set({ otp, error: null }),
      setNewPassword: (newPassword) => set({ newPassword, error: null }),
      setConfirmPassword: (confirmPassword) => set({ confirmPassword, error: null }),

      sendOtp: async () => {
        const { email } = get()
        if (!email) {
          toast.error("Please enter your email address")
          return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          toast.error("Please enter a valid email address")
          return
        }

        set({ isLoading: true, error: null })

        try {
          const token = Cookies.get("token")
          const api_url = process.env.NEXT_PUBLIC_PROD_API
          const response = await axios.post(
            `${api_url}/api/auth/request-otp`,
            { email },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          )

          set({
            emailSent: true,
            currentStep: "otp",
            isLoading: false,
          })
          toast.success(response.data.message || "OTP sent successfully")
        } catch (error: any) {
          set({ isLoading: false })
          toast.error(error.response?.data?.message || "Failed to send OTP")
        }
      },

      verifyOtp: async () => {
        const { email, otp } = get()
        if (!otp || otp.length !== 6) {
          toast.error("Please enter a valid 6-digit OTP")
          return
        }

        set({ isLoading: true, error: null })

        try {
          const token = Cookies.get("token")
          const api_url = process.env.NEXT_PUBLIC_PROD_API
          const response = await axios.post(
            `${api_url}/api/auth/verify-otp`,
            { email, otp },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          )

          set({
            otpVerified: true,
            currentStep: "password",
            isLoading: false,
          })
          toast.success(response.data.message || "OTP verified successfully")
          Cookies.set("resetToken", response.data.resetToken, { expires: 1/144, path: "/" });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Invalid OTP. Please try again.",
            isLoading: false,
          })
        }
      },

      resetPassword: async () => {
        const resetToken = Cookies.get("resetToken");
        const { newPassword, confirmPassword } = get()

        if (!newPassword || newPassword.length < 8) {
          set({ error: "Password must be at least 8 characters long" })
          return
        }
        if (newPassword !== confirmPassword) {
          set({ error: "Passwords do not match" })
          return
        }

        set({ isLoading: true, error: null })

        try {
          const token = Cookies.get("token")
          const api_url = process.env.NEXT_PUBLIC_PROD_API
          const response = await axios.post(
            `${api_url}/api/auth/reset-password`,
            { resetToken, newPassword },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          )

          set({
            passwordReset: true,
            isLoading: false,
          })
          toast.success(response.data.message || "Password updated successfully")
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to reset password. Please try again.",
            isLoading: false,
          })
        }
      },

      setError: (error) => set({ error }),
      resetState: () => set(initialState),
    }),
    {
      name: "password-reset-storage",
      partialize: (state) => ({
        currentStep: state.currentStep,
        email: state.email,
        emailSent: state.emailSent,
        otpVerified: state.otpVerified,
      }),
    },
  ),
)
