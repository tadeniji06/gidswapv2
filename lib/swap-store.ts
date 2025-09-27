import { create } from "zustand"
import axios from "axios"
import Cookies from "js-cookie"

interface Currency {
  code: string
  coin: string
  network: string
  name: string
  logo: string
  color: string
  recv: number
  send: number
}

interface SwapState {
  // UI State
  sellAmount: string
  receiveAmount: string
  sellUsdAmount: string
  receiveUsdAmount: string
  showAdditionalInfo: boolean
  activeLink: string
  swapStep: "swap" | "quote" | "pending" | "wallet"

  // Swap Data
  swapData: any
  currencies: Currency[]
  sellCurrency: Currency | null
  receiveCurrency: Currency | null
  quote: any
  walletAddress: string

  // Loading States
  isSwapping: boolean
  isLoadingCurrencies: boolean
  isLoadingQuote: boolean

  error: string | null

  // Actions
  setSellAmount: (amount: string) => void
  setReceiveAmount: (amount: string) => void
  setSellUsdAmount: (amount: string) => void
  setReceiveUsdAmount: (amount: string) => void
  setShowAdditionalInfo: (show: boolean) => void
  setActiveLink: (link: string) => void
  setSwapStep: (step: "swap" | "quote" | "pending" | "wallet") => void
  setSwapData: (data: any) => void
  setSellCurrency: (currency: Currency | null) => void
  setReceiveCurrency: (currency: Currency | null) => void
  setWalletAddress: (address: string) => void
  setError: (error: string | null) => void

  // API Actions
  fetchCurrencies: () => Promise<void>
  fetchQuote: () => Promise<void>
  showQuote: (swapPrepData: any) => void
  initiateSwap: () => Promise<void>
  backToSwap: () => void
  proceedWithWallet: (walletAddress: string) => Promise<void>
}

export const useSwapStore = create<SwapState>((set, get) => ({
  // Initial State
  sellAmount: "",
  receiveAmount: "",
  sellUsdAmount: "",
  receiveUsdAmount: "",
  showAdditionalInfo: false,
  activeLink: "Swap",
  swapStep: "swap",
  swapData: null,
  currencies: [],
  sellCurrency: null,
  receiveCurrency: null,
  quote: null,
  walletAddress: "",
  isSwapping: false,
  isLoadingCurrencies: false,
  isLoadingQuote: false,
  error: null,

  // Basic Setters
  setSellAmount: (amount) => set({ sellAmount: amount }),
  setReceiveAmount: (amount) => set({ receiveAmount: amount }),

  setSellUsdAmount: (usdAmount) => {
    const { quote, sellCurrency } = get()
    set({ sellUsdAmount: usdAmount })

    const usdValue = Number.parseFloat(usdAmount)
    // Only convert USD → crypto if quote matches the current coin
    if (
      quote &&
      sellCurrency &&
      quote.from.coin === sellCurrency.coin &&
      usdAmount !== "" &&
      !isNaN(usdValue) &&
      quote.from.usd > 0
    ) {
      const currencyAmount = (
        (usdValue / quote.from.usd) * Number.parseFloat(quote.from.amount)
      ).toFixed(8)
      set({ sellAmount: currencyAmount })
    }
  },

  setReceiveUsdAmount: (usdAmount) => {
    const { quote, receiveCurrency } = get()
    set({ receiveUsdAmount: usdAmount })

    const usdValue = Number.parseFloat(usdAmount)
    if (
      quote &&
      receiveCurrency &&
      quote.to.coin === receiveCurrency.coin &&
      usdAmount !== "" &&
      !isNaN(usdValue) &&
      quote.to.usd > 0
    ) {
      const currencyAmount = (
        (usdValue / quote.to.usd) * Number.parseFloat(quote.to.amount)
      ).toFixed(8)
      set({ receiveAmount: currencyAmount })
    }
  },

  setShowAdditionalInfo: (show) => set({ showAdditionalInfo: show }),
  setActiveLink: (link) => set({ activeLink: link }),
  setSwapStep: (step) => set({ swapStep: step }),
  setSwapData: (data) => set({ swapData: data }),

  // 🔑 Reset amounts & quote when changing sellCurrency
  setSellCurrency: (currency) => {
    set({
      sellCurrency: currency,
      sellAmount: "",
      sellUsdAmount: "",
      receiveAmount: "",
      receiveUsdAmount: "",
      quote: null,
    })
  },

  setReceiveCurrency: (currency) => set({ receiveCurrency: currency }),
  setWalletAddress: (address) => set({ walletAddress: address }),
  setError: (error) => set({ error }),

  // API Actions
  fetchCurrencies: async () => {
    const api = process.env.NEXT_PUBLIC_PROD_API
    const token = Cookies.get("token")

    if (!api || !token) {
      console.error("Missing API endpoint or token")
      return
    }

    set({ isLoadingCurrencies: true })

    try {
      const response = await axios.get(`${api}/api/fixfloat/trade/currencies`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.code === 0) {
        const currencies = response.data.data as Currency[]
        set({ currencies })

        if (currencies.length > 1) {
          const btc = currencies.find((c) => c.coin === "BTC")
          const eth = currencies.find((c) => c.coin === "ETH")

          set({
            sellCurrency: btc || currencies[0],
            receiveCurrency:
              eth ||
              currencies.find((c) => c.coin !== (btc?.coin || currencies[0].coin)) ||
              currencies[1],
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch currencies:", error)
    } finally {
      set({ isLoadingCurrencies: false })
    }
  },

  fetchQuote: async () => {
    const { sellCurrency, receiveCurrency, sellAmount, sellUsdAmount, quote: currentQuote } = get()
    const api = process.env.NEXT_PUBLIC_PROD_API
    const token = Cookies.get("token")

    if (!api || !token || !sellCurrency || !receiveCurrency) return

    let amountToUse: number | null = null

    if (sellAmount && !isNaN(Number(sellAmount)) && Number(sellAmount) > 0) {
      amountToUse = Number.parseFloat(sellAmount)
    } else if (sellUsdAmount && !isNaN(Number(sellUsdAmount)) && Number(sellUsdAmount) > 0) {
      if (
        currentQuote &&
        currentQuote.from.coin === sellCurrency.coin &&
        currentQuote.from.usd > 0
      ) {
        amountToUse =
          (Number.parseFloat(sellUsdAmount) / currentQuote.from.usd) *
          Number.parseFloat(currentQuote.from.amount)
      } else {
        amountToUse = 1 // seed quote
      }
    }

    if (!amountToUse || amountToUse <= 0) return

    set({ isLoadingQuote: true })

    try {
      const response = await axios.post(
        `${api}/api/fixfloat/trade/rate`,
        {
          fromCcy: sellCurrency.code,
          toCcy: receiveCurrency.code,
          amount: amountToUse,
          direction: "from",
          type: "float",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (response.data.code === 0) {
        const quoteData = response.data.data

        let newSellAmount = sellAmount
        let newSellUsdAmount = sellUsdAmount

        if (sellUsdAmount && Number.parseFloat(sellUsdAmount) > 0) {
          newSellAmount = (
            (Number.parseFloat(sellUsdAmount) / quoteData.from.usd) *
            Number.parseFloat(quoteData.from.amount)
          ).toFixed(8)
          newSellUsdAmount = sellUsdAmount
        } else {
          newSellUsdAmount = quoteData.from.usd.toFixed(2)
        }

        set({
          quote: quoteData,
          sellAmount: newSellAmount ?? "",
          sellUsdAmount: newSellUsdAmount ?? "",
          receiveAmount: quoteData.to.amount.toString(),
          receiveUsdAmount: quoteData.to.usd.toFixed(2),
        })
      }
    } catch (error) {
      console.error("Failed to fetch quote:", error)
    } finally {
      set({ isLoadingQuote: false })
    }
  },

  showQuote: (swapPrepData) => {
    set({
      swapData: swapPrepData,
      swapStep: "quote",
    })
  },

  initiateSwap: async () => {
    const { swapData, walletAddress } = get()

    if (!swapData || !walletAddress) {
      set({ error: "Missing swap data or wallet address" })
      return
    }

    if (!walletAddress.trim()) {
      set({ error: "Wallet address cannot be empty" })
      return
    }

    set({ isSwapping: true, error: null })

    try {
      const api = process.env.NEXT_PUBLIC_PROD_API
      const token = Cookies.get("token")

      const response = await axios.post(
        `${api}/api/fixfloat/trade/create-order`,
        {
          ...swapData,
          toAddress: walletAddress,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const swapResponseData = response.data

      if (swapResponseData.code === 0) {
        Cookies.set("swapResponseData", JSON.stringify(swapResponseData), {
          expires: 1 / 24,
        })

        set({
          swapData: swapResponseData,
          swapStep: "pending",
          error: null,
        })
      } else {
        set({
          error: swapResponseData.msg || "Invalid wallet address or swap parameters",
        })
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Swap failed. Please try again."
      set({ error: errorMessage })
    } finally {
      set({ isSwapping: false })
    }
  },

  backToSwap: () => {
    set({
      swapStep: "swap",
      swapData: null,
      walletAddress: "",
      error: null,
    })
    Cookies.remove("swapResponseData")
  },

  proceedWithWallet: async (walletAddress) => {
    set({ walletAddress })
  },
}))

// Restore from cookie
if (typeof window !== "undefined") {
  const savedSwapData = Cookies.get("swapResponseData")
  if (savedSwapData) {
    try {
      const parsedData = JSON.parse(savedSwapData)
      if (parsedData.code === 0) {
        useSwapStore.setState({
          swapData: parsedData,
          swapStep: "pending",
        })
      } else {
        Cookies.remove("swapResponseData")
      }
    } catch {
      Cookies.remove("swapResponseData")
    }
  }
}
