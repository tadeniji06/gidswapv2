"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowDown, ChevronDown, Loader2, Search, Info, ChevronRight } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { useFiatCryptoStore } from "@/lib/fiat-crypto-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog"

const NETWORK_LABELS: Record<string, { short: string; color: string }> = {
  "bnb-smart-chain":  { short: "BNB",  color: "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-500/10" },
  "ethereum":         { short: "ETH",  color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10" },
  "polygon":          { short: "POL",  color: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-500/10" },
  "arbitrum-one":     { short: "ARB",  color: "text-sky-600 bg-sky-100 dark:text-sky-400 dark:bg-sky-500/10" },
  "base":             { short: "BASE", color: "text-blue-500 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/10" },
  "tron":             { short: "TRX",  color: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/10" },
}

function NetworkBadge({ network }: { network: string }) {
  const n = NETWORK_LABELS[network.toLowerCase()] ?? { short: network.toUpperCase().slice(0, 4), color: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-500/10" }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest ${n.color}`}>
      {n.short}
    </span>
  )
}

function TokenSelector({
  tokens,
  selectedToken,
  onSelect,
  isLoading,
}: {
  tokens: any[]
  selectedToken: any
  onSelect: (t: any) => void
  isLoading: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = tokens.filter(
    (t) =>
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.network.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          disabled={isLoading}
          className="flex items-center gap-2 bg-background hover:bg-muted/50 border border-border rounded-full px-3 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : selectedToken ? (
            <>
              <img
                src={selectedToken.logo || "/placeholder.svg"}
                alt={selectedToken.symbol}
                className="w-5 h-5 rounded-full"
              />
              <span className="text-foreground text-sm font-semibold">{selectedToken.symbol}</span>
            </>
          ) : (
            <span className="text-foreground text-sm font-medium">Select</span>
          )}
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px] bg-card border-border p-0 overflow-hidden rounded-2xl shadow-lg">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold text-foreground">Select Token</DialogTitle>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text" placeholder="Search token..." value={search}
              onChange={(e) => setSearch(e.target.value)} autoFocus
              className="w-full bg-background border border-input rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>
        </DialogHeader>

        <div className="max-h-[50vh] overflow-y-auto custom-scrollbar p-2">
          {filtered.length > 0 ? (
            filtered.map((t) => {
              const isSelected = selectedToken?.symbol === t.symbol && selectedToken?.network === t.network
              return (
                <button
                  key={`${t.symbol}-${t.network}`}
                  onClick={() => { onSelect(t); setOpen(false); setSearch("") }}
                  className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-muted/50 rounded-xl transition-colors text-left ${isSelected ? "bg-primary/5" : ""}`}
                >
                  <img src={t.logo || "/placeholder.svg"} alt={t.symbol} className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-foreground font-medium text-sm">{t.symbol}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground capitalize font-medium">{t.network.replace(/-/g, " ")}</span>
                    </div>
                  </div>
                  <NetworkBadge network={t.network} />
                </button>
              )
            })
          ) : (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No results for "{search}"
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function FiatCryptoCard({ onNext }: { onNext: () => void }) {
  const {
    fiatAmount,
    setFiatAmount,
    tokenAmount,
    selectedToken,
    setSelectedToken,
    selectedCurrency,
    setSelectedCurrency,
    tokens,
    currencies,
    isLoadingTokens,
    isLoadingCurrencies,
    isLoadingQuote,
    quoteError,
    fetchTokens,
    fetchCurrencies,
    quote,
  } = useFiatCryptoStore()

  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (tokens.length === 0) fetchTokens()
    if (currencies.length === 0) fetchCurrencies()
  }, [])

  useEffect(() => {
    if (!selectedToken && tokens.length > 0) setSelectedToken(tokens[0])
    if (!selectedCurrency && currencies.length > 0) setSelectedCurrency(currencies[0])
  }, [tokens, currencies])

  const handleFiatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (/^\d*\.?\d{0,2}$/.test(val) || val === "") {
      setFiatAmount(val)
    }
  }

  const isValid = Number(fiatAmount) >= 500 && Number(tokenAmount) > 0 && selectedToken

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-2xl shadow-sm p-1"
    >
      <div className="p-4 space-y-2">
        {/* You Pay (Fiat) */}
        <div className="bg-muted/30 p-4 rounded-xl border border-transparent focus-within:border-primary/40 focus-within:bg-background transition-colors">
          <div className="flex justify-between items-center mb-2">
            <label className="text-muted-foreground text-sm font-medium">You Pay</label>
            {isLoadingCurrencies ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <div className="bg-background border border-border px-3 py-1.5 rounded-full flex items-center">
                <span className="text-foreground text-sm font-semibold">
                  {selectedCurrency?.symbol} {selectedCurrency?.code ?? "NGN"}
                </span>
              </div>
            )}
          </div>
          <input
            type="number"
            inputMode="decimal"
            value={fiatAmount}
            onChange={handleFiatChange}
            placeholder="0.00"
            className="w-full bg-transparent text-3xl font-semibold tracking-tight text-foreground placeholder:text-muted-foreground/50 border-none outline-none overflow-hidden"
          />
          {selectedCurrency && (
            <div className="h-5 flex items-center mt-1">
              {fiatAmount && Number(fiatAmount) < 500 ? (
                 <p className="text-xs font-medium text-red-500">Min: {selectedCurrency.symbol}500</p>
              ) : null}
            </div>
          )}
        </div>

        {/* Arrow separator */}
        <div className="flex justify-center -my-3 relative z-10">
          <div className="bg-card border border-border p-1.5 rounded-full shadow-sm text-muted-foreground">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* You Receive (Crypto) */}
        <div className="bg-muted/30 p-4 rounded-xl border border-transparent transition-colors">
          <div className="flex justify-between items-center mb-2">
            <label className="text-muted-foreground text-sm font-medium">You Receive</label>
            <TokenSelector
              tokens={tokens}
              selectedToken={selectedToken}
              onSelect={setSelectedToken}
              isLoading={isLoadingTokens}
            />
          </div>
          <input
            type="text"
            readOnly
            value={isLoadingQuote ? "" : (tokenAmount || "0.00")}
            placeholder="0.00"
            className={`w-full bg-transparent text-3xl font-semibold tracking-tight border-none outline-none overflow-hidden ${
              isLoadingQuote ? "text-transparent" : "text-foreground"
            }`}
          />
          <div className="h-5 flex items-center mt-1">
            {isLoadingQuote && (
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Calculating rate...
              </span>
            )}
          </div>
        </div>

        {quoteError && (
          <div className="mt-4 px-2">
            <div className="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-sm rounded-lg p-3 flex items-start gap-2 border border-red-200 dark:border-red-500/20">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{quoteError}</p>
            </div>
          </div>
        )}

        {quote && !isLoadingQuote && !quoteError && (
          <div className="mt-4 px-2">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <span className="font-medium">1 {selectedToken?.symbol} = ₦{quote.rate.toLocaleString("en-NG", { maximumFractionDigits: 2 })}</span>
              <div className="flex items-center gap-1">
                <span>Fee: {quote.fee || "Free"}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${showDetails ? "rotate-90" : ""}`} />
              </div>
            </button>
            
            {showDetails && (
              <div className="mt-2 p-3 bg-muted/30 rounded-xl space-y-2 text-sm border border-border">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Network</span>
                  <span className="text-foreground uppercase text-xs font-semibold">{selectedToken?.network.replace(/-/g, " ")}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Estimated Time</span>
                  <span className="text-foreground">~5 minutes</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-4 pb-2 px-2">
          <Button
            onClick={onNext}
            disabled={!isValid || isLoadingQuote}
            className="w-full fintech-button-primary py-6 text-lg"
          >
            {isLoadingQuote ? "Calculating..." : "Review Purchase"}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
