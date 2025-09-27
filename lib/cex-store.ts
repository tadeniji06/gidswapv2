import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CEX {
  id: string
  name: string
  uid: string
  logo: string
  color: string
}

interface CEXState {
  exchanges: CEX[]
  selectedExchange: CEX | null
  isLoading: boolean
  error: string | null

  // Actions
  selectExchange: (exchange: CEX) => void
  copyUID: (uid: string) => Promise<void>
  resetSelection: () => void
}

const exchanges: CEX[] = [
  {
    id: "mexc",
    name: "MEXC",
    uid: "36415683",
    logo: "/images/mexc-logo.png",
    color: "#00D4AA",
  },
  {
    id: "bybit",
    name: "Bybit",
    uid: "48370369",
    logo: "/images/bybit.png",
    color: "#F7931A",
  },
  {
    id: "binance",
    name: "Binance",
    uid: "96505846",
    logo: "/images/binance.jpeg",
    color: "#F3BA2F",
  },
  {
    id: "bitget",
    name: "Bitget",
    uid: "6622995717",
    logo: "/images/bitget.png",
    color: "#00D4AA",
  },
  {
    id: "gateio",
    name: "Gate.io",
    uid: "10525662",
    logo: "/images/gate.jpeg",
    color: "#7B68EE",
  },
]

export const useCEXStore = create<CEXState>()(
  persist(
    (set, get) => ({
      exchanges,
      selectedExchange: null,
      isLoading: false,
      error: null,

      selectExchange: (exchange: CEX) => {
        set({ selectedExchange: exchange, error: null })
      },

      copyUID: async (uid: string) => {
        try {
          set({ isLoading: true, error: null })

          // Copy to clipboard
          await navigator.clipboard.writeText(uid)

          // Create WhatsApp message
          const message = `Hi, I would like to exchange funds with Gidswap.`
          const encodedMessage = encodeURIComponent(message)
          const whatsappURL = `https://wa.me/+2349038958941?text=${encodedMessage}`

          // Redirect to WhatsApp
          window.open(whatsappURL, "_blank")

          set({ isLoading: false })
        } catch (error) {
          set({
            error: "Failed to copy UID. Please try again.",
            isLoading: false,
          })
        }
      },

      resetSelection: () => {
        set({ selectedExchange: null, error: null })
      },
    }),
    {
      name: "cex-store",
      partialize: (state) => ({ selectedExchange: state.selectedExchange }),
    },
  ),
)
