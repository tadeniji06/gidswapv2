"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Loader2, ArrowLeft, PlusCircle, ShieldCheck,
  Building2, Wallet, FileText, Sparkles, ArrowRight
} from "lucide-react"
import { useCryptoFiatStore } from "@/lib/crypto-fiat-store"
import { useSavedAccountsStore } from "@/lib/saved-accounts-store"
import Cookies from "js-cookie"
import { toast } from "sonner"

interface OrderInitializationCardProps {
  onBack?: () => void
  onNext?: () => void
  onOrderComplete?: () => void
  onChangAccount?: () => void
}

const LP_FEE_PERCENT = 0.01

const MEMO_SUGGESTIONS = ["Personal", "Purchase", "Bills", "Groceries", "Transfer", "Investment"]

export function OrderInitializationCard({
  onBack, onNext, onOrderComplete, onChangAccount,
}: OrderInitializationCardProps) {
  const [memo, setMemo] = useState("")
  const [returnAddress, setReturnAddress] = useState("")
  const [errors, setErrors] = useState<{ memo?: string; returnAddress?: string }>({})
  const [saveThisAccount, setSaveThisAccount] = useState(false)
  const [saveLabel, setSaveLabel] = useState("My Account")

  const { saveAccount, isSaving, accounts } = useSavedAccountsStore()
  const { selectedToken, selectedCurrency, tokenAmount, quote, isInitializingOrder, initializeOrder } = useCryptoFiatStore()

  const verifiedBank = Cookies.get("verifiedBank")
  const bankData = verifiedBank ? JSON.parse(verifiedBank) : null
  const { accountNumber, accountName, bankName, bankCode } = bankData || {}

  const alreadySaved = accounts.some((a) => a.accountNumber === accountNumber && a.bankCode === bankCode)

  useEffect(() => {
    if (!returnAddress) {
      const saved = accounts.find((a) => a.accountNumber === accountNumber && a.bankCode === bankCode)
      if (saved?.returnAddress) setReturnAddress(saved.returnAddress)
    }
  }, [accounts, accountNumber, bankCode, returnAddress])

  const lpFee = quote ? quote.total * LP_FEE_PERCENT : 0
  const netTotal = quote ? quote.total - lpFee : 0

  const validateForm = () => {
    const newErrors: { memo?: string; returnAddress?: string } = {}
    if (!memo.trim()) newErrors.memo = "Remarks are required"
    if (!returnAddress.trim()) newErrors.returnAddress = "Refund wallet address is required"
    else if (!/^0x[a-fA-F0-9]{40}$/.test(returnAddress)) newErrors.returnAddress = "Invalid EVM address (must start with 0x)"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    if (!bankData) { toast.error("Missing bank details — go back and select an account"); return }

    const payload = { institution: bankCode, accountIdentifier: accountNumber, accountName }
    const success = await initializeOrder(memo, returnAddress, payload)
    if (!success) return

    if (saveThisAccount && !alreadySaved && bankCode && accountNumber && accountName && bankName) {
      const saved = await saveAccount({ label: saveLabel || "My Account", bankName, bankCode, accountNumber, accountName, returnAddress: returnAddress || undefined })
      if (saved) toast.success(`Account "${saveLabel}" saved!`)
    }

    if (onOrderComplete) onOrderComplete()
    else if (onNext) onNext()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-panel neon-border shadow-2xl rounded-3xl relative overflow-hidden"
    >
      {/* Ambient glows */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight text-white">Finalize Order</h3>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Almost there — review & confirm</p>
          </div>
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl font-bold">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-primary" /> Order Summary
          </p>
          {[
            { label: "Sending", value: `${tokenAmount} ${selectedToken?.symbol}`, highlight: false },
            { label: "LP Fee (1%)", value: `-${selectedCurrency?.symbol}${lpFee.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, highlight: false },
            { label: "You receive", value: `${selectedCurrency?.symbol}${netTotal.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, highlight: true },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`flex justify-between items-center ${highlight ? "pt-3 border-t border-white/5" : ""}`}>
              <span className="text-muted-foreground text-sm font-medium">{label}</span>
              <span className={`font-black text-sm tabular-nums ${highlight ? "text-emerald-400 text-base" : "text-white"}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Bank Account */}
        {bankData && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{bankName}</p>
                <p className="text-muted-foreground text-xs font-mono mt-0.5">{accountNumber} · {accountName}</p>
              </div>
            </div>
            {onChangAccount && (
              <button onClick={onChangAccount} className="text-xs text-primary hover:text-primary/80 font-black uppercase tracking-widest bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl transition-all">
                Change
              </button>
            )}
          </div>
        )}

        {/* Memo */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
            <FileText className="w-3.5 h-3.5 text-primary" /> Remarks *
          </label>
          <input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="e.g. Personal transfer"
            className={`w-full bg-black/30 border rounded-2xl px-4 py-3.5 text-white text-sm font-medium placeholder:text-muted-foreground/40 outline-none transition-all duration-200
              ${errors.memo ? "border-red-500/60 focus:ring-red-500/10" : "border-white/10 hover:border-white/20 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"}`}
          />
          <div className="flex flex-wrap gap-2">
            {MEMO_SUGGESTIONS.map((s) => (
              <button
                key={s} type="button" onClick={() => setMemo(s)}
                className={`px-3 py-1.5 text-xs rounded-xl font-bold transition-all duration-200 ${
                  memo === s
                    ? "bg-primary/30 border-primary/50 text-white border"
                    : "bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-muted-foreground hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {errors.memo && <p className="text-xs text-red-400 font-bold">{errors.memo}</p>}
        </div>

        {/* Refund Address */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
            <Wallet className="w-3.5 h-3.5 text-primary" /> Refund Wallet Address *
          </label>
          <input
            value={returnAddress}
            onChange={(e) => setReturnAddress(e.target.value)}
            placeholder="0x..."
            className={`w-full bg-black/30 border rounded-2xl px-4 py-3.5 text-white text-sm font-mono placeholder:text-muted-foreground/40 placeholder:font-sans outline-none transition-all duration-200
              ${errors.returnAddress ? "border-red-500/60 focus:ring-red-500/10" : "border-white/10 hover:border-white/20 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"}`}
          />
          {errors.returnAddress
            ? <p className="text-xs text-red-400 font-bold">{errors.returnAddress}</p>
            : <p className="text-xs text-muted-foreground font-medium">Crypto is sent here if anything goes wrong. Never use an exchange address.</p>
          }
        </div>

        {/* Save account */}
        {!alreadySaved && bankData && (
          <div className={`rounded-2xl border border-dashed p-4 space-y-3 transition-all ${saveThisAccount ? "border-primary/40 bg-primary/5" : "border-white/10"}`}>
            <button
              type="button" onClick={() => setSaveThisAccount(!saveThisAccount)}
              className="flex items-center gap-2.5 text-sm font-bold text-muted-foreground hover:text-white transition-colors w-full"
            >
              <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${saveThisAccount ? "border-primary bg-primary" : "border-white/20"}`}>
                {saveThisAccount && <PlusCircle className="w-3 h-3 text-white" />}
              </div>
              Save this account for next time
            </button>
            <AnimatePresence>
              {saveThisAccount && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest block mb-2">Nickname (optional)</label>
                  <input
                    value={saveLabel}
                    onChange={(e) => setSaveLabel(e.target.value)}
                    placeholder="e.g. GTB Personal"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isInitializingOrder || isSaving || !memo.trim() || !returnAddress.trim()}
          className="w-full futuristic-button bg-primary text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-[0_0_25px_rgba(100,150,255,0.25)] disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        >
          {isInitializingOrder || isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isInitializingOrder ? "Initializing Order..." : "Saving Account..."}
            </>
          ) : (
            <>
              Initialize Order
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-2 opacity-40">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Non-custodial · Secured by PayCrest</span>
        </div>
      </div>
    </motion.div>
  )
}
