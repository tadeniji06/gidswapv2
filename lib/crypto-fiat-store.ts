import { create } from "zustand"
import axios from "axios"
import Cookies from "js-cookie"

export interface Token {
  symbol: string
  contractAddress: string
  decimals: number
  baseCurrency: string
  network: string
  logo: string
}

export interface FiatCurrency {
  name: string
  code: string
  symbol: string
  shortName: string
  decimals: number
  marketRate: number
}

export interface Quote {
  rate: number
  total: number
  tokenSymbol: string
  currencyCode: string
}

export interface OrderRecipient {
  institution: string
  accountIdentifier: string
  accountName: string
  memo: string
  currency: string
  metadata?: Record<string, any>
}

export interface OrderData {
  amount: number
  token: string
  rate: number
  network: string
  recipient: OrderRecipient
  reference: string
  returnAddress: string
}

export interface PaymentOrder {
  id: string
  reference: string
  amount: string
  token: string
  network: string
  receiveAddress: string
  senderFee: string
  transactionFee: string
  validUntil: string
}

interface CryptoFiatState {
  tokens: Token[]
  currencies: FiatCurrency[]
  isLoadingTokens: boolean
  isLoadingCurrencies: boolean

  selectedToken: Token | null
  selectedCurrency: FiatCurrency | null

  tokenAmount: string
  fiatAmount: string

  quote: Quote | null
  isLoadingQuote: boolean

  orderData: OrderData | null
  isInitializingOrder: boolean
  orderReference: string | null
  paymentOrder: PaymentOrder | null

  fetchTokens: () => Promise<void>
  fetchCurrencies: () => Promise<void>
  fetchQuote: (tokenSymbol: string, amount: string, currency: string) => Promise<void>
  setSelectedToken: (token: Token | null) => void
  setSelectedCurrency: (currency: FiatCurrency | null) => void
  setTokenAmount: (amount: string) => void
  setFiatAmount: (amount: string) => void
  resetState: () => void

  initializeOrder: (memo: string, returnAddress: string, bankData: any) => Promise<boolean>
  generateReference: () => string
}

const useCryptoFiatStore = create<CryptoFiatState>((set, get) => ({
  tokens: [],
  currencies: [],
  isLoadingTokens: false,
  isLoadingCurrencies: false,
  selectedToken: null,
  selectedCurrency: null,
  tokenAmount: "",
  fiatAmount: "",
  quote: null,
  isLoadingQuote: false,

  orderData: null,
  isInitializingOrder: false,
  orderReference: null,
  paymentOrder: null,

  // ✅ Fetch tokens with filtering + sorting
  fetchTokens: async () => {
    set({ isLoadingTokens: true })
    try {
      const authToken = Cookies.get("token")
      const api_url = process.env.NEXT_PUBLIC_PROD_API
      const response = await axios.get(`${api_url}/api/payCrest/trade/getSupportedTokens`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const tokensData = response.data.data || []

      // Allowed symbol + network pairs (sorted order)
      const allowedTokens = [
        { symbol: "USDT", network: "bnb-smart-chain" },
        { symbol: "USDC", network: "bnb-smart-chain" },
        { symbol: "USDT", network: "polygon" },
        { symbol: "USDC", network: "polygon" },
        { symbol: "USDT", network: "arbitrum-one" },
        { symbol: "USDT", network: "base" },
        { symbol: "USDC", network: "base" },
      ]

      // Filter only allowed tokens
      const filteredTokens = tokensData.filter((token: any) =>
        allowedTokens.some(
          (allowed) =>
            token.symbol.toUpperCase() === allowed.symbol &&
            token.network.toLowerCase() === allowed.network.toLowerCase()
        )
      )

      // ✅ Sort according to allowedTokens order
      const sortedTokens = allowedTokens
        .map((allowed) =>
          filteredTokens.find(
            (token: { symbol: string; network: string }) =>
              token.symbol.toUpperCase() === allowed.symbol &&
              token.network.toLowerCase() === allowed.network.toLowerCase()
          )
        )
        .filter(Boolean) // remove any undefined if API missed one

      // Add logos
      const tokensWithLogos = sortedTokens.map((token: any) => ({
        symbol: token.symbol,
        contractAddress: token.contractAddress,
        decimals: token.decimals,
        baseCurrency: token.baseCurrency,
        network: token.network,
        logo: `https://api.elbstream.com/logos/crypto/${token.symbol.toLowerCase()}`,
      }))

      set({ tokens: tokensWithLogos })
    } catch (error) {
      console.error("Failed to fetch tokens:", error)
      set({
        tokens: [
          {
            symbol: "USDT",
            contractAddress: "0x...",
            decimals: 6,
            baseCurrency: "USD",
            network: "bnb-smart-chain",
            logo: "https://api.elbstream.com/logos/crypto/usdt",
          },
        ],
      })
    } finally {
      set({ isLoadingTokens: false })
    }
  },

  // ✅ Fetch currencies (still only NGN)
  fetchCurrencies: async () => {
    set({ isLoadingCurrencies: true })
    try {
      const authToken = Cookies.get("token")
      const api_url = process.env.NEXT_PUBLIC_PROD_API
      const response = await axios.get(`${api_url}/api/payCrest/trade/getSupportedCies`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      const currenciesData = response.data.data || []
      const currencies = currenciesData
        .filter((currency: any) => currency.code === "NGN")
        .map((currency: any) => ({
          name: currency.name,
          code: currency.code,
          symbol: currency.symbol,
          shortName: currency.shortName,
          decimals: currency.decimals,
          marketRate: Number.parseFloat(currency.marketRate),
        }))

      set({ currencies })
    } catch (error) {
      console.error("Failed to fetch currencies:", error)
      set({
        currencies: [
          {
            name: "Nigerian Naira",
            code: "NGN",
            symbol: "₦",
            shortName: "Naira",
            decimals: 2,
            marketRate: 1600,
          },
        ],
      })
    } finally {
      set({ isLoadingCurrencies: false })
    }
  },

  // Fetch quote
  fetchQuote: async (tokenSymbol: string, amount: string, currency: string) => {
    if (!tokenSymbol || !amount || !currency || Number.parseFloat(amount) <= 0) return
    set({ isLoadingQuote: true })
    try {
      const authToken = Cookies.get("token")
      const api_url = process.env.NEXT_PUBLIC_PROD_API
      const response = await axios.get(
        `${api_url}/api/payCrest/trade/tokenRates/${tokenSymbol}/${amount}/${currency}`,
        { headers: { Authorization: `Bearer ${authToken}` } },
      )
      const quoteData = response.data

      if (quoteData.status === "success") {
        const ratePerUnit = Number.parseFloat(quoteData.data)
        const amountNum = Number.parseFloat(amount)
        const total = amountNum * ratePerUnit

        const quote: Quote = {
          rate: ratePerUnit,
          total,
          tokenSymbol,
          currencyCode: currency,
        }

        set({ quote, fiatAmount: total.toFixed(2) })
        Cookies.set("crypto-fiat-quote", JSON.stringify(quote), { expires: 1 / 24 })
      }
    } catch (error) {
      console.error("Failed to fetch quote:", error)
      set({ quote: null })
    } finally {
      set({ isLoadingQuote: false })
    }
  },

  setSelectedToken: (token) => {
    set({ selectedToken: token })
    Cookies.set("selected-token", JSON.stringify(token), { expires: 7 })

    const { selectedCurrency, tokenAmount } = get()
    if (token && selectedCurrency && tokenAmount) {
      get().fetchQuote(token.symbol, tokenAmount, selectedCurrency.code)
    }
  },

  setSelectedCurrency: (currency) => {
    set({ selectedCurrency: currency })
    Cookies.set("selected-currency", JSON.stringify(currency), { expires: 7 })

    const { selectedToken, tokenAmount } = get()
    if (selectedToken && currency && tokenAmount) {
      get().fetchQuote(selectedToken.symbol, tokenAmount, currency.code)
    }
  },

  setTokenAmount: (amount) => {
    set({ tokenAmount: amount })
    const { selectedToken, selectedCurrency } = get()
    if (selectedToken && selectedCurrency && amount) {
      get().fetchQuote(selectedToken.symbol, amount, selectedCurrency.code)
    }
  },

  setFiatAmount: (amount) => {
    set({ fiatAmount: amount })
  },

  initializeOrder: async (memo: string, returnAddress: string, bankData: any) => {
    const { selectedToken, selectedCurrency, tokenAmount, quote } = get()
    if (!selectedToken || !selectedCurrency || !tokenAmount || !quote || !bankData) {
      console.error("Missing required data for order initialization")
      return false
    }
    set({ isInitializingOrder: true })
    try {
      const reference = get().generateReference()
      const orderData: OrderData = {
        amount: Number.parseFloat(tokenAmount),
        token: selectedToken.symbol,
        rate: quote.rate,
        network: selectedToken.network.toLowerCase().replace(/\s+/g, "-"),
        recipient: {
          institution: bankData.institution,
          accountIdentifier: bankData.accountIdentifier,
          accountName: bankData.accountName,
          memo,
          currency: selectedCurrency.code,
          metadata: {},
        },
        reference,
        returnAddress,
      }

      const authToken = Cookies.get("token")
      const api_url = process.env.NEXT_PUBLIC_PROD_API
      const response = await axios.post(`${api_url}/api/payCrest/trade/init-order`, orderData, {
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      })

      if (response.data.status === "success") {
        const paymentOrder: PaymentOrder = response.data.data
        set({ orderData, orderReference: reference, paymentOrder })
        Cookies.set("order-data", JSON.stringify(orderData), { expires: 1 / 24 })
        Cookies.set("order-reference", reference, { expires: 1 / 24 })
        Cookies.set("payment-order", JSON.stringify(paymentOrder), { expires: 1 / 24 })
        return true
      } else {
        console.error("Order initialization failed:", response.data.message)
        return false
      }
    } catch (error) {
      console.error("Failed to initialize order:", error)
      return false
    } finally {
      set({ isInitializingOrder: false })
    }
  },

  generateReference: () => {
    const timestamp = Date.now().toString(36)
    const randomStr = Math.random().toString(36).substring(2, 8)
    return `CF${timestamp}${randomStr}`.toUpperCase()
  },

  resetState: () => {
    set({
      selectedToken: null,
      selectedCurrency: null,
      tokenAmount: "",
      fiatAmount: "",
      quote: null,
      orderData: null,
      orderReference: null,
      paymentOrder: null,
    })
    Cookies.remove("selected-token")
    Cookies.remove("selected-currency")
    Cookies.remove("crypto-fiat-quote")
    Cookies.remove("order-data")
    Cookies.remove("order-reference")
    Cookies.remove("payment-order")
  },
}))

export { useCryptoFiatStore }
