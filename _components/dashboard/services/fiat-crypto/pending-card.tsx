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
      <div className="w-full max-w-lg mx-auto glass-panel p-12 text-center rounded-3xl">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
        <p className="text-muted-foreground font-medium">Securing your transaction details...</p>
      </div>
    )
  }

  const { providerAccount } = paymentOrder

  // Polling via React Query
  const { data: isCompleted } = useQuery({
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
          color: "text-emerald-400",
          bg: "bg-emerald-400/10",
          icon: <CheckCircle2 className="w-4 h-4" />,
          text: "Transfer completed successfully",
        }
      case "processing":
        return {
          color: "text-blue-400",
          bg: "bg-blue-400/10",
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: "Deposit detected. Processing mint...",
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
          color: "text-amber-400",
          bg: "bg-amber-400/10",
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          text: "Awaiting fiat transfer...",
        }
    }
  }

  const statusUI = getStatusDisplay()

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg mx-auto relative group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        
        <div className="glass-panel neon-border shadow-2xl rounded-3xl overflow-hidden relative z-10">
          <div className="p-8 text-center border-b border-white/5 bg-white/5 backdrop-blur-xl">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
              <Banknote className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Fiat Transfer Details</h3>
            <p className="text-muted-foreground text-sm mt-2 font-medium">
              Transfer the exact amount to complete your swap.
            </p>
          </div>

          <div className="p-8 space-y-8">
            {/* Amount / Timer */}
            <div className="flex justify-between items-center bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-inner">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs mb-1 uppercase tracking-widest font-bold">
                  Amount to transfer
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white tracking-tighter">
                    {Number(providerAccount.amountToTransfer).toLocaleString()}
                  </span>
                  <span className="text-primary font-black">NGN</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-muted-foreground text-xs mb-1 uppercase tracking-widest font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Time left
                </span>
                <span
                  className={`text-2xl font-black tracking-widest font-mono ${
                    timeLeft === "Expired" ? "text-red-500 animate-pulse" : "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                  }`}
                >
                  {timeLeft}
                </span>
              </div>
            </div>

            {/* Bank Transfer Details Box */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <ShieldCheck className="w-5 h-5" />
                <h4 className="font-bold uppercase tracking-wider text-sm">Bank Instructions</h4>
              </div>

              <div className="space-y-3">
                <CopyButton text={providerAccount.institution} label="Bank Name" />
                <CopyButton text={providerAccount.accountIdentifier} label="Account Number" />
                <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter mb-1">Account Name</span>
                    <span className="text-md font-bold text-white tracking-wide">{providerAccount.accountName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Warning */}
            <div
              className={`flex items-center gap-4 p-5 rounded-2xl border transition-all duration-500 ${statusUI.bg} ${statusUI.color} border-current/20 shadow-lg`}
            >
              <div className="flex-shrink-0 animate-pulse bg-white/10 p-2 rounded-lg">{statusUI.icon}</div>
              <p className="text-sm font-bold tracking-wide uppercase">{statusUI.text}</p>
            </div>

            <div className="text-center pt-2">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-50">
                Order Reference: <span className="font-mono ml-1 text-white opacity-100">{paymentOrder.reference}</span>
              </p>
            </div>
            
            {isTerminal && (
              <Button
                variant="outline"
                className="w-full mt-4 glass-panel border-white/10 text-white hover:bg-white/10 transition-all py-6 rounded-2xl font-bold tracking-wide uppercase"
                onClick={onNewTransaction}
              >
                Start New Transaction
              </Button>
            )}

          </div>
        </div>
      </motion.div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md glass-panel text-white border-white/10 p-0 overflow-hidden hide-close-button rounded-[2rem]">
          <div className="bg-gradient-to-b from-emerald-500/20 to-transparent p-10 text-center relative">
            <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
            
            <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-bounce">
              <PartyPopper className="w-10 h-10 text-emerald-400" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tighter text-center mb-3">Order Confirmed!</DialogTitle>
            <p className="text-muted-foreground text-sm font-medium px-4 leading-relaxed">
              We've successfully verified your deposit and sent <span className="text-white font-bold">{paymentOrder.amount} {selectedToken?.symbol}</span> to your wallet.
            </p>
          </div>
          
          <div className="p-8 space-y-6 pt-0">
            <div className="bg-black/50 backdrop-blur-md p-6 rounded-2xl border border-white/5 space-y-4 shadow-inner">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Status</span>
                <span className="text-emerald-400 font-bold flex items-center gap-2 bg-emerald-400/10 px-3 py-1 rounded-full text-xs">
                  <CheckCircle2 className="w-3 h-3" /> SETTLED
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Received</span>
                <span className="text-white font-black tracking-tight text-lg">
                  {paymentOrder.amount} {selectedToken?.symbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Ref</span>
                <span className="font-mono text-xs text-white/50">{paymentOrder.reference.slice(0, 12)}...</span>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-col gap-3">
              <Button
                className="w-full futuristic-button bg-primary text-white py-8 text-lg font-black rounded-2xl shadow-[0_0_30px_rgba(100,150,255,0.3)]"
                onClick={() => {
                  setShowSuccessModal(false)
                  onNewTransaction()
                }}
              >
                RETURN TO DASHBOARD
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
