"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, CheckCircle2, Loader2, Search, Building2, Hash, ShieldCheck, X } from "lucide-react"
import { useBankVerificationStore } from "@/lib/bank-verification-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog"

interface BankVerificationCardProps {
  onProceed: () => void
}

export function BankVerificationCard({ onProceed }: BankVerificationCardProps) {
  const {
    banks, selectedBank, accountNumber, accountName,
    isLoadingBanks, isVerifying, isVerified, error,
    fetchBanks, setSelectedBank, setAccountNumber, reset,
  } = useBankVerificationStore()

  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    fetchBanks()
    return () => reset()
  }, [fetchBanks, reset])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        const dd = document.getElementById("bank-dropdown")
        if (dd && !dd.contains(target)) setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handler)
    }
    return () => {
      document.removeEventListener("mousedown", handler)
    }
  }, [showDropdown])

  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const digits = accountNumber.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="glass-panel neon-border rounded-3xl relative shadow-2xl"
    >
      {/* Ambient glows */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8 space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-xl font-black tracking-tight text-white">Bank Verification</h3>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">
            Confirm your payout account
          </p>
        </div>

        {/* Bank Selector */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
            <Building2 className="w-3.5 h-3.5 text-primary" /> Select Bank
          </label>
          <div className="relative">
            <Dialog open={showDropdown} onOpenChange={setShowDropdown}>
              <DialogTrigger asChild>
                <button
                  disabled={isLoadingBanks}
                  className={`w-full flex items-center justify-between bg-black/30 border px-4 py-3.5 rounded-2xl transition-all duration-200 text-left active:scale-[0.99] shadow-lg
                    ${showDropdown ? "border-primary/60 bg-black/40 shadow-[0_0_0_3px_rgba(100,150,255,0.1)]" : "border-white/10 hover:border-white/20"}`}
                >
                  <span className={`text-sm font-semibold ${selectedBank ? "text-white" : "text-muted-foreground"}`}>
                    {isLoadingBanks ? "Loading banks..." : selectedBank ? selectedBank.name : "Choose your bank"}
                  </span>
                  {isLoadingBanks
                    ? <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    : <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} />
                  }
                </button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[420px] bg-[#0d0e12] border-white/10 p-0 overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] outline-none">
                <DialogHeader className="p-6 pb-2 border-b border-white/5">
                  <DialogTitle className="text-xl font-black text-white">Select Bank</DialogTitle>
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search bank name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-all shadow-inner"
                    />
                  </div>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2 space-y-1">
                  {filteredBanks.length > 0 ? (
                    filteredBanks.map((bank) => (
                      <button
                        key={bank.code}
                        onClick={() => { setSelectedBank(bank); setShowDropdown(false); setSearchTerm("") }}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/5 rounded-2xl transition-all text-left group ${selectedBank?.code === bank.code ? "bg-primary/20 border border-primary/20" : "border border-transparent"}`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-lg ring-1 ring-white/5">
                          <span className="text-sm font-black text-primary">{bank.name[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-white text-base font-black tracking-tight block truncate">{bank.name}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Verified Institution</span>
                        </div>
                        {selectedBank?.code === bank.code && (
                          <CheckCircle2 className="w-5 h-5 text-primary ml-auto flex-shrink-0" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="py-12 text-center text-muted-foreground text-sm font-medium italic">
                      No banks match "{searchTerm}"
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Account Number Input */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
            <Hash className="w-3.5 h-3.5 text-primary" /> Account Number
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter 10-digit account number"
              maxLength={10}
              disabled={!selectedBank}
              className={`w-full bg-black/30 border rounded-2xl px-4 py-3.5 text-white text-lg font-mono tracking-widest placeholder:text-muted-foreground/40 placeholder:text-sm placeholder:tracking-normal outline-none transition-all duration-200
                ${!selectedBank ? "opacity-40 cursor-not-allowed border-white/5" : "border-white/10 hover:border-white/20 focus:border-primary/60 focus:ring-4 focus:ring-primary/10 focus:bg-black/40"}
                ${isVerified ? "border-emerald-500/60 bg-emerald-500/5" : ""}
              `}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {isVerifying && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              {isVerified && !isVerifying && (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              )}
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-200 ${
                    i < digits
                      ? isVerified ? "w-3 bg-emerald-500" : "w-3 bg-primary"
                      : "w-2 bg-white/10"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-black text-muted-foreground tabular-nums">{digits}/10</span>
          </div>
        </div>

        {/* Account verified */}
        <AnimatePresence>
          {accountName && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-0.5">Verified ✓</p>
                <p className="text-white font-bold text-sm">{accountName}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4"
            >
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <button
          onClick={onProceed}
          disabled={!isVerified}
          className={`w-full py-5 px-4 rounded-2xl font-black tracking-widest uppercase text-sm transition-all duration-300 ${
            isVerified
              ? "futuristic-button bg-primary text-white shadow-[0_0_20px_rgba(100,150,255,0.25)] hover:scale-[1.02]"
              : "bg-white/5 border border-white/5 text-muted-foreground cursor-not-allowed"
          }`}
        >
          {isVerified ? "Proceed to Order →" : "Complete Verification to Continue"}
        </button>
      </div>
    </motion.div>
  )
}
