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
        <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm">
          <p className="text-muted-foreground mb-4 font-medium">Invalid swap data. Please try again.</p>
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full"
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
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 mb-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-1">Complete Your Swap</h2>
          <p className="text-muted-foreground text-sm">Enter your {swapData.to.name} wallet address to receive your funds</p>
        </div>

        {/* Swap Details */}
        <div className="bg-muted/30 border border-border rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-muted-foreground text-sm">You're sending</span>
            <div className="text-right">
              <div className="text-foreground font-semibold">
                {swapData.from.amount} {swapData.from.coin}
              </div>
              <div className="text-muted-foreground text-xs font-medium">{swapData.from.network}</div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-muted-foreground text-sm">You'll receive</span>
            <div className="text-right">
              <div className="text-foreground font-semibold">
                {swapData.to.amount} {swapData.to.coin}
              </div>
              <div className="text-muted-foreground text-xs font-medium">{swapData.to.network}</div>
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">Time remaining</span>
              </div>
              <span className="text-foreground font-medium tabular-nums">{formatTime(swapData.time.left)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">Processing time</span>
              </div>
              <span className="text-foreground font-medium">
                {swapData.from.reqConfirmations}-{swapData.from.maxConfirmations} confirmations
              </span>
            </div>
          </div>
        </div>

        {/* Wallet Address Input */}
        <div className="mb-6 space-y-2">
          <label className="block text-muted-foreground text-sm font-medium">{swapData.to.name} Wallet Address</label>
          <div className="relative">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder={`Enter your ${swapData.to.coin} address`}
              className="w-full bg-background border border-input rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
            />
          </div>
          <p className="text-muted-foreground text-xs mt-2">Make sure this address supports {swapData.to.network} network</p>
        </div>

        {/* Deposit Address */}
        <div className="bg-background border border-border rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground text-sm font-medium">Send {swapData.from.coin} to:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(swapData.from.address)}
              className="text-primary hover:text-primary/80 hover:bg-muted p-1 h-auto"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <div className="bg-muted p-3 rounded-lg border border-border/50">
            <code className="text-foreground text-sm break-all font-mono">{swapData.from.address}</code>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleProceed}
            disabled={!walletAddress.trim() || isLoading}
            className="flex-1 fintech-button-primary"
          >
            {isLoading ? "Processing..." : "Proceed"}
          </Button>
        </div>
      </div>
    </div>
  )
}
