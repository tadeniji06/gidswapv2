"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useCEXStore } from "@/lib/cex-store"
import { Copy, ExternalLink, Check, ChevronDown, ShieldCheck, Sparkles, Building2, Search, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

function ExchangeSelector({
  exchanges,
  selected,
  onSelect,
}: {
  exchanges: any[]
  selected: any
  onSelect: (e: any) => void
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        const dd = document.getElementById("cex-selector-dropdown")
        if (dd && !dd.contains(target)) setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handler)
    }
    return () => {
      document.removeEventListener("mousedown", handler)
    }
  }, [open])

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-black/30 border border-white/10 hover:border-primary/50 rounded-2xl px-5 py-4 transition-all group outline-none"
      >
        <div className="flex items-center gap-3">
          {selected ? (
            <>
              <img src={selected.logo} alt={selected.name} className="w-8 h-8 rounded-full ring-2 ring-white/10" />
              <div className="text-left">
                <span className="text-white font-black text-sm block leading-tight">{selected.name}</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Exchange Platform</span>
              </div>
            </>
          ) : (
            <span className="text-muted-foreground font-bold text-sm">Select an exchange</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="cex-selector-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 glass-panel border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[100]"
          >
            <div className="divide-y divide-white/5">
              {exchanges.map((exchange) => (
                <button
                  key={exchange.id}
                  onClick={() => { onSelect(exchange); setOpen(false) }}
                  className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-all text-left group"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white/5 shadow-inner"
                    style={{ backgroundColor: exchange.color + "20" }}
                  >
                    <img src={exchange.logo} alt={exchange.name} className="w-8 h-8 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-white text-sm">{exchange.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">UID: {exchange.uid}</p>
                  </div>
                  {selected?.id === exchange.id && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CexTransferFlow() {
  const { exchanges, selectedExchange, isLoading, error, selectExchange, copyUID, resetSelection } = useCEXStore()
  const [copied, setCopied] = useState(false)

  const handleCopyUID = async (uid: string) => {
    await copyUID(uid)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="w-full max-w-lg mx-auto mb-8 text-center">
        <h1 className="text-2xl font-black tracking-tight text-white uppercase">CEX Transfer</h1>
        <p className="text-muted-foreground text-sm mt-1 font-medium">Transfer funds between exchange platforms</p>
      </div>

      <div className="w-full max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {selectedExchange ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="glass-panel neon-border shadow-2xl rounded-3xl relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="p-6 md:p-8 space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5 shadow-inner">
                      <img src={selectedExchange.logo} alt={selectedExchange.name} className="w-10 h-10 rounded-full" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">{selectedExchange.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Exchange Profile</p>
                    </div>
                  </div>
                  <button onClick={resetSelection} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl">
                    Change
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-black/40 border border-white/10 rounded-3xl p-6 shadow-inner relative group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">Your {selectedExchange.name} UID</label>
                    <div className="flex items-center gap-4">
                      <code className="flex-1 text-2xl font-mono text-white tracking-wider break-all">{selectedExchange.uid}</code>
                      <button
                        onClick={() => handleCopyUID(selectedExchange.uid)}
                        disabled={isLoading}
                        className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          copied ? "bg-emerald-500 text-white" : "bg-primary text-white hover:scale-110 shadow-[0_0_20px_rgba(100,150,255,0.3)]"
                        }`}
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                        <ExternalLink className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Final Step: Verification</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          After copying your UID, you will be redirected to WhatsApp. Send your proof of payment to our support team to complete the settlement.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 opacity-40">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Secured via GidSwap Direct</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <ExchangeSelector
                exchanges={exchanges}
                selected={null}
                onSelect={selectExchange}
              />

              <div className="glass-panel neon-border rounded-3xl p-8 space-y-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">How it works</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Select your exchange, copy the provided UID, and chat with us on WhatsApp to finish.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Active Hours</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      9am – 6pm (Transactions completed within 30 mins).
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
