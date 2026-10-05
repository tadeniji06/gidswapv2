"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, CheckCircle2, Loader2, Search, Building2, Hash } from "lucide-react"
import { useBankVerificationStore } from "@/lib/bank-verification-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"

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

  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const digits = accountNumber.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-2xl shadow-sm p-1"
    >
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-foreground">Bank Verification</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Confirm your payout account to receive funds
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Building2 className="w-4 h-4 text-muted-foreground" /> Select Bank
          </label>
          <Dialog open={showDropdown} onOpenChange={setShowDropdown}>
            <DialogTrigger asChild>
              <button
                ref={triggerRef}
                disabled={isLoadingBanks}
                className="w-full flex items-center justify-between bg-background border border-input px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <span className={`text-sm ${selectedBank ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  {isLoadingBanks ? "Loading banks..." : selectedBank ? selectedBank.name : "Choose your bank"}
                </span>
                {isLoadingBanks ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} />
                )}
              </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[420px] bg-card border-border p-0 overflow-hidden rounded-2xl shadow-lg">
              <DialogHeader className="p-4 border-b border-border">
                <DialogTitle className="text-lg font-semibold text-foreground">Select Bank</DialogTitle>
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search bank name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                    className="w-full bg-background border border-input rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                </div>
              </DialogHeader>

              <div className="max-h-[50vh] overflow-y-auto custom-scrollbar p-2">
                {filteredBanks.length > 0 ? (
                  (() => {
                    const priorityNames = ["opay", "moniepoint", "kuda", "palmpay", "guaranty trust", "zenith", "access bank", "first bank", "united bank for africa", "uba"]
                    const popular = filteredBanks.filter(b => priorityNames.some(p => b.name.toLowerCase().includes(p)))
                    const others = filteredBanks.filter(b => !priorityNames.some(p => b.name.toLowerCase().includes(p)))

                    const renderBank = (bank: any) => (
                      <button
                        key={bank.code}
                        onClick={() => { setSelectedBank(bank); setShowDropdown(false); setSearchTerm("") }}
                        className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-muted/50 rounded-xl transition-colors text-left ${selectedBank?.code === bank.code ? "bg-primary/5" : ""}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-foreground">{bank.name[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-foreground text-sm font-medium block truncate">{bank.name}</span>
                        </div>
                        {selectedBank?.code === bank.code && (
                          <CheckCircle2 className="w-5 h-5 text-primary ml-auto flex-shrink-0" />
                        )}
                      </button>
                    )

                    return (
                      <>
                        {popular.length > 0 && (
                          <div className="px-3 py-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Popular Banks</p>
                          </div>
                        )}
                        {popular.map(renderBank)}
                        
                        {others.length > 0 && (
                          <div className="px-3 py-2 border-t border-border mt-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">All Banks</p>
                          </div>
                        )}
                        {others.map(renderBank)}
                      </>
                    )
                  })()
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    No banks match "{searchTerm}"
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Hash className="w-4 h-4 text-muted-foreground" /> Account Number
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
              className={`w-full bg-background border rounded-lg px-4 py-3 text-foreground text-lg tracking-widest placeholder:text-muted-foreground/50 placeholder:text-sm placeholder:tracking-normal outline-none transition-colors
                ${!selectedBank ? "opacity-50 cursor-not-allowed border-border" : "border-input hover:border-border focus:border-primary focus:ring-1 focus:ring-primary"}
                ${isVerified ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : ""}
              `}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {isVerifying && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              {isVerified && !isVerifying && (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {accountName && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg p-4"
            >
              <p className="text-emerald-800 dark:text-emerald-400 font-medium text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {accountName}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4"
            >
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-2">
          <Button
            onClick={onProceed}
            disabled={!isVerified}
            className="w-full fintech-button-primary py-6 text-lg"
          >
            {isVerified ? "Proceed" : "Verify to Continue"}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
