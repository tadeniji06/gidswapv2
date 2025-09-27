"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Copy, Clock, Wallet, Hash, DollarSign } from "lucide-react"

interface PendingPaymentData {
  id: string
  reference: string
  amount: string
  token: string
  network: string
  receiveAddress: string
  senderFee: string
  transactionFee: string
  validUntil: string
}

interface PendingPaymentCardProps {
  paymentData: PendingPaymentData
  onTimeout: () => void
}

export function PendingPaymentCard({ paymentData, onTimeout }: PendingPaymentCardProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [copied, setCopied] = useState<string>("")

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const validUntil = new Date(paymentData.validUntil).getTime()
      const difference = validUntil - now

      if (difference > 0) {
        return Math.floor(difference / 1000 / 60) 
      }
      return 0
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)

      if (newTimeLeft <= 0) {
        clearInterval(timer)
        onTimeout()
      }
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [paymentData.validUntil, onTimeout])

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(""), 2000)
  }

  const formatNetwork = (network: string) => {
    return network
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="bg-[#2a2d3a] border-gray-700">
        <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-between">
        <CardTitle className="text-yellow-500 text-md">Pending</CardTitle>
          <div className="flex items-center justify-center gap-2 text-orange-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-bold">{timeLeft > 0 ? `${timeLeft} mins left` : "Expired"}</span>
          </div>
            </div>

          <p className="text-gray-400 text-sm mt-5">
            Send exactly {paymentData.amount} {paymentData.token} to complete your order
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Amount and Token */}
          <div className="bg-[#1e2028] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* <DollarSign className="w-5 h-5 text-blue-400" /> */}
                <span className="text-gray-400">Amount</span>
              </div>
              <span className="text-white font-bold text-lg">
                {paymentData.amount} {paymentData.token}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-400">Network</span>
              <span className="text-white">{formatNetwork(paymentData.network)}</span>
            </div>
          </div>

          {/* Receive Address */}
          <div className="bg-[#1e2028] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400">Send to Address</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-white text-sm bg-[#0f1015] p-2 rounded flex-1 break-all">
                {paymentData.receiveAddress}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(paymentData.receiveAddress, "address")}
                className="text-blue-400 hover:text-blue-300"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            {copied === "address" && <p className="text-blue-400 text-xs mt-1">Address copied!</p>}
          </div>

          {/* Reference */}
          <div className="bg-[#1e2028] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400">Reference</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-white text-sm bg-[#0f1015] p-2 rounded flex-1">{paymentData.reference}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(paymentData.reference, "reference")}
                className="text-blue-400 hover:text-blue-300"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            {copied === "reference" && <p className="text-blue-400 text-xs mt-1">Reference copied!</p>}
          </div>

          {/* Fees */}
          {/* <div className="bg-[#1e2028] rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Fee Breakdown</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Sender Fee</span>
                <span className="text-white">
                  {paymentData.senderFee} {paymentData.token}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Transaction Fee</span>
                <span className="text-white">
                  {paymentData.transactionFee} {paymentData.token}
                </span>
              </div>
            </div>
          </div> */}

          {/* Warning */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <p className="text-orange-400 text-sm">
              ⚠️ Send only {paymentData.token} on {formatNetwork(paymentData.network)} network. Sending other tokens or
              using wrong network will result in loss of funds.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
