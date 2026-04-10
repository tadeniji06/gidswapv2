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
      <div className="flex flex-col items-center justify-center p-8 bg-[#1a1d27] border border-[#252836] shadow-xl rounded-2xl">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400">Loading your refund bank data...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[#1a1d27] border border-[#252836] shadow-xl rounded-2xl p-6"
    >
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white">Order Summary</h3>
          <p className="text-sm text-gray-400 mt-1">Review your transaction details</p>
        </div>

        {/* Transaction Amounts */}
        <div className="bg-[#13161e] p-5 rounded-xl border border-[#252836] space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-[#252836]">
            <span className="text-gray-400">You pay</span>
            <span className="text-xl font-bold text-white">
              {Number(fiatAmount).toLocaleString()} {selectedCurrency?.code}
            </span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-[#252836]">
            <span className="text-gray-400">You receive</span>
            <span className="text-xl font-bold text-green-400">
              {tokenAmount} {selectedToken?.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Rate</span>
            <span className="text-white font-medium">
              1 {selectedToken?.symbol} = {quote?.rate.toLocaleString()} {selectedCurrency?.code}
            </span>
          </div>
        </div>

        {/* Destination Wallet */}
        <div className="bg-[#13161e] p-4 rounded-xl border border-[#252836]">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Destination Wallet</span>
          </div>
          <p className="text-xs text-gray-400 break-all bg-black/40 p-2 rounded-lg font-mono">
            {destinationAddress}
          </p>
        </div>

        {/* Refund Bank Account */}
        <div className="bg-[#13161e] p-4 rounded-xl border border-[#252836]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">Refund Bank Account</span>
            </div>
            <button onClick={onChangeAccount} className="text-xs text-blue-400 hover:text-blue-300">
              Change
            </button>
          </div>
          <div className="bg-black/40 p-3 rounded-lg text-sm text-gray-400">
            <p className="font-semibold text-white">{bankData.bankName}</p>
            <p>{bankData.accountNumber}</p>
            <p>{bankData.accountName}</p>
          </div>
          <p className="text-xs text-yellow-500/80 mt-2">
            *This account will be used exclusively if a refund is necessary.
          </p>
        </div>

        <Button
          onClick={handleInitialize}
          disabled={isInitializingOrder}
          className="w-full bg-[#4f8ef7] hover:bg-[#3b7ae0] text-white py-6 text-lg font-semibold rounded-xl flex justify-center items-center gap-2"
        >
          {isInitializingOrder ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Initializing...
            </>
          ) : (
            <>
              Confirm & Request Payment Details
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
