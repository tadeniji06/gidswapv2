"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowDown, ChevronDown, Loader2, Search, Zap, X } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { useFiatCryptoStore } from "@/lib/fiat-crypto-store"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog"

const NETWORK_LABELS: Record<string, { short: string; color: string }> = {
  "bnb-smart-chain":  { short: "BNB",  color: "from-yellow-400 to-yellow-600" },
  "ethereum":         { short: "ETH",  color: "from-blue-400 to-indigo-600" },
  "polygon":          { short: "POL",  color: "from-purple-400 to-purple-700" },
  "arbitrum-one":     { short: "ARB",  color: "from-sky-400 to-blue-600" },
  "base":             { short: "BASE", color: "from-blue-300 to-blue-500" },
  "tron":             { short: "TRX",  color: "from-red-400 to-red-600" },
}

function NetworkBadge({ network }: { network: string }) {
  const n = NETWORK_LABELS[network.toLowerCase()] ?? { short: network.toUpperCase().slice(0, 4), color: "from-gray-400 to-gray-600" }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest bg-gradient-to-r ${n.color} text-white`}>
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
          className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-primary/40 rounded-2xl px-4 py-2.5 transition-all shadow-lg active:scale-95 group"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : selectedToken ? (
            <>
              <img
                src={selectedToken.logo || "/placeholder.svg"}
                alt={selectedToken.symbol}
                className="w-6 h-6 rounded-full ring-2 ring-white/20"
              />
              <div className="text-left">
                <div className="text-white text-sm font-black leading-none">{selectedToken.symbol}</div>
                <NetworkBadge network={selectedToken.network} />
              </div>
            </>
          ) : (
            <span className="text-muted-foreground text-sm font-medium">Select</span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px] bg-[#0d0e12] border-white/10 p-0 overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] outline-none">
        <DialogHeader className="p-6 pb-2 border-b border-white/5">
          <DialogTitle className="text-xl font-black text-white flex items-center justify-between">
            Select Token
          </DialogTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text" placeholder="Search token..." value={search}
              onChange={(e) => setSearch(e.target.value)} autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-all shadow-inner"
            />
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((t) => {
              const isSelected = selectedToken?.symbol === t.symbol && selectedToken?.network === t.network
              return (
                <button
                  key={`${t.symbol}-${t.network}`}
                  onClick={() => { onSelect(t); setOpen(false); setSearch("") }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/5 rounded-2xl transition-all text-left group ${isSelected ? "bg-primary/20 border border-primary/20" : "border border-transparent"}`}
                >
                  <div className="relative">
                    <img src={t.logo || "/placeholder.svg"} alt={t.symbol} className="w-10 h-10 rounded-full ring-2 ring-white/5 shadow-xl group-hover:scale-105 transition-transform" />
                    {isSelected && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full border-2 border-[#0d0e12]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-black text-base tracking-tight">{t.symbol}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <NetworkBadge network={t.network} />
                      <span className="text-xs text-muted-foreground capitalize font-bold tracking-tight">{t.network.replace(/-/g, " ")}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex flex-col items-end gap-1">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-[10px] text-primary font-black uppercase tracking-tighter">Active</span>
                    </div>
                  )}
                </button>
              )
            })
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground/20" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">No results for "{search}"</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-white/5 border-t border-white/5">
          <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest">
            Always verify the network before sending funds
          </p>
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
    // Max 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(val) || val === "") {
      setFiatAmount(val)
    }
  }

  const isValid = Number(fiatAmount) > 0 && Number(tokenAmount) > 0 && selectedToken

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-panel neon-border rounded-3xl relative shadow-2xl overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8 space-y-3">
        {/* Header */}
        {/* <div className="mb-6">
          <h3 className="text-xl font-black tracking-tight text-white">On-Ramp</h3>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest mt-1">Fiat → Crypto</p>
        </div> */}

        {/* You Pay (Fiat) */}
        <div className="bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/5 focus-within:border-primary/50 transition-all duration-300 shadow-inner group/pay">
          <div className="flex justify-between items-center mb-3">
            <label className="text-muted-foreground text-xs font-black tracking-widest uppercase">You pay</label>
            {isLoadingCurrencies ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <div className="bg-primary/20 border border-primary/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="text-white text-xs font-black tracking-wider">
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
            className="w-full bg-transparent text-4xl font-black text-white outline-none h-12 tracking-tight placeholder:text-white/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {selectedCurrency && (
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2 opacity-60">
              Min: {selectedCurrency.symbol}500 · Max: {selectedCurrency.symbol}5,000,000
            </p>
          )}
        </div>

        {/* Arrow separator */}
        <div className="flex justify-center py-1 relative z-20">
          <div className="bg-background/80 backdrop-blur-xl p-2.5 rounded-full border border-white/10 shadow-lg hover:scale-110 hover:border-primary/50 transition-all cursor-pointer">
            <ArrowDown className="w-4 h-4 text-primary" />
          </div>
        </div>

        {/* You Receive (Crypto) */}
        <div className="bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-inner">
          <div className="flex justify-between items-center mb-3">
            <label className="text-muted-foreground text-xs font-black tracking-widest uppercase">You receive</label>
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
            className={`w-full bg-transparent text-4xl font-black outline-none h-12 tracking-tight placeholder:text-white/15 ${
              isLoadingQuote
                ? "text-transparent"
                : "text-emerald-400"
            }`}
          />
          {isLoadingQuote && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Calculating best rate...</span>
            </div>
          )}
        </div>

        {/* Quote info bar */}
        {quote && !isLoadingQuote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center justify-between px-4 py-3 bg-primary/5 border border-primary/20 rounded-2xl"
          >
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Rate</span>
            <span className="text-xs font-black text-white tabular-nums">
              1 {selectedToken?.symbol} = ₦{quote.rate.toLocaleString("en-NG", { maximumFractionDigits: 2 })}
            </span>
          </motion.div>
        )}

        {quoteError && (
          <div className="text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            {quoteError}
          </div>
        )}

        <Button
          onClick={onNext}
          disabled={!isValid || isLoadingQuote}
          className="w-full mt-4 futuristic-button bg-primary text-white py-7 text-base font-black rounded-2xl shadow-[0_0_20px_rgba(100,150,255,0.2)] disabled:opacity-40 disabled:shadow-none tracking-widest uppercase"
        >
          {isLoadingQuote ? "Calculating..." : "Continue →"}
        </Button>
      </div>
    </motion.div>
  )
}
