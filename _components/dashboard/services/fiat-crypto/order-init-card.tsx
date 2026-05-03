"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, ArrowRight, Building2, Wallet } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { useFiatCryptoStore } from "@/lib/fiat-crypto-store"
import Cookies from "js-cookie"

export function OrderInitializationCard({
  onSuccess,
  onChangeAccount
}: {
  onSuccess: () => void
  onChangeAccount: () => void
}) {
  const {
    fiatAmount,
    tokenAmount,
    selectedToken,
    selectedCurrency,
    destinationAddress,
    quote,
    initializeOrder,
    isInitializingOrder
  } = useFiatCryptoStore()

  const [bankData, setBankData] = useState<any>(null)

  useEffect(() => {
    const cookieData = Cookies.get("verifiedBank")
    if (cookieData) {
      try {
        setBankData(JSON.parse(cookieData))
      } catch (e) {}
    }
  }, [])

  const handleInitialize = async () => {
    if (!bankData) return
    const success = await initializeOrder(bankData)
    if (success) {
      onSuccess()
    }
  }

  if (!bankData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 glass-panel neon-border rounded-2xl w-full max-w-md mx-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-2xl z-0" />
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4 relative z-10" />
        <p className="text-muted-foreground font-medium relative z-10">Loading your refund bank data...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-panel neon-border shadow-2xl rounded-3xl p-6 md:p-8 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 group-hover:bg-primary/20 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/20 transition-all duration-700" />

      <div className="space-y-8 relative z-10">
        <div className="text-center space-y-1">
          <h3 className="text-2xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Order Summary</h3>
          <p className="text-sm text-muted-foreground tracking-wide">Review your transaction details</p>
        </div>

        {/* Transaction Amounts */}
        <div className="bg-black/30 backdrop-blur-md p-6 rounded-2xl border border-white/5 space-y-5 shadow-inner">
          <div className="flex justify-between items-center pb-5 border-b border-white/10">
            <span className="text-muted-foreground font-medium">You pay</span>
            <span className="text-2xl font-bold text-white drop-shadow-md">
              {Number(fiatAmount).toLocaleString()} <span className="text-gray-400 text-lg">{selectedCurrency?.code}</span>
            </span>
          </div>
          <div className="flex justify-between items-center pb-5 border-b border-white/10">
            <span className="text-muted-foreground font-medium">You receive</span>
            <span className="text-2xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
              {tokenAmount} <span className="text-emerald-500/70 text-lg">{selectedToken?.symbol}</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Rate</span>
            <span className="text-gray-200 font-medium">
              1 {selectedToken?.symbol} = {quote?.rate.toLocaleString()} {selectedCurrency?.code}
            </span>
          </div>
        </div>

        {/* Destination Wallet */}
        <div className="bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-inner transition-colors hover:border-primary/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm font-semibold text-gray-200">Destination Wallet</span>
          </div>
          <p className="text-xs text-muted-foreground break-all bg-black/50 p-3 rounded-xl font-mono border border-white/5">
            {destinationAddress}
          </p>
        </div>

        {/* Refund Bank Account */}
        <div className="bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-inner transition-colors hover:border-purple-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Building2 className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm font-semibold text-gray-200">Refund Bank Account</span>
            </div>
            <button onClick={onChangeAccount} className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-full">
              Change
            </button>
          </div>
          <div className="bg-black/50 p-4 rounded-xl text-sm text-gray-300 border border-white/5 space-y-1">
            <p className="font-bold text-white text-base mb-2">{bankData.bankName}</p>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Account</span>
              <span className="font-mono">{bankData.accountNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-white">{bankData.accountName}</span>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-2 bg-yellow-500/10 px-3 py-2 rounded-lg w-full">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
            <p className="text-xs text-yellow-500/90 font-medium">
              Used exclusively if a refund is necessary.
            </p>
          </div>
        </div>

        <Button
          onClick={handleInitialize}
          disabled={isInitializingOrder}
          className="w-full futuristic-button bg-primary text-white py-7 text-lg font-semibold rounded-2xl flex justify-center items-center gap-2 mt-4"
        >
          {isInitializingOrder ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Initializing Order...
            </>
          ) : (
            <>
              Confirm & Request Payment Details
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
