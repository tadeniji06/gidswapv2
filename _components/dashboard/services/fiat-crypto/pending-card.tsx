"use client"

import { useState, useEffect, JSX } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Clock, Loader2, CheckCircle2, ShieldCheck, Banknote, RefreshCw, XCircle, FileDown, PartyPopper } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { useFiatCryptoStore, OnrampPaymentOrder } from "@/lib/fiat-crypto-store"
import Cookies from "js-cookie"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog"

// Time display helper
function formatTimeLeft(endTimeStr: string) {
  const endTime = new Date(endTimeStr).getTime()
  const now = new Date().getTime()
  const diff = endTime - now

  if (diff <= 0) return "Expired"

  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg border border-[#2d3142]">
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 mb-1">{label}</span>
        <span className="text-sm font-mono text-gray-200">{text}</span>
      </div>
      <button
        onClick={handleCopy}
        className="p-2 hover:bg-white/5 rounded-md transition-colors group"
      >
        {copied ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400 group-hover:text-white" />
        )}
      </button>
    </div>
  )
}

export function PendingPaymentCard({ onNewTransaction }: { onNewTransaction: () => void }) {
  const { paymentOrder, pollPaymentStatus, selectedToken } = useFiatCryptoStore()
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Validate state
  if (!paymentOrder || !paymentOrder.providerAccount) {
    return (
      <Card className="w-full max-w-lg mx-auto bg-[#1a1d27] border-[#2d3142]">
        <CardContent className="pt-6 text-center">
          <Loader2 className="w-8 h-8 text-[#4f8ef7] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your fiat transfer details...</p>
        </CardContent>
      </Card>
    )
  }

  const { providerAccount } = paymentOrder

  // Polling via React Query
  const { data: isCompleted, isError, error } = useQuery({
    queryKey: ["pollPayment", paymentOrder.id],
    queryFn: async () => {
      return await pollPaymentStatus(paymentOrder.id)
    },
    refetchInterval: (query) => {
      if (query.state.data) return false // stop polling if completed
      return 3000 // Poll every 3s
    },
    refetchIntervalInBackground: true,
  })

  useEffect(() => {
    if (isCompleted) {
      setShowSuccessModal(true)
    }
  }, [isCompleted])

  // Timer effect
  useEffect(() => {
    if (!paymentOrder.validUntil) return
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(paymentOrder.validUntil))
    }, 1000)
    return () => clearInterval(interval)
  }, [paymentOrder.validUntil])

  const terminalStates = ["cancelled", "refunded", "expired", "failed"]
  const isTerminal = terminalStates.includes(paymentOrder.status)

  // Status mapping UI
  const getStatusDisplay = (): { color: string; bg: string; icon: JSX.Element; text: string } => {
    switch (paymentOrder.status) {
      case "settled":
      case "fulfilled":
      case "validated":
        return {
          color: "text-green-400",
          bg: "bg-green-400/10",
          icon: <CheckCircle2 className="w-4 h-4" />,
          text: "Transfer completed",
        }
      case "processing":
        return {
          color: "text-blue-400",
          bg: "bg-blue-400/10",
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: "Deposit detected. Minting...",
        }
      case "failed":
      case "expired":
      case "cancelled":
        return {
          color: "text-red-400",
          bg: "bg-red-400/10",
          icon: <XCircle className="w-4 h-4" />,
          text: "Payment Expired/Failed",
        }
      default:
        return {
          color: "text-yellow-400",
          bg: "bg-yellow-400/10",
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          text: "Awaiting fiat transfer...",
        }
    }
  }

  const statusUI = getStatusDisplay()

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg mx-auto"
      >
        <Card className="bg-[#1a1d27] border-[#2d3142] shadow-xl overflow-hidden relative">
          
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#4f8ef7] to-[#12c2e9] opacity-70" />

          <CardHeader className="text-center pb-4 border-b border-[#2d3142]">
            <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 ring-8 ring-[#1a1d27]/50 drop-shadow-lg">
              <Banknote className="w-6 h-6 text-blue-400" />
            </div>
            <CardTitle className="text-2xl text-white">Fiat Transfer Details</CardTitle>
            <p className="text-gray-400 text-sm mt-1">
              Please transfer the exact NGN amount to the bank account below.
            </p>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            
            {/* Amount / Timer */}
            <div className="flex justify-between items-center bg-[#252836]/30 p-4 rounded-xl border border-[#2d3142]/50">
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs mb-1 uppercase tracking-wider font-semibold">
                  Amount to transfer
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">
                    {Number(providerAccount.amountToTransfer).toLocaleString()}
                  </span>
                  <span className="text-blue-400 font-medium">NGN</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-gray-400 text-xs mb-1 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Time left
                </span>
                <span
                  className={`text-xl font-mono ${
                    timeLeft === "Expired" ? "text-red-400 font-bold" : "text-yellow-400"
                  }`}
                >
                  {timeLeft}
                </span>
              </div>
            </div>

            {/* Bank Transfer Details Box */}
            <div className="bg-[#13161e] p-5 rounded-xl border border-[#2d3142] space-y-3">
              <div className="flex items-center gap-2 mb-4 text-[#4f8ef7]">
                <ShieldCheck className="w-5 h-5" />
                <h4 className="font-medium">Bank Instructions</h4>
              </div>

              <div className="space-y-3">
                <CopyButton text={providerAccount.institution} label="Bank Name" />
                <CopyButton text={providerAccount.accountIdentifier} label="Account Number" />
                <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg border border-[#2d3142]">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Account Name</span>
                    <span className="text-sm font-semibold text-gray-100">{providerAccount.accountName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Warning */}
            <div
              className={`flex items-center gap-3 p-4 rounded-xl border border-transparent ${statusUI.bg} ${statusUI.color}`}
            >
              <div className="flex-shrink-0 animate-pulse">{statusUI.icon}</div>
              <p className="text-sm font-medium">{statusUI.text}</p>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                Order Reference: <span className="font-mono ml-1">{paymentOrder.reference}</span>
              </p>
            </div>
            
            {isTerminal && (
              <Button
                variant="outline"
                className="w-full mt-4 bg-transparent border-gray-700 text-gray-300 hover:text-white"
                onClick={onNewTransaction}
              >
                Start New Transaction
              </Button>
            )}

          </CardContent>
        </Card>
      </motion.div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md bg-[#1a1d27] text-white border border-[#2a2d3a] p-0 overflow-hidden hide-close-button">
          <div className="bg-gradient-to-b from-green-500/20 to-transparent p-6 pb-2 text-center relative">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
              <PartyPopper className="w-8 h-8 text-green-400" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center mb-2">Order Confirmed!</DialogTitle>
            <p className="text-gray-300 text-sm px-4">
              We've successfully verified your deposit of <strong>{(paymentOrder as any).fiatAmount || "---"} NGN</strong> and sent <strong>{paymentOrder.amount} {selectedToken?.symbol}</strong> to your wallet.
            </p>
          </div>
          
          <div className="p-6 space-y-4 pt-2">
            <div className="bg-[#13161e] p-4 rounded-xl space-y-3 mt-4 text-sm">
              <div className="flex justify-between border-b border-[#2d3142] pb-2 text-xs">
                <span className="text-gray-400">Status</span>
                <span className="text-green-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Settled
                </span>
              </div>
              <div className="flex justify-between border-b border-[#2d3142] pb-2 text-xs">
                <span className="text-gray-400">Fiat Deposited</span>
                <span className="text-gray-200 font-medium">
                  {(paymentOrder as any).fiatAmount || "---"} NGN
                </span>
              </div>
              <div className="flex justify-between border-b border-[#2d3142] pb-2 text-xs">
                <span className="text-gray-400">Crypto Received</span>
                <span className="font-mono text-white">
                  {paymentOrder.amount} {selectedToken?.symbol}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Wallet</span>
                <span className="font-mono text-gray-300">...{paymentOrder.id.slice(-6)}</span>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-col gap-2 mt-6">
              <Button
                className="w-full bg-[#4f8ef7] hover:bg-[#3b7ae0] text-white"
                onClick={() => {
                  setShowSuccessModal(false)
                  onNewTransaction()
                }}
              >
                Go to Dashboard
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
