"use client"
import { Button } from "@/src/components/ui/button"
import { Copy, Clock, DollarSign } from "lucide-react"
import { useState } from "react"

interface SwapData {
  id: string
  type: string
  status: string
  time: {
    left: number
    expiration: number
  }
  from: {
    code: string
    coin: string
    network: string
    name: string
    amount: string
    address: string
    reqConfirmations: number
    maxConfirmations: number
  }
  to: {
    code: string
    coin: string
    network: string
    name: string
    amount: string
    address: string
  }
  token: string
}

interface WalletAddressCardProps {
  swapData: SwapData
  onBack: () => void
  onProceed: (walletAddress: string) => void
}

export function WalletAddressCard({ swapData, onBack, onProceed }: WalletAddressCardProps) {
  const [walletAddress, setWalletAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  if (!swapData || !swapData.to || !swapData.from) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-[#2a2d3a] rounded-2xl p-6 text-center">
          <p className="text-gray-400 mb-4">Invalid swap data. Please try again.</p>
          <Button
            variant="outline"
            onClick={onBack}
            className="border-[#3a3d4a] text-gray-400 hover:text-white hover:bg-[#3a3d4a] bg-transparent"
          >
            Back to Swap
          </Button>
        </div>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleProceed = async () => {
    if (!walletAddress.trim()) return

    setIsLoading(true)
    try {
      await onProceed(walletAddress.trim())
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#2a2d3a] rounded-2xl p-6 mb-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-2">Complete Your Swap</h2>
          <p className="text-gray-400 text-sm">Enter your {swapData.to.name} wallet address to receive your funds</p>
        </div>

        {/* Swap Details */}
        <div className="bg-[#1a1d29] rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400 text-sm">You're sending</span>
            <div className="text-right">
              <div className="text-white font-semibold">
                {swapData.from.amount} {swapData.from.coin}
              </div>
              <div className="text-gray-400 text-xs">{swapData.from.network}</div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 text-sm">You'll receive</span>
            <div className="text-right">
              <div className="text-white font-semibold">
                {swapData.to.amount} {swapData.to.coin}
              </div>
              <div className="text-gray-400 text-xs">{swapData.to.network}</div>
            </div>
          </div>

          <div className="border-t border-[#3a3d4a] pt-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400 text-sm">Time remaining</span>
              </div>
              <span className="text-blue-400 font-semibold">{formatTime(swapData.time.left)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-gray-400 text-sm">Processing time</span>
              </div>
              <span className="text-green-400 font-semibold">
                {swapData.from.reqConfirmations}-{swapData.from.maxConfirmations} confirmations
              </span>
            </div>
          </div>
        </div>

        {/* Wallet Address Input */}
        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-2">{swapData.to.name} Wallet Address</label>
          <div className="relative">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder={`Enter your ${swapData.to.coin} address`}
              className="w-full bg-[#1a1d29] border border-[#3a3d4a] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none"
            />
          </div>
          <p className="text-gray-500 text-xs mt-2">Make sure this address supports {swapData.to.network} network</p>
        </div>

        {/* Deposit Address */}
        <div className="bg-[#1a1d29] rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Send {swapData.from.coin} to:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(swapData.from.address)}
              className="text-blue-400 hover:text-blue-300 p-1"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <div className="bg-[#2a2d3a] rounded-lg p-3">
            <code className="text-white text-sm break-all font-mono">{swapData.from.address}</code>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 border-[#3a3d4a] text-gray-400 hover:text-white hover:bg-[#3a3d4a] bg-transparent"
          >
            Back
          </Button>
          <Button
            onClick={handleProceed}
            disabled={!walletAddress.trim() || isLoading}
            className="flex-1 bg-blue-900 hover:bg-blue-500 text-white font-semibold disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Proceed"}
          </Button>
        </div>
      </div>
    </div>
  )
}
