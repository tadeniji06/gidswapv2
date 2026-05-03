"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowDown, Loader2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { useFiatCryptoStore } from "@/lib/fiat-crypto-store"
import Image from "next/image"

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
    fetchCurrencies
  } = useFiatCryptoStore()

  useEffect(() => {
    if (tokens.length === 0) fetchTokens()
    if (currencies.length === 0) fetchCurrencies()
  }, [])

  useEffect(() => {
    if (!selectedToken && tokens.length > 0) {
      setSelectedToken(tokens[0])
    }
    if (!selectedCurrency && currencies.length > 0) {
      setSelectedCurrency(currencies[0])
    }
  }, [tokens, currencies])

  const isValid = Number(fiatAmount) > 0 && Number(tokenAmount) > 0 && selectedToken

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-panel neon-border shadow-2xl rounded-3xl p-6 md:p-8 relative overflow-hidden group"
    >
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 group-hover:bg-primary/20 transition-all duration-700" />
      
      <div className="space-y-4 relative z-10">
        {/* You Pay (Fiat) */}
        <div className="bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-inner transition-colors focus-within:border-primary/50">
          <div className="flex justify-between items-center mb-2">
            <label className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">You pay</label>
            <div className="bg-primary/20 border border-primary/30 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm">
              <span className="text-white text-sm font-bold">
                {selectedCurrency ? selectedCurrency.code : "NGN"}
              </span>
            </div>
          </div>
          <Input
            type="number"
            value={fiatAmount}
            onChange={(e) => setFiatAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent text-4xl font-bold text-white border-0 focus-visible:ring-0 p-0 h-12 tracking-tight placeholder:text-white/20"
          />
        </div>

        <div className="flex justify-center -my-3 relative z-20">
          <div className="bg-background/80 backdrop-blur-xl p-2 rounded-full border border-white/10 shadow-lg group-hover:scale-110 transition-transform cursor-pointer">
            <ArrowDown className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* You Receive (Crypto) */}
        <div className="bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-inner transition-colors hover:border-white/10">
          <div className="flex justify-between items-center mb-2">
            <label className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">You receive</label>
            {isLoadingTokens ? (
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl">
                 <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            ) : (
              <select
                className="bg-white/10 hover:bg-white/15 transition-colors border border-white/10 text-white outline-none rounded-xl px-3 py-1.5 text-sm font-bold cursor-pointer appearance-none pr-8 relative"
                value={selectedToken ? tokens.findIndex(t => t.symbol === selectedToken.symbol && t.network === selectedToken.network) : ""}
                onChange={(e) => {
                  const t = tokens[Number(e.target.value)]
                  if (t) setSelectedToken(t)
                }}
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
              >
                {tokens.map((t, idx) => (
                  <option key={`${t.symbol}-${t.network}`} value={idx} className="bg-[#1a1d27] text-white">
                    {t.symbol} ({t.network})
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <Input
              type="text"
              readOnly
              value={isLoadingQuote ? "Fetching..." : (tokenAmount || "0.00")}
              className={`w-full bg-transparent text-4xl font-bold border-0 focus-visible:ring-0 p-0 h-12 tracking-tight ${isLoadingQuote ? 'text-white/30 animate-pulse' : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]'}`}
            />
          </div>
        </div>

        {quoteError && (
          <div className="text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-sm font-medium text-center flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></div>
            {quoteError}
          </div>
        )}

        <Button
          onClick={onNext}
          disabled={!isValid || isLoadingQuote}
          className="w-full mt-6 futuristic-button bg-primary text-white py-7 text-lg font-bold rounded-2xl shadow-[0_0_20px_rgba(100,150,255,0.2)] disabled:opacity-50 disabled:shadow-none"
        >
          {isLoadingQuote ? "Calculating Best Rate..." : "Continue to Wallet"}
        </Button>
      </div>
    </motion.div>
  )
}
