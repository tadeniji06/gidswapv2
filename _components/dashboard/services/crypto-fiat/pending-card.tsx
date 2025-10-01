"use client"
import Cookies from "js-cookie"
import { useState, useEffect, JSX } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import {
  Copy,
  Clock,
  Wallet,
  Hash,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldCheck,
  CircleDollarSign,
  RotateCw
} from "lucide-react"

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
  status: string
}

interface PendingPaymentCardProps {
  paymentData: PendingPaymentData
  onTimeout: () => void
}

export function PendingPaymentCard({ paymentData, onTimeout }: PendingPaymentCardProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [copied, setCopied] = useState<string>("")
  const API_URL = process.env.NEXT_PUBLIC_PROD_API;
  const authToken = Cookies.get("token");
  // Always poll every 2 seconds
  const { data: statusData } = useQuery<PendingPaymentData>({
    queryKey: ["payment-status", paymentData.id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/payCrest/trade/status/${paymentData.id}`, {
         headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      })
      if (!res.ok) throw new Error("Failed to fetch payment status")
      return res.json()
    },
    refetchInterval: 60000,
    initialData: paymentData
  })

  const currentStatus = statusData?.status ?? paymentData.status

  // Status config
  const statusMap: Record<
    string,
    { label: string; icon: JSX.Element; color: string }
  > = {
    pending: {
      label: "Order created, waiting for deposit",
      icon: <Loader2 className="w-5 h-5 text-yellow-400" />,
      color: "text-yellow-400"
    },
    processing: {
      label: "Provider assigned, processing payment",
      icon: <RefreshCw className="w-5 h-5 text-blue-400" />,
      color: "text-blue-400"
    },
    fulfilled: {
      label: "Payment completed by provider",
      icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
      color: "text-green-400"
    },
    validated: {
      label: "Payment validated and confirmed",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      color: "text-emerald-400"
    },
    settled: {
      label: "Order fully completed on blockchain",
      icon: <CircleDollarSign className="w-5 h-5 text-green-500" />,
      color: "text-green-500"
    },
    cancelled: {
      label: "Order cancelled",
      icon: <XCircle className="w-5 h-5 text-red-400" />,
      color: "text-red-400"
    },
    refunded: {
      label: "Funds refunded to sender",
      icon: <RotateCw className="w-5 h-5 text-purple-400" />,
      color: "text-purple-400"
    }
  }

  const statusInfo = statusMap[currentStatus] ?? {
    label: "Unknown status",
    icon: <Loader2 className="w-5 h-5 text-gray-400" />,
    color: "text-gray-400"
  }

  // Timer logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const validUntil = new Date(paymentData.validUntil).getTime()
      const difference = validUntil - now
      return difference > 0 ? Math.floor(difference / 1000 / 60) : 0
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)
      if (newTimeLeft <= 0) {
        clearInterval(timer)
        onTimeout()
      }
    }, 60000)

    return () => clearInterval(timer)
  }, [paymentData.validUntil, onTimeout])

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(""), 2000)
  }

  const formatNetwork = (network: string) =>
    network
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="bg-[#2a2d3a] border-gray-700">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStatus}
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-2 ${statusInfo.color}`}
              >
                <motion.span
                  animate={
                    ["pending", "processing"].includes(currentStatus)
                      ? { rotate: 360 }
                      : {}
                  }
                  transition={
                    ["pending", "processing"].includes(currentStatus)
                      ? { repeat: Infinity, duration: 1, ease: "linear" }
                      : {}
                  }
                >
                  {statusInfo.icon}
                </motion.span>
                <CardTitle className="text-md capitalize">
                  {currentStatus}
                </CardTitle>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-center gap-2 text-orange-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold">
                {timeLeft > 0 ? `${timeLeft} mins left` : "Expired"}
              </span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-3">{statusInfo.label}</p>
          <p className="text-gray-400 text-sm mt-3">
            Send exactly {paymentData.amount} {paymentData.token} to complete your order
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Amount and Token */}
          <div className="bg-[#1e2028] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Amount</span>
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
              <code className="text-white text-sm bg-[#0f1015] p-2 rounded flex-1">
                {paymentData.reference}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(paymentData.reference, "reference")}
                className="text-blue-400 hover:text-blue-300"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            {copied === "reference" && (
              <p className="text-blue-400 text-xs mt-1">Reference copied!</p>
            )}
          </div>

          {/* Warning */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <p className="text-orange-400 text-sm">
              ⚠️ Send only {paymentData.token} on {formatNetwork(paymentData.network)} network. 
              Sending other tokens or using wrong network will result in loss of funds.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
