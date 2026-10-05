"use client"
import { Button } from "@/src/components/ui/button"
import { useEffect, useRef, useState } from "react"
import { ArrowDownUp, ChevronDown, Info, Settings, ChevronRight } from "lucide-react"
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
        if (isOpen) onToggle()
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onToggle])

  const filteredCurrencies = currencies.filter(
    (curr) =>
      curr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curr.coin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curr.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 bg-background border border-border hover:bg-muted/50 rounded-full px-3 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {currency ? (
          <>
            <img src={currency.logo || "/placeholder.svg"} alt={currency.coin} className="w-5 h-5 rounded-full" />
            <span className="text-sm font-semibold text-foreground">{currency.coin}</span>
          </>
        ) : (
          <span className="text-sm font-medium text-foreground">Select token</span>
        )}
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[280px] bg-card border border-border shadow-lg rounded-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-border">
            <input
              type="text"
              placeholder="Search by name or symbol"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background text-foreground placeholder:text-muted-foreground rounded-lg px-3 py-2 text-sm border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((curr) => (
                <button
                  key={curr.code}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                  onClick={() => {
                    onSelect?.(curr)
                    onToggle()
                    setSearchTerm("") 
                  }}
                >
                  <img src={curr.logo || "/placeholder.svg"} alt={curr.coin} className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-foreground font-medium text-sm truncate">{curr.name}</div>
                    <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider truncate">{curr.coin}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                No tokens found for "{searchTerm}"
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
    <div className="bg-muted/30 p-4 rounded-xl border border-transparent focus-within:border-primary/40 focus-within:bg-background transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground text-sm font-medium">{type === "from" ? "You Pay" : "You Receive"}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          value={currencyAmount ?? ""}
          onChange={(e) => onCurrencyAmountChange?.(sanitizeNumericInput(e.target.value))}
          readOnly={type === "to"}
          placeholder="0.00"
          className="w-full bg-transparent text-3xl font-semibold tracking-tight text-foreground placeholder:text-muted-foreground/50 border-none outline-none overflow-hidden"
        />
        <CurrencyDropdown
          currency={currency}
          currencies={currencies}
          onSelect={onCurrencySelect}
          isOpen={dropdownOpen}
          onToggle={onDropdownToggle}
        />
      </div>
      <div className="mt-1 h-5 flex items-center">
        {usdAmount && Number.parseFloat(usdAmount) > 0 && (
          <span className="text-muted-foreground text-sm">~${Number.parseFloat(usdAmount).toFixed(2)}</span>
        )}
      </div>
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
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [])

  const handleLocalSellChange = (val: string) => {
    const sanitized = sanitizeNumericInput(val)
    setLocalSellAmount(sanitized)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (sanitized === "") {
      setSellAmount("")
      setSellUsdAmount("")
      setReceiveAmount("")
      setReceiveUsdAmount("")
      return
    }
    debounceRef.current = window.setTimeout(() => {
      setSellAmount(sanitized)
      if (sellCurrency && receiveCurrency) fetchQuote()
    }, 1000) 
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

  const switchCurrencies = () => {
    const tempCurr = sellCurrency
    setSellCurrency(receiveCurrency)
    setReceiveCurrency(tempCurr)
    setSellAmount(receiveAmount)
    setLocalSellAmount(receiveAmount || "")
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
      <div className="w-full max-w-[480px] mx-auto">
        <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-muted-foreground font-medium">Loading assets...</span>
        </div>
      </div>
    )
  }

  const sellAmountNum = Number.parseFloat(sellAmount || "0")
  const isAmountTooLow = quote && sellAmount && sellAmountNum < quote.from.min
  const isAmountTooHigh = quote && sellAmount && sellAmountNum > quote.from.max
  const hasValidationError = !!(isAmountTooLow || isAmountTooHigh)
  const isFormValid = !!localSellAmount && Number(localSellAmount) > 0 && !!sellCurrency && !!receiveCurrency && !!quote && !hasValidationError

  return (
    <div className="w-full max-w-[460px] mx-auto">
      <div className="bg-card rounded-2xl p-1">
        <div className="flex items-center justify-between px-3 pt-3 pb-4 border-b border-border mb-4">
          <h2 className="text-foreground font-semibold text-lg">Swap</h2>
          <button className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted/50 rounded-full">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 relative px-2">
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

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <button
              onClick={switchCurrencies}
              className="bg-card border-4 border-card text-muted-foreground p-1.5 rounded-xl hover:text-foreground hover:bg-muted/50 transition-colors shadow-sm"
            >
              <ArrowDownUp className="w-5 h-5" />
            </button>
          </div>

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

        {hasValidationError && (
          <div className="px-3 mt-4">
            <div className="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-sm rounded-lg p-3 flex items-start gap-2 border border-red-200 dark:border-red-500/20">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                {isAmountTooLow && <p>Minimum amount is {quote.from.min} {quote.from.coin}</p>}
                {isAmountTooHigh && <p>Maximum amount is {quote.from.max} {quote.from.coin}</p>}
              </div>
            </div>
          </div>
        )}

        {quote && !hasValidationError && (
          <div className="px-3 mt-4">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <span className="font-medium">1 {quote.from.coin} = {quote.from.rate.toFixed(4)} {quote.to.coin}</span>
              <div className="flex items-center gap-1">
                <span>Fee: {quote.fee || "Free"}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${showDetails ? "rotate-90" : ""}`} />
              </div>
            </button>
            
            {showDetails && (
              <div className="mt-2 p-3 bg-muted/30 rounded-xl space-y-2 text-sm border border-border">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Network</span>
                  <span className="text-foreground">{quote.to.network}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Minimum Received</span>
                  <span className="text-foreground">{quote.to.amount} {quote.to.coin}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Estimated Time</span>
                  <span className="text-foreground">~2 minutes</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="px-2 pt-4 pb-2">
          <Button
            className="w-full fintech-button-primary py-6 text-lg"
            onClick={handleSwap}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? "Processing..." : !localSellAmount ? "Enter an amount" : !isFormValid ? "Invalid swap" : "Review Swap"}
          </Button>
        </div>
      </div>
    </div>
  )
}
