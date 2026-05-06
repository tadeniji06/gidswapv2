"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowDown, ChevronDown, Search, Zap, Loader2, Info, Sparkles } from "lucide-react"
import { useOnrampStore } from "@/lib/onramp-store"
import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog"

const supportedCryptos = [
  { symbol: "BNB", name: "Binance Coin", network: "BSC", logo: "/placeholder.svg" },
  { symbol: "MATIC", name: "Polygon", network: "MATIC", logo: "/placeholder.svg" },
  { symbol: "USDT", name: "Tether (TRC20)", network: "TRX", logo: "/images/usdt.png" },
  { symbol: "BTC", name: "Bitcoin", network: "BTC", logo: "/images/bitcoin.png" },
  { symbol: "ETH", name: "Ethereum", network: "ETH", logo: "/images/ethereum.png" },
  { symbol: "SOL", name: "Solana", network: "SOL", logo: "/placeholder.svg" },
]

function NetworkBadge({ network }: { network: string }) {
  const colors: Record<string, string> = {
    "BTC": "from-orange-400 to-orange-600",
    "ETH": "from-blue-400 to-indigo-600",
    "TRX": "from-red-400 to-red-600",
    "BSC": "from-yellow-400 to-yellow-600",
    "SOL": "from-purple-400 to-purple-600",
    "MATIC": "from-purple-500 to-indigo-700",
  }
  const color = colors[network] ?? "from-gray-400 to-gray-600"
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest bg-gradient-to-r ${color} text-white`}>
      {network}
    </span>
  )
}

function CryptoSelector({
  cryptos,
  selected,
  onSelect,
}: {
  cryptos: typeof supportedCryptos
  selected: typeof supportedCryptos[0]
  onSelect: (c: typeof supportedCryptos[0]) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = cryptos.filter(c => 
    c.symbol.toLowerCase().includes(search.toLowerCase()) || 
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-primary/40 rounded-2xl px-3 py-2 transition-all group active:scale-95 shadow-lg"
        >
          <img src={selected.logo} alt={selected.symbol} className="w-5 h-5 rounded-full ring-2 ring-white/10" />
          <div className="text-left">
            <div className="text-white text-xs font-black leading-none">{selected.symbol}</div>
            <NetworkBadge network={selected.network} />
          </div>
          <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px] bg-[#0d0e12] border-white/10 p-0 overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] outline-none">
        <DialogHeader className="p-6 pb-2 border-b border-white/5">
          <DialogTitle className="text-xl font-black text-white">Select Token</DialogTitle>
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
            filtered.map((c) => {
              const isSel = selected.symbol === c.symbol
              return (
                <button
                  key={c.symbol}
                  onClick={() => { onSelect(c); setOpen(false); setSearch("") }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/5 rounded-2xl transition-all text-left group ${isSel ? "bg-primary/20 border border-primary/20" : "border border-transparent"}`}
                >
                  <div className="relative">
                    <img src={c.logo} alt={c.symbol} className="w-10 h-10 rounded-full ring-2 ring-white/5 shadow-xl group-hover:scale-105 transition-transform" />
                    {isSel && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full border-2 border-[#0d0e12]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-black text-base tracking-tight">{c.symbol}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <NetworkBadge network={c.network} />
                      <span className="text-xs text-muted-foreground capitalize font-bold tracking-tight">{c.name}</span>
                    </div>
                  </div>
                  {isSel && <Zap className="w-4 h-4 text-primary" />}
                </button>
              )
            })
          ) : (
            <div className="py-12 text-center text-muted-foreground text-sm font-medium">No results found</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function OnrampQuoteCard({ onNext }: { onNext: () => void }) {
  const { fromCurrency, fromNetwork, fromAmount, rateData, isFetchingRate, setField, fetchRate } = useOnrampStore()

  const selectedCrypto = supportedCryptos.find(c => c.symbol === fromCurrency) || supportedCryptos[0]
  const isValid = parseFloat(fromAmount) > 0 && rateData?.to?.estimatedAmount

  const handleAmountChange = (val: string) => {
    // Max 8 decimals for crypto usually, but let's keep it simple
    if (/^\d*\.?\d*$/.test(val) || val === "") {
      setField("fromAmount", val)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="glass-panel neon-border rounded-3xl relative shadow-2xl overflow-hidden"
    >
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8 space-y-4">
        {/* Send (Crypto) */}
        <div className="bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/5 focus-within:border-primary/50 transition-all shadow-inner">
          <div className="flex justify-between items-center mb-3">
            <label className="text-muted-foreground text-xs font-black tracking-widest uppercase">Send Crypto</label>
            <CryptoSelector
              cryptos={supportedCryptos}
              selected={selectedCrypto}
              onSelect={(c) => {
                setField("fromCurrency", c.symbol)
                setField("fromNetwork", c.network)
                setTimeout(fetchRate, 100)
              }}
            />
          </div>
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            onBlur={() => fetchRate()}
            placeholder="0.00"
            className="w-full bg-transparent text-4xl font-black text-white outline-none h-12 tracking-tight placeholder:text-white/15"
          />
          <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
            <span>Min: {rateData?.ffMinAmount || 0} {selectedCrypto.symbol}</span>
            <span>·</span>
            <span>Max: {rateData?.ffMaxAmount || "∞"}</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center py-1">
          <div className="bg-background/80 backdrop-blur-xl p-2.5 rounded-full border border-white/10 shadow-lg hover:scale-110 hover:border-primary/50 transition-all cursor-pointer">
            <ArrowDown className="w-4 h-4 text-primary" />
          </div>
        </div>

        {/* Receive (Fiat) */}
        <div className="bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-inner">
          <div className="flex justify-between items-center mb-3">
            <label className="text-muted-foreground text-xs font-black tracking-widest uppercase">Receive Fiat</label>
            <div className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <span className="text-emerald-400 text-[10px] font-black">₦ NGN</span>
            </div>
          </div>
          <div className="w-full bg-transparent text-4xl font-black text-emerald-400 outline-none h-12 tracking-tight">
            {isFetchingRate ? (
              <div className="flex items-center gap-1.5 h-full">
                {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />)}
              </div>
            ) : rateData?.to?.estimatedAmount ? (
              `₦${rateData.to.estimatedAmount.toLocaleString()}`
            ) : "0.00"}
          </div>
        </div>

        {/* Breakdown */}
        <AnimatePresence>
          {rateData && !isFetchingRate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden text-sm"
            >
              <div className="p-4 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Rate</span>
                  <span className="text-white font-bold tabular-nums">
                    1 {selectedCrypto.symbol} ≈ ₦{((rateData.to.estimatedAmount) / parseFloat(fromAmount)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    Leg 1 (Stables)
                    <Info className="w-3.5 h-3.5 opacity-40 cursor-help" />
                  </span>
                  <span className="text-white/80 font-medium tabular-nums">
                    {rateData.intermediate?.estimatedAmount} {rateData.intermediate?.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-2.5">
                  <span className="text-white font-black uppercase tracking-widest text-xs">Final Payout</span>
                  <span className="text-emerald-400 font-black text-lg tabular-nums">
                    ₦{rateData.to.estimatedAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <button
          onClick={onNext}
          disabled={!isValid || isFetchingRate}
          className="w-full futuristic-button bg-primary text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(100,150,255,0.25)] disabled:opacity-40 disabled:shadow-none transition-all hover:scale-[1.01]"
        >
          {isFetchingRate ? "Calculating..." : "Continue to Payout →"}
        </button>

        {rateData?.warning && (
          <p className="text-[10px] text-yellow-500/80 font-bold text-center uppercase tracking-tight">
            ⚠️ {rateData.warning}
          </p>
        )}
      </div>
    </motion.div>
  )
}
