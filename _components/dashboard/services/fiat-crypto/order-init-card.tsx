"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Loader2, ArrowRight, Building2, Wallet,
  ShieldCheck, Sparkles, FileText, ArrowLeft
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { useFiatCryptoStore } from "@/lib/fiat-crypto-store"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { tfaService } from "@/lib/services/tfa"
import Cookies from "js-cookie"
import { toast } from "sonner"
import { TfaVerificationModal } from "@/_components/popups/tfa-verification-modal"

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
  const [tfaModalOpen, setTfaModalOpen] = useState(false)
  const { data: tfaStatus } = useQuery({ queryKey: ["tfa-status"], queryFn: tfaService.getStatus })

  const queryClient = useQueryClient()

  useEffect(() => {
    const cookieData = Cookies.get("verifiedBank")
    if (cookieData) {
      try {
        setBankData(JSON.parse(cookieData))
      } catch (e) {
        console.error("Failed to parse bank data", e)
      }
    }
  }, [])

  const handleInitialize = async () => {
    if (!bankData) {
      toast.error("Refund bank data is missing")
      return
    }
    // Enforce 2FA verification before proceeding if required
    if (tfaStatus?.needsReverification) {
      setTfaModalOpen(true)
    } else {
      try {
        await handleTfaVerify("")
      } catch(e) {}
    }
  }

  const handleTfaVerify = async (token: string) => {
    const success = await initializeOrder(bankData, token)
    if (success) {
      if (token) queryClient.invalidateQueries({ queryKey: ["tfa-status"] })
      setTfaModalOpen(false)
      onSuccess()
    } else {
      throw new Error("Order failed")
    }
  }

  if (!bankData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-panel neon-border rounded-3xl w-full max-w-md mx-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-2xl z-0" />
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4 relative z-10" />
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs relative z-10">Loading refund data...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-panel neon-border shadow-2xl rounded-3xl relative overflow-hidden"
    >
      {/* Ambient glows */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h3 className="text-2xl font-black tracking-tight text-white uppercase">Order Summary</h3>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Review & Confirm Payment</p>
        </div>

        {/* Transaction Amounts */}
        <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 space-y-4 shadow-inner">
          <div className="flex justify-between items-center pb-4 pt-1">
            <span className="text-muted-foreground text-xs font-medium">Rate</span>
            <span className="text-white/80 font-bold text-xs tabular-nums">
              1 {selectedToken?.symbol} = {selectedCurrency?.symbol}{quote?.rate.toLocaleString("en-NG", { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center pb-4">
            <span className="text-muted-foreground text-sm font-medium">Pay</span>
            <span className="text-xl font-black text-white tabular-nums">
              {Number(fiatAmount).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-muted-foreground/60 text-sm font-bold ml-1">{selectedCurrency?.code}</span>
            </span>
          </div>
          <div className="flex justify-between items-center pb-4">
            <span className="text-muted-foreground text-sm font-medium">Receive</span>
            <span className="text-xl font-black text-emerald-400 tabular-nums">
              {Number(tokenAmount).toLocaleString(undefined, { maximumFractionDigits: 6 })} <span className="text-emerald-500/60 text-sm font-bold ml-1">{selectedToken?.symbol}</span>
            </span>
          </div>
        </div>

        {/* Destination Wallet */}
        <div className="bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-inner group/wallet hover:border-primary/30 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 group-hover/wallet:scale-110 transition-transform">
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Receiving Address</span>
          </div>
          <div className="bg-black/50 p-3.5 rounded-xl border border-white/5">
            <p className="text-xs text-muted-foreground break-all font-mono leading-relaxed">
              {destinationAddress}
            </p>
          </div>
        </div>

        {/* Refund Bank Account */}
        <div className="bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-inner group/bank hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 group-hover/bank:scale-110 transition-transform">
                <Building2 className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Refund Bank</span>
            </div>
            <button 
              onClick={onChangeAccount} 
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors bg-primary/10 hover:bg-primary px-3 py-1.5 rounded-xl"
            >
              Change
            </button>
          </div>
          <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-3">
            <p className="font-black text-white text-base leading-tight">{bankData.bankName}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Account</p>
                <p className="text-sm font-mono text-white font-bold">{bankData.accountNumber}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Name</p>
                <p className="text-sm font-bold text-white truncate">{bankData.accountName}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2.5 bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse flex-shrink-0" />
            <p className="text-[10px] text-yellow-500/80 font-bold uppercase tracking-tight leading-tight">
              Used ONLY for safety if a transaction fails.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <button
            onClick={handleInitialize}
            disabled={isInitializingOrder}
            className="w-full futuristic-button bg-primary text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-[0_0_25px_rgba(100,150,255,0.25)] disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            {isInitializingOrder ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm & Pay
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>

      <TfaVerificationModal
        isOpen={tfaModalOpen}
        setIsOpen={setTfaModalOpen}
        onVerify={handleTfaVerify}
        isVerifying={isInitializingOrder}
        title="Confirm Order"
        description="Please confirm your details below. Any mistake may lead to permanent loss of funds."
      >
        <div className="bg-muted p-3 rounded-lg space-y-2 text-sm text-left">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground shrink-0">Receiving Wallet:</span>
            <span className="font-mono text-xs break-all text-right ml-4">{destinationAddress}</span>
          </div>
          <div className="flex justify-between border-b pb-2 pt-1">
            <span className="text-muted-foreground">Refund Bank:</span>
            <span className="font-mono text-right">{bankData?.bankName}</span>
          </div>
          <div className="flex justify-between border-b pb-2 pt-1">
            <span className="text-muted-foreground">Account No:</span>
            <span className="font-mono text-right">{bankData?.accountNumber}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-muted-foreground">Account Name:</span>
            <span className="font-medium text-right">{bankData?.accountName}</span>
          </div>
        </div>
      </TfaVerificationModal>
    </motion.div>
  )
}
