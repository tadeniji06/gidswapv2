"use client"

import { useState, useEffect } from "react"
import { useCryptoFiatStore } from "@/lib/crypto-fiat-store"
import { useSavedAccountsStore } from "@/lib/saved-accounts-store"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import {
  Loader2,
  ArrowLeft,
  PlusCircle,
  ShieldCheck,
} from "lucide-react"
import Cookies from "js-cookie"
import { toast } from "sonner"

interface OrderInitializationCardProps {
  onBack?: () => void
  onNext?: () => void
  onOrderComplete?: () => void
  /** Called when user wants to switch to a different bank account */
  onChangAccount?: () => void
}

const LP_FEE_PERCENT = 0.01

export function OrderInitializationCard({
  onBack,
  onNext,
  onOrderComplete,
  onChangAccount,
}: OrderInitializationCardProps) {
  const [memo, setMemo] = useState("")
  const [returnAddress, setReturnAddress] = useState("")
  const [errors, setErrors] = useState<{ memo?: string; returnAddress?: string }>({})
  const [saveThisAccount, setSaveThisAccount] = useState(false)
  const [saveLabel, setSaveLabel] = useState("My Account")

  const { saveAccount, isSaving, accounts } = useSavedAccountsStore()
  const { selectedToken, selectedCurrency, tokenAmount, quote, isInitializingOrder, initializeOrder } =
    useCryptoFiatStore()

  // Bank data from cookie (set either by verification flow or by AccountGateway loading a saved account)
  const verifiedBank = Cookies.get("verifiedBank")
  const bankData = verifiedBank ? JSON.parse(verifiedBank) : null
  const { accountNumber, accountName, bankName, bankCode } = bankData || {}

  // If this exact account is already saved, don't offer to save it again
  const alreadySaved = accounts.some(
    (a) => a.accountNumber === accountNumber && a.bankCode === bankCode
  )

  // Pre-fill returnAddress if a saved account carrying one was loaded
  useEffect(() => {
    if (!returnAddress) {
      const saved = accounts.find(
        (a) => a.accountNumber === accountNumber && a.bankCode === bankCode
      )
      if (saved?.returnAddress) {
        setReturnAddress(saved.returnAddress)
      }
    }
  }, [accounts, accountNumber, bankCode, returnAddress])

  const lpFee = quote ? quote.total * LP_FEE_PERCENT : 0
  const netTotal = quote ? quote.total - lpFee : 0

  const validateForm = () => {
    const newErrors: { memo?: string; returnAddress?: string } = {}
    if (!memo.trim()) newErrors.memo = "Remarks are required"
    if (!returnAddress.trim()) {
      newErrors.returnAddress = "Refund wallet address is required"
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(returnAddress)) {
      newErrors.returnAddress = "Invalid EVM wallet address (must start with 0x)"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInitializeOrder = async () => {
    if (!validateForm()) return
    if (!bankData) {
      toast.error("Missing bank details — please go back and select an account")
      return
    }

    const payload = {
      institution: bankCode,
      accountIdentifier: accountNumber,
      accountName: accountName,
    }

    const success = await initializeOrder(memo, returnAddress, payload)
    if (!success) return

    // Optionally save the account for next time
    if (saveThisAccount && !alreadySaved && bankCode && accountNumber && accountName && bankName) {
      const saved = await saveAccount({
        label: saveLabel || "My Account",
        bankName,
        bankCode,
        accountNumber,
        accountName,
        returnAddress: returnAddress || undefined,
      })
      if (saved) toast.success(`Account "${saveLabel}" saved for future transactions!`)
    }

    if (onOrderComplete) onOrderComplete()
    else if (onNext) onNext()
  }

  return (
    <Card className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">
          Initialize Order
        </CardTitle>
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-5">
        {/* ── Order Summary ──────────────────────────────────── */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            Order Summary
          </h3>
          {[
            ["Amount", `${tokenAmount} ${selectedToken?.symbol}`],
            ["LP Fee", `${lpFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${selectedCurrency?.code}`],
            ["You Receive", `${netTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${selectedCurrency?.code}`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{label}</span>
              <span className="font-medium text-gray-900 dark:text-white">{value}</span>
            </div>
          ))}
        </div>

        {/* ── Active Bank Account ────────────────────────────── */}
        {bankData && (
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/15 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {bankName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                    {accountNumber} · {accountName}
                  </p>
                </div>
              </div>
              {/* Allow switching account */}
              {onChangAccount && (
                <button
                  type="button"
                  onClick={onChangAccount}
                  className="shrink-0 text-xs text-blue-500 hover:text-blue-400 font-medium transition-colors"
                >
                  Change
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Remarks / Memo ─────────────────────────────────── */}
        <div className="space-y-2">
          <Label htmlFor="memo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Remarks *
          </Label>
          <Input
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="e.g. Personal transfer"
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
          />
          <div className="flex flex-wrap gap-2 pt-1">
            {["Personal", "Purchase", "Bills", "Groceries", "Transfer"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setMemo(s)}
                className="px-3 py-1 text-xs rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition"
              >
                {s}
              </button>
            ))}
          </div>
          {errors.memo && <p className="text-xs text-red-500">{errors.memo}</p>}
        </div>

        {/* ── Refund Wallet Address ─────────────────────────── */}
        <div className="space-y-2">
          <Label htmlFor="returnAddress" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Refund Wallet Address *
          </Label>
          <Input
            id="returnAddress"
            value={returnAddress}
            onChange={(e) => setReturnAddress(e.target.value)}
            placeholder="0x…"
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm"
          />
          {errors.returnAddress && (
            <p className="text-xs text-red-500">{errors.returnAddress}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tokens are refunded here if anything goes wrong. Do not use an exchange address.
          </p>
        </div>

        {/* ── Save account for next time (only if not already saved) ── */}
        {!alreadySaved && bankData && (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-3.5 space-y-2">
            <button
              type="button"
              onClick={() => setSaveThisAccount(!saveThisAccount)}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <PlusCircle
                className={`h-4 w-4 flex-shrink-0 ${
                  saveThisAccount ? "text-blue-500" : "text-gray-400"
                }`}
              />
              {saveThisAccount
                ? "Will save this account after order"
                : "Save this account for next time"}
            </button>

            {saveThisAccount && (
              <div className="pt-1">
                <Label htmlFor="saveLabel" className="text-xs text-gray-500 dark:text-gray-400">
                  Nickname (optional)
                </Label>
                <Input
                  id="saveLabel"
                  value={saveLabel}
                  onChange={(e) => setSaveLabel(e.target.value)}
                  placeholder="e.g. GTB Personal"
                  className="mt-1 h-8 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                />
              </div>
            )}
          </div>
        )}

        {/* ── Submit ────────────────────────────────────────── */}
        <Button
          onClick={handleInitializeOrder}
          disabled={isInitializingOrder || isSaving || !memo.trim() || !returnAddress.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl disabled:opacity-60"
        >
          {isInitializingOrder ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Initializing Order…
            </>
          ) : (
            "Initialize Order"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
