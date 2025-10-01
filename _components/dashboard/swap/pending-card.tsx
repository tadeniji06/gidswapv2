"use client"

import { useState } from "react"
import { Copy, CheckCircle, Clock, ArrowLeft } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog"
import { useSwapStore } from "@/lib/swap-store"
import { useRouter } from "next/navigation"
interface PendingDepositCardProps {
  swapData?: any
}

export function PendingDepositCard({ swapData: propSwapData }: PendingDepositCardProps) {
  const { swapData: storeSwapData, backToSwap } = useSwapStore()
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [copiedAmount, setCopiedAmount] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  // Use prop data or fallback to store data
  const swapData = propSwapData || storeSwapData

  if (!swapData || swapData.code !== 0) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <p className="text-gray-400 text-center">No valid swap data available</p>
        </CardContent>
      </Card>
    )
  }

  const copyToClipboard = async (text: string, type: "address" | "amount") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "address") {
        setCopiedAddress(true)
        setTimeout(() => setCopiedAddress(false), 2000)
      } else {
        setCopiedAmount(true)
        setTimeout(() => setCopiedAmount(false), 2000)
      }
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }
   const handleCloseDialog = () => {
    setOpen(false);
    router.push("/dashbaord");
   }
  const depositAddress = swapData.data?.from?.address || "Address not available"
  const depositAmount = swapData.data?.from?.amount || "0"
  const fromCurrency = swapData.data?.from?.coin || "BTC"
  const toCurrency = swapData.data?.to?.coin || "ETH"
  const swapId = swapData.data?.id || "N/A"
  const timeLeft = swapData.data?.time?.left || 1800 // seconds
  const timeLeftMinutes = Math.floor(timeLeft / 60)

  return (
    <>
      <Card className="w-full max-w-md mx-auto bg-gray-900 border-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={backToSwap} className="text-gray-400 hover:text-white p-0">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="flex items-center gap-2 text-orange-500">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Pending</span>
            </div>
          </div>
          <CardTitle className="text-white text-xl">Send {fromCurrency}</CardTitle>
          <p className="text-gray-400 text-sm">Send the exact amount to the address below to complete your swap</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Deposit Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Deposit Address</label>
            <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <code className="flex-1 text-sm text-white font-mono break-all">{depositAddress}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(depositAddress, "address")}
                className="text-gray-400 hover:text-white p-1"
              >
                {copiedAddress ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Amount to Send */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Amount to Send</label>
            <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <span className="flex-1 text-lg font-semibold text-white">
                {depositAmount} {fromCurrency}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(depositAmount, "amount")}
                className="text-gray-400 hover:text-white p-1"
              >
                {copiedAmount ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Swap Details */}
          <div className="space-y-3 p-4 bg-gray-800 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Swap ID</span>
              <span className="text-white font-medium">{swapId}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">You will receive</span>
              <span className="text-white font-medium">
                {swapData.data?.to?.amount || "Calculating..."} {toCurrency}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">This transaction expires in</span>
              <span className="text-white">{timeLeftMinutes} minutes</span>
            </div>

            <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
              <span className="text-gray-400">Status</span>
              <span className="text-orange-500 font-medium">{swapData.data?.status || "Waiting for deposit"}</span>
            </div>
          </div>

          {/* Popup Trigger */}
          <div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl w-full"
              onClick={() => setOpen(true)}
            >
              I have sent the coin
            </Button>
          </div>

          {/* Warning */}
          <div className="p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
            <p className="text-yellow-200 text-xs">
              ⚠️ Send only {fromCurrency} to this address. Sending other currencies may result in permanent loss.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Popup Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 border border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Transaction Processed</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-300 space-y-2">
            <p>Your transaction has been processed successfully.</p>
            <p>If any issue occurs, please reach out to our customer care hotlines.</p>
          </div>
          <DialogFooter>
            <Button onClick={handleCloseDialog} className="bg-blue-600 hover:bg-blue-700 text-white">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
