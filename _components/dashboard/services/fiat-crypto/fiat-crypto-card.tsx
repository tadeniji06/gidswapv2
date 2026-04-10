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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[#1a1d27] border border-[#252836] shadow-xl rounded-2xl p-6"
    >
      <div className="space-y-4">
        {/* You Pay (Fiat) */}
        <div className="bg-[#13161e] p-4 rounded-xl border border-[#252836]">
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-400 text-sm font-medium">You pay</label>
            <div className="bg-[#252836] px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-white text-sm font-medium">
                {selectedCurrency ? selectedCurrency.code : "NGN"}
              </span>
            </div>
          </div>
          <Input
            type="number"
            value={fiatAmount}
            onChange={(e) => setFiatAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent text-3xl font-bold text-white border-0 focus-visible:ring-0 p-0 h-10"
          />
        </div>

        <div className="flex justify-center -my-2 relative z-10">
          <div className="bg-[#1a1d27] p-2 rounded-full border border-[#252836]">
            <ArrowDown className="w-4 h-4 text-[#4f8ef7]" />
          </div>
        </div>

        {/* You Receive (Crypto) */}
        <div className="bg-[#13161e] p-4 rounded-xl border border-[#252836]">
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-400 text-sm font-medium">You receive</label>
            {isLoadingTokens ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : (
              <select
                className="bg-[#252836] text-white outline-none rounded-lg px-3 py-1.5 text-sm font-medium cursor-pointer"
                value={selectedToken ? tokens.findIndex(t => t.symbol === selectedToken.symbol && t.network === selectedToken.network) : ""}
                onChange={(e) => {
                  const t = tokens[Number(e.target.value)]
                  if (t) setSelectedToken(t)
                }}
              >
                {tokens.map((t, idx) => (
                  <option key={`${t.symbol}-${t.network}`} value={idx}>
                    {t.symbol} ({t.network})
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              type="text"
              readOnly
              value={isLoadingQuote ? "Fetching..." : (tokenAmount || "0.00")}
              className={`w-full bg-transparent text-3xl font-bold border-0 focus-visible:ring-0 p-0 h-10 ${isLoadingQuote ? 'text-gray-500 animate-pulse' : 'text-white'}`}
            />
          </div>
        </div>

        {quoteError && (
          <div className="text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20 text-sm font-medium text-center">
            {quoteError}
          </div>
        )}

        <Button
          onClick={onNext}
          disabled={!isValid || isLoadingQuote}
          className="w-full mt-6 bg-[#4f8ef7] hover:bg-[#3b7ae0] text-white py-6 text-lg font-semibold rounded-xl"
        >
          {isLoadingQuote ? "Fetching quote..." : "Continue"}
        </Button>
      </div>
    </motion.div>
  )
}
