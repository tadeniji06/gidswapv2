"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Loader2, ArrowLeft, PlusCircle, Building2, Wallet, FileText, ArrowRight
} from "lucide-react"
import { useCryptoFiatStore } from "@/lib/crypto-fiat-store"
import { useSavedAccountsStore } from "@/lib/saved-accounts-store"
import Cookies from "js-cookie"
import { toast } from "sonner"
import { Button } from "@/src/components/ui/button"

interface OrderInitializationCardProps {
  onBack?: () => void
  onNext?: () => void
  onOrderComplete?: () => void
  onChangAccount?: () => void
}

const LP_FEE_PERCENT = 0.01
const MEMO_SUGGESTIONS = ["Personal", "Transfer", "Bills"]

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
    const success = await initializeOrder(memo, returnAddress, payload, "")
    if (!success) return

    if (saveThisAccount && !alreadySaved && bankCode && accountNumber && accountName && bankName) {
      const saved = await saveAccount({ label: saveLabel || "My Account", bankName, bankCode, accountNumber, accountName, returnAddress: returnAddress || undefined, tfaToken: "" })
      if (saved) toast.success(`Account "${saveLabel}" saved!`)
    }

    if (onOrderComplete) onOrderComplete()
    else if (onNext) onNext()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-2xl shadow-sm p-1"
    >
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Finalize Order</h3>
            <p className="text-muted-foreground text-sm mt-1">Review & confirm your details</p>
          </div>
          {onBack && (
            <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Summary</p>
          {[
            { label: "Sending", value: `${tokenAmount} ${selectedToken?.symbol}`, highlight: false },
            { label: "Provider Fee (1%)", value: `-${selectedCurrency?.symbol}${lpFee.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, highlight: false },
            { label: "You receive", value: `${selectedCurrency?.symbol}${netTotal.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, highlight: true },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`flex justify-between items-center ${highlight ? "pt-3 border-t border-border mt-3" : ""}`}>
              <span className="text-muted-foreground text-sm">{label}</span>
              <span className={`font-medium ${highlight ? "text-foreground font-semibold" : "text-foreground"}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Bank Account */}
        {bankData && (
          <div className="bg-background border border-border rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-foreground font-medium text-sm">{bankName}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{accountNumber} · {accountName}</p>
              </div>
            </div>
            {onChangAccount && (
              <button onClick={onChangAccount} className="text-xs font-medium text-primary hover:underline">
                Change
              </button>
            )}
          </div>
        )}

        {/* Memo */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FileText className="w-4 h-4 text-muted-foreground" /> Description *
          </label>
          <input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Select reason for this transaction"
            className={`w-full bg-background border rounded-lg px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground/50 outline-none transition-colors
              ${errors.memo ? "border-red-300 focus:ring-1 focus:ring-red-500 focus:border-red-500" : "border-input hover:border-border focus:border-primary focus:ring-1 focus:ring-primary"}`}
          />
          <div className="flex flex-wrap gap-2 pt-1">
            {MEMO_SUGGESTIONS.map((s) => (
              <button
                key={s} type="button" onClick={() => setMemo(s)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  memo === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {errors.memo && <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errors.memo}</p>}
        </div>

        {/* Refund Address */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Wallet className="w-4 h-4 text-muted-foreground" /> Refund Wallet Address *
          </label>
          <input
            value={returnAddress}
            onChange={(e) => setReturnAddress(e.target.value)}
            placeholder="0x..."
            className={`w-full bg-background border rounded-lg px-4 py-3 text-foreground text-sm font-mono placeholder:text-muted-foreground/50 placeholder:font-sans outline-none transition-colors
              ${errors.returnAddress ? "border-red-300 focus:ring-1 focus:ring-red-500 focus:border-red-500" : "border-input hover:border-border focus:border-primary focus:ring-1 focus:ring-primary"}`}
          />
          {errors.returnAddress
            ? <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errors.returnAddress}</p>
            : <p className="text-xs text-muted-foreground">Crypto is returned here if anything goes wrong. Never use an exchange address.</p>
          }
        </div>

        {/* Save account */}
        {!alreadySaved && bankData && (
          <div className={`rounded-xl border p-4 space-y-3 transition-colors ${saveThisAccount ? "border-primary bg-primary/5" : "border-border bg-background"}`}>
            <button
              type="button" onClick={() => setSaveThisAccount(!saveThisAccount)}
              className="flex items-center gap-3 text-sm font-medium text-foreground w-full"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${saveThisAccount ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background"}`}>
                {saveThisAccount && <PlusCircle className="w-3 h-3" />}
              </div>
              Save this account for next time
            </button>
            <AnimatePresence>
              {saveThisAccount && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <label className="text-xs text-muted-foreground font-medium block mb-1">Nickname (optional)</label>
                  <input
                    value={saveLabel}
                    onChange={(e) => setSaveLabel(e.target.value)}
                    placeholder="e.g. GTB Personal"
                    className="w-full bg-background border border-input rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Submit */}
        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={isInitializingOrder || isSaving || !memo.trim() || !returnAddress.trim()}
            className="w-full fintech-button-primary py-6 text-lg"
          >
            {isInitializingOrder || isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {isInitializingOrder ? "Initializing..." : "Saving..."}
              </>
            ) : (
              <>
                Initialize Order
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
