"use client"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useSwapStore } from "@/lib/swap-store"

export function QuoteCard() {
  const { swapData, walletAddress, isSwapping, error, setWalletAddress, initiateSwap, backToSwap, setError } =
    useSwapStore()

  const [localWalletAddress, setLocalWalletAddress] = useState(walletAddress)
  const [validationError, setValidationError] = useState<string | null>(null)

  if (!swapData) return null

  const validateWalletAddress = (address: string): boolean => {
    if (!address.trim()) {
      setValidationError("Wallet address is required")
      return false
    }

    // Basic validation - you can enhance this based on currency type
    if (address.length < 10) {
      setValidationError("Invalid wallet address format")
      return false
    }

    setValidationError(null)
    return true
  }

  const handleProceed = async () => {
    setError(null)

    if (!validateWalletAddress(localWalletAddress)) {
      return
    }

    setWalletAddress(localWalletAddress.trim())
    await initiateSwap()
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#2a2d3a] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={backToSwap} className="text-gray-400 hover:text-white p-1">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-semibold text-white">Confirm Swap</h2>
        </div>

        {/* Swap Summary */}
        <div className="bg-[#1a1d2a] rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={swapData.sellCurrency?.logo || "/placeholder.svg"}
                alt={swapData.sellCurrency?.coin}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <div className="text-white font-semibold">
                  {swapData.amount} {swapData.sellCurrency?.coin}
                </div>
                <div className="text-gray-400 text-sm">{swapData.sellCurrency?.name}</div>
              </div>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center gap-3">
              <img
                src={swapData.receiveCurrency?.logo || "/placeholder.svg"}
                alt={swapData.receiveCurrency?.coin}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <div className="text-white font-semibold">
                  {swapData.quote?.to.amount} {swapData.receiveCurrency?.coin}
                </div>
                <div className="text-gray-400 text-sm">{swapData.receiveCurrency?.name}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Details */}
        <div className="bg-[#1a1d2a] rounded-xl p-4 mb-6 text-sm">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Rate</span>
            <span className="text-white">
              1 {swapData.quote?.from.coin} ≈ {swapData.quote?.from.rate.toFixed(6)} {swapData.quote?.to.coin}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Network</span>
            <span className="text-white">{swapData.quote?.to.network}</span>
          </div>
          {/* <div className="flex justify-between">
            <span className="text-gray-400">Processing Time</span>
            <span className="text-white">~ 1-10 minutes</span>
          </div> */}
        </div>

        {/* Wallet Address Input */}
        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-2">Receive Address ({swapData.receiveCurrency?.coin})</label>
          <input
            type="text"
            value={localWalletAddress}
            onChange={(e) => {
              setLocalWalletAddress(e.target.value)
              if (validationError) setValidationError(null)
              if (error) setError(null)
            }}
            placeholder={`Enter your ${swapData.receiveCurrency?.coin} wallet address`}
            className={`w-full bg-[#1a1d2a] border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${
              validationError || error ? "border-red-500" : "border-[#3a3d4a]"
            }`}
          />
          {(validationError || error) && <p className="text-red-400 text-sm mt-2">{validationError || error}</p>}
        </div>

        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleProceed}
          disabled={!localWalletAddress.trim() || isSwapping}
        >
          {isSwapping ? "Creating Swap..." : "Confirm Swap"}
        </Button>
      </div>
    </div>
  )
}
