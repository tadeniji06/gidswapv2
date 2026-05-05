"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useOnrampStore } from "@/lib/onramp-store"
import { Button } from "@/src/components/ui/button"
import { Loader2, Copy, CheckCircle2, ShieldCheck, ExternalLink, AlertCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"

interface StatusCardProps {
  onReset: () => void
}

export function OnrampStatusCard({ onReset }: StatusCardProps) {
  const { status, sessionData, pollStatus, continueToFiat } = useOnrampStore()

  useEffect(() => {
    const interval = setInterval(() => {
      if (status !== "completed" && status !== "failed" && status !== "expired") {
        pollStatus()
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [status, pollStatus])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const renderContent = () => {
    switch (status) {
      case "ff_pending":
      case "ff_awaiting":
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Step 1: Send Crypto</h3>
              <p className="text-xs text-muted-foreground font-medium">
                Transfer exactly <span className="text-white font-bold">{sessionData?.cryptoLeg?.amount} {sessionData?.cryptoLeg?.currency}</span> on <span className="text-primary font-bold">{sessionData?.cryptoLeg?.network}</span>
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="bg-white p-3 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] relative group">
                <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <QRCodeSVG
                  value={sessionData?.cryptoLeg?.depositAddress || ""}
                  size={160}
                  level="H"
                  className="relative z-10"
                />
              </div>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-left group">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Deposit Address</label>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-mono text-white truncate break-all selection:bg-primary/30">
                  {sessionData?.cryptoLeg?.depositAddress}
                </p>
                <button 
                  onClick={() => copyToClipboard(sessionData?.cryptoLeg?.depositAddress)} 
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors shrink-0"
                >
                  <Copy className="w-4 h-4 text-primary" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 py-2">
              <div className="flex gap-1.5">
                {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-primary/80">Waiting for deposit...</span>
            </div>
          </div>
        )

      case "ff_converting":
        return (
          <div className="text-center py-12 space-y-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
              <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Converting Crypto</h3>
              <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                Deposit detected! Your funds are being converted to <span className="text-emerald-400 font-bold">Stablecoins</span> for the final payout.
              </p>
            </div>
          </div>
        )

      case "ff_done":
        return (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.1)]">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Stables Received!</h3>
              <p className="text-sm text-muted-foreground px-4">
                <span className="text-white font-bold">{sessionData?.cryptoLeg?.expectedStableAmount} {sessionData?.cryptoLeg?.convertingTo}</span> landed in your wallet.
              </p>
            </div>
            <button 
              onClick={() => continueToFiat()} 
              className="w-full futuristic-button bg-primary text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(100,150,255,0.25)]"
            >
              Continue to Fiat Payout →
            </button>
          </div>
        )

      case "pc_pending":
      case "pc_awaiting":
        return (
          <div className="space-y-6 text-center">
             <div className="space-y-2">
               <h3 className="text-xl font-black text-white uppercase tracking-tight">Step 2: Fiat Payout</h3>
               <p className="text-xs text-muted-foreground font-medium">
                 Send exactly <span className="text-white font-bold">{sessionData?.fiatLeg?.amountToSend} {sessionData?.fiatLeg?.token}</span> on <span className="text-primary font-bold">{sessionData?.fiatLeg?.network}</span>
               </p>
             </div>
             
             <div className="bg-black/40 border border-white/10 rounded-2xl p-5 text-left space-y-4">
               <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">PayCrest Settlement Address</label>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-mono text-white truncate break-all">{sessionData?.fiatLeg?.payCrestDepositAddress}</p>
                  <button onClick={() => copyToClipboard(sessionData?.fiatLeg?.payCrestDepositAddress)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <Copy className="w-4 h-4 text-primary" />
                  </button>
                </div>
               </div>
               <div className="h-px bg-white/5" />
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estimated Payout</span>
                 <span className="text-lg font-black text-emerald-400">₦{sessionData?.estimatedNGN?.toLocaleString()}</span>
               </div>
            </div>

            <div className="flex items-center justify-center gap-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-xs font-black uppercase tracking-widest text-primary/80">Awaiting Stables...</span>
            </div>
          </div>
        )

      case "pc_processing":
        return (
          <div className="text-center py-12 space-y-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full animate-pulse" />
              <Loader2 className="w-16 h-16 animate-spin text-emerald-400 relative z-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Sending Fiat</h3>
              <p className="text-sm text-muted-foreground">
                Settling <span className="text-emerald-400 font-bold">₦{sessionData?.estimatedNGN?.toLocaleString()}</span> to your bank account.
              </p>
            </div>
          </div>
        )

      case "completed":
        return (
          <div className="text-center py-10 space-y-8">
            <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-3xl animate-pulse" />
              <CheckCircle2 className="w-12 h-12 text-emerald-400 relative z-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Success!</h3>
              <p className="text-sm text-muted-foreground">Funds have landed in your bank account.</p>
            </div>
            <button 
              onClick={onReset} 
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            >
              Finish Session
            </button>
          </div>
        )

      case "failed":
      case "expired":
        return (
          <div className="text-center py-10 space-y-8">
            <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Order {status}</h3>
              <p className="text-sm text-muted-foreground px-6">{sessionData?.error?.message || "The session has timed out or failed."}</p>
            </div>
            <button onClick={onReset} className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
              Back to Home
            </button>
          </div>
        )

      default:
        return (
          <div className="text-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Loading Order State...</p>
          </div>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="glass-panel neon-border shadow-2xl rounded-3xl relative overflow-hidden"
    >
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="p-6 md:p-8">
        {/* Status display header */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              {sessionData?.statusLabel || "Processing"}
            </span>
          </div>
        </div>

        {renderContent()}

        {/* Footer Details */}
        <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
            <span>Session ID</span>
            <span className="font-mono">{sessionData?.sessionId}</span>
          </div>
          <div className="flex items-center justify-center gap-2 opacity-30">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="text-[8px] font-black uppercase tracking-widest">Protected by SecureSwap Protocol</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
