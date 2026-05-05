"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check, Loader2, Search, ArrowLeft, Building2, Wallet, ShieldCheck, CheckCircle2 } from "lucide-react"
import { useBankVerificationStore } from "@/lib/bank-verification-store"
import { useOnrampStore } from "@/lib/onramp-store"
import { toast } from "sonner"

interface DetailsCardProps {
  onBack: () => void
  onSuccess: () => void
}

function BankSelector({
  banks,
  selected,
  onSelect,
  isLoading,
}: {
  banks: any[]
  selected: any
  onSelect: (b: any) => void
  isLoading: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const triggerRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        const dd = document.getElementById("bank-selector-dropdown-onramp")
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

  const filtered = banks.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        disabled={isLoading}
        className="w-full flex items-center justify-between bg-black/30 border border-white/10 hover:border-primary/50 rounded-2xl px-4 py-3.5 transition-all outline-none group"
      >
        <span className={`text-sm font-bold truncate ${selected ? "text-white" : "text-muted-foreground"}`}>
          {isLoading ? "Loading banks..." : selected ? selected.name : "Select your bank"}
        </span>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="bank-selector-dropdown-onramp"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 glass-panel border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[9999] backdrop-blur-3xl -translate-x-3"
          >
            <div className="p-2 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search bank..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-xs text-white placeholder:text-muted-foreground/40"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-white/5">
              {filtered.length > 0 ? (
                filtered.map((bank) => (
                  <button
                    key={bank.code}
                    onClick={() => { onSelect(bank); setOpen(false); setSearch("") }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate">{bank.name}</span>
                    {selected?.code === bank.code && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-xs text-muted-foreground">No banks found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function OnrampDetailsCard({ onBack, onSuccess }: DetailsCardProps) {
  const {
    banks,
    selectedBank,
    accountNumber,
    accountName,
    isLoadingBanks,
    isVerifying,
    isVerified,
    error: bankError,
    fetchBanks,
    setSelectedBank,
    setAccountNumber,
  } = useBankVerificationStore()

  const { walletAddress, setField, initiateOnramp, isInitiating } = useOnrampStore()

  useEffect(() => {
    fetchBanks()
  }, [fetchBanks])

  const handleSubmit = async () => {
    if (!isVerified || !walletAddress || !selectedBank) {
      toast.error("Please fill in all required fields")
      return
    }

    setField("bankCode", selectedBank.code)
    setField("accountNumber", accountNumber)
    setField("accountName", accountName || "")

    const success = await initiateOnramp()
    if (success) {
      toast.success("Order Created!")
      onSuccess()
    }
  }

  const isFormValid = isVerified && walletAddress && walletAddress.length > 10

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="glass-panel neon-border shadow-2xl rounded-3xl relative"
    >
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8 space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-black tracking-tight text-white uppercase">Payout Details</h3>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Configure your destination</p>
        </div>

        {/* Wallet Address Input */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
            <Wallet className="w-3 h-3 text-primary" /> Receiving Wallet Address
          </label>
          <div className="relative group">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setField("walletAddress", e.target.value)}
              placeholder="0x..."
              className="w-full bg-black/30 border border-white/10 group-focus-within:border-primary/50 rounded-2xl px-4 py-4 text-white text-sm font-mono outline-none transition-all placeholder:text-muted-foreground/30 placeholder:font-sans"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground font-medium ml-1">Tokens will be sent here first after network confirmation.</p>
        </div>

        <div className="h-px bg-white/5 mx-2" />

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
            <Building2 className="w-3 h-3 text-emerald-400" /> Naira Payout Bank
          </label>
          
          <BankSelector
            banks={banks}
            selected={selectedBank}
            onSelect={setSelectedBank}
            isLoading={isLoadingBanks}
          />

          <div className="relative group">
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 10)
                setAccountNumber(val)
              }}
              placeholder="10-digit account number"
              className="w-full bg-black/30 border border-white/10 group-focus-within:border-primary/50 rounded-2xl px-4 py-4 text-white text-sm font-mono outline-none transition-all placeholder:text-muted-foreground/30 placeholder:font-sans"
              maxLength={10}
              disabled={!selectedBank}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isVerifying && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              {isVerified && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
            </div>
          </div>

          <AnimatePresence>
            {isVerified && accountName && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/70">Verified Account</p>
                    <p className="text-sm font-black text-white truncate">{accountName}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {bankError && (
            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 text-center">
              {bankError}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isFormValid || isInitiating}
          className="w-full futuristic-button bg-primary text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(100,150,255,0.25)] disabled:opacity-40 disabled:shadow-none transition-all hover:scale-[1.01]"
        >
          {isInitiating ? (
            <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin"/> Processing...</span>
          ) : (
            "Initiate On-Ramp Order"
          )}
        </button>
      </div>
    </motion.div>
  )
}
