"use client"
import { Button } from "@/src/components/ui/button"
import { useEffect, useRef, useState } from "react"

import { ArrowUpDown, ChevronDown, Info } from "lucide-react"
import { useSwapStore } from "@/lib/swap-store"

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

interface SwapCardProps {
  onSwap: (swapData: any) => void
  isLoading?: boolean
}

/** only allow "", numbers, and one "." */
function sanitizeNumericInput(value: string): string {
  if (value === "") return ""
  if (/^\d*\.?\d*$/.test(value)) return value
  return value.slice(0, -1)
}

function CurrencyDropdown({
  currency,
  currencies,
  onSelect,
  isOpen,
  onToggle,
}: {
  currency: Currency | null
  currencies: Currency[]
  onSelect?: (currency: Currency) => void
  isOpen: boolean
  onToggle: () => void
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) {
          onToggle()
        }
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onToggle])

  const filteredCurrencies = currencies.filter(
    (curr) =>
      curr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curr.coin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curr.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        className="bg-accent hover:bg-accent/80 text-foreground rounded-full px-4 py-2 flex items-center gap-2"
        onClick={onToggle}
      >
        {currency ? (
          <>
            <img src={currency.logo || "/placeholder.svg"} alt={currency.coin} className="w-5 h-5 rounded-full" />
            <span className="text-sm">{currency.coin}</span>
          </>
        ) : (
          <span className="text-sm">Select</span>
        )}
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 sm:w-64 max-w-[calc(100vw-2rem)] bg-card rounded-xl border border-border shadow-lg z-50 max-h-60 overflow-hidden">
          <div className="p-3 border-b border-border">
            <input
              type="text"
              placeholder="Search currencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-accent text-foreground placeholder-muted-foreground rounded-lg px-3 py-2 text-sm border-none outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((curr) => (
                <button
                  key={curr.code}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent text-left"
                  onClick={() => {
                    onSelect?.(curr)
                    onToggle()
                    setSearchTerm("") // Clear search when currency is selected
                  }}
                >
                  <img src={curr.logo || "/placeholder.svg"} alt={curr.coin} className="w-6 h-6 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="text-foreground font-medium truncate">{curr.coin}</div>
                    <div className="text-muted-foreground text-sm truncate">{curr.name}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                No currencies found for "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SwapSection({
  type,
  usdAmount,
  currencyAmount,
  currency,
  currencies,
  onCurrencyAmountChange,
  onCurrencySelect,
  dropdownOpen,
  onDropdownToggle,
}: {
  type: "from" | "to"
  usdAmount: string
  currencyAmount?: string
  currency: Currency | null
  currencies: Currency[]
  onCurrencyAmountChange?: (value: string) => void
  onCurrencySelect?: (currency: Currency) => void
  dropdownOpen: boolean
  onDropdownToggle: () => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground text-base font-medium capitalize">{type}</span>
        <CurrencyDropdown
          currency={currency}
          currencies={currencies}
          onSelect={onCurrencySelect}
          isOpen={dropdownOpen}
          onToggle={onDropdownToggle}
        />
      </div>
      <div className="relative">
        <input
          type="text"
          value={currencyAmount ?? ""}
          onChange={(e) => onCurrencyAmountChange?.(sanitizeNumericInput(e.target.value))}
          readOnly={type === "to"}
          placeholder="0.00"
          className="w-full bg-transparent text-2xl md:text-3xl font-bold mb-2 text-foreground placeholder-muted-foreground border-none outline-none"
        />
      </div>
      {usdAmount && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-semibold">≈ ${Number.parseFloat(usdAmount).toFixed(2)}</span>
        </div>
      )}
    </div>
  )
}

export function SwapCard({ onSwap, isLoading }: SwapCardProps) {
  const {
    sellAmount,
    receiveAmount,
    sellUsdAmount,
    receiveUsdAmount,
    currencies,
    sellCurrency,
    receiveCurrency,
    quote,
    isLoadingCurrencies,
    setSellAmount,
    setReceiveAmount,
    setReceiveUsdAmount,
    setSellUsdAmount,
    setSellCurrency,
    setReceiveCurrency,
    fetchQuote,
    showQuote,
  } = useSwapStore()

  const [localSellAmount, setLocalSellAmount] = useState<string>(sellAmount || "")
  const debounceRef = useRef<number | null>(null)
  const [sellDropdownOpen, setSellDropdownOpen] = useState(false)
  const [receiveDropdownOpen, setReceiveDropdownOpen] = useState(false)

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current)
      }
    }
  }, [])



const handleLocalSellChange = (val: string) => {
  const sanitized = sanitizeNumericInput(val)
  setLocalSellAmount(sanitized)

  if (debounceRef.current) clearTimeout(debounceRef.current)

  // If input is empty, just clear store and stop
  if (sanitized === "") {
  setSellAmount("")
  setSellUsdAmount("")
  setReceiveAmount("")
  setReceiveUsdAmount("")
  return
}


  debounceRef.current = window.setTimeout(() => {
    // push only stable valid value
    setSellAmount(sanitized)
    if (sellCurrency && receiveCurrency) {
      fetchQuote()
    }
  }, 600)
}


useEffect(() => {
  if (!quote) return
  setSellUsdAmount(quote.from.usd.toFixed(4))
  setReceiveUsdAmount(quote.to.usd.toFixed(4))
  setReceiveAmount(quote.to.amount.toString())
}, [quote, setSellUsdAmount, setReceiveUsdAmount, setReceiveAmount])


  const handleSellCurrencySelect = (currency: Currency) => {
    setSellCurrency(currency)
    setReceiveAmount("")
    setReceiveUsdAmount("")
  }

  const handleReceiveCurrencySelect = (currency: Currency) => {
    setReceiveCurrency(currency)
    if (localSellAmount && Number(localSellAmount) > 0) {
      setSellAmount(localSellAmount)
      fetchQuote()
    } else {
      setReceiveAmount("")
      setReceiveUsdAmount("")
    }
  }

  const handleSwap = async () => {
    if (!sellCurrency || !receiveCurrency) return
    const localVal = localSellAmount.trim()
    if (!localVal || Number(localVal) <= 0) return

    if (sellAmount !== localVal) {
      setSellAmount(localVal)
      await fetchQuote()
    } else if (!quote) {
      await fetchQuote()
    }

    const state = (useSwapStore as any).getState()
    if (!state.quote) return

    const swapData = {
      fromCcy: state.sellCurrency!.code,
      toCcy: state.receiveCurrency!.code,
      amount: Number.parseFloat(state.sellAmount || "0"),
      direction: "from",
      type: "float",
      quote: state.quote,
      sellCurrency: state.sellCurrency,
      receiveCurrency: state.receiveCurrency,
    }
    showQuote(swapData)
  }

  if (isLoadingCurrencies) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card rounded-2xl p-6 text-center">
          <span className="text-muted-foreground">Loading currencies...</span>
        </div>
      </div>
    )
  }

  const sellAmountNum = Number.parseFloat(sellAmount || "0")
  const isAmountTooLow = quote && sellAmount && sellAmountNum < quote.from.min
  const isAmountTooHigh = quote && sellAmount && sellAmountNum > quote.from.max
  const hasValidationError = !!(isAmountTooLow || isAmountTooHigh)

  const isFormValid =
    !!localSellAmount &&
    Number(localSellAmount) > 0 &&
    !!sellCurrency &&
    !!receiveCurrency &&
    !!quote &&
    !hasValidationError

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-2xl p-6 mb-6">
        <div className="mb-4">
          <SwapSection
            type="from"
            usdAmount={sellUsdAmount}
            currencyAmount={localSellAmount}
            currency={sellCurrency}
            currencies={currencies}
            onCurrencyAmountChange={handleLocalSellChange}
            onCurrencySelect={handleSellCurrencySelect}
            dropdownOpen={sellDropdownOpen}
            onDropdownToggle={() => {
              setSellDropdownOpen(!sellDropdownOpen)
              setReceiveDropdownOpen(false)
            }}
          />
          {hasValidationError && (
            <div className="mt-2 text-sm text-destructive">
              {isAmountTooLow && (
                <span>
                  Amount too low. Minimum: {quote.from.min} {quote.from.coin}
                </span>
              )}
              {isAmountTooHigh && (
                <span>
                  Amount too high. Maximum: {quote.from.max} {quote.from.coin}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center my-4">
          <Button variant="ghost" size="sm" className="bg-accent hover:bg-accent/80 rounded-full p-2">
            <ArrowUpDown className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>

        <div>
          <SwapSection
            type="to"
            usdAmount={receiveUsdAmount}
            currencyAmount={receiveAmount}
            currency={receiveCurrency}
            currencies={currencies}
            onCurrencyAmountChange={() => {}}
            onCurrencySelect={handleReceiveCurrencySelect}
            dropdownOpen={receiveDropdownOpen}
            onDropdownToggle={() => {
              setReceiveDropdownOpen(!receiveDropdownOpen)
              setSellDropdownOpen(false)
            }}
          />
        </div>
      </div>

      {quote && (
        <div className="bg-card rounded-xl p-4 mb-4 text-sm text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span className="font-semibold text-primary">Minimum</span>
            <span className="text-foreground">
              {quote.from.min} {quote.from.coin}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-semibold text-primary">Maximum</span>
            <span className="text-foreground">
              {quote.from.max} {quote.from.coin}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-semibold text-primary">Network</span>
            <span className="text-foreground">{quote.to.network}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-semibold text-primary">Rate</span>
            <span className="text-foreground">
              1 {quote.from.coin} ≈ {quote.from.rate.toFixed(4)} {quote.to.coin}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground text-sm">{quote.fee}</span>
          </div>
        </div>
      )}

      <Button
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSwap}
        disabled={!isFormValid || isLoading}
      >
        {isLoading ? "Processing..." : "Swap"}
      </Button>
    </div>
  )
}
