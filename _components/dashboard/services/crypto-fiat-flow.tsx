"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft, Loader2, BookUser, ShieldCheck, PlusCircle } from "lucide-react"
import { CryptoFiatSwapCard } from "./crypto-fiat/crypto-to-fiat-card"
import { OrderInitializationCard } from "./crypto-fiat/order-init-card"
import { BankVerificationCard } from "./crypto-fiat/bank-verification-card"
import { useCryptoFiatStore } from "@/lib/crypto-fiat-store"
import { useSavedAccountsStore, SavedAccount } from "@/lib/saved-accounts-store"
import { PendingPaymentCard } from "./crypto-fiat/pending-card"
import Cookies from "js-cookie"

// ─── Flow steps ────────────────────────────────────────────────
// "swap"         — enter amount
// "account"      — smart gateway: use saved OR go verify
// "verification" — bank verification (only shown if no saved account or user chooses new)
// "order"        — transaction details + initiate
// "payment"      — pending card / polling
type FlowStep = "swap" | "account" | "verification" | "order" | "payment"

// ─── Step breadcrumbs shown to the user ────────────────────────
const STEP_LABELS: Record<FlowStep, { title: string; subtitle: string }> = {
  swap:         { title: "Crypto to Fiat",    subtitle: "Convert your cryptocurrency to cash instantly" },
  account:      { title: "Payout Account",    subtitle: "Choose where to receive your funds" },
  verification: { title: "Verify Account",    subtitle: "Verify a new bank account" },
  order:        { title: "Initialize Order",  subtitle: "Provide transaction details to start" },
  payment:      { title: "Send Payment",      subtitle: "Send crypto to complete your order" },
}

function CryptoFiatFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("swap")
  const { paymentOrder } = useCryptoFiatStore()
  const {
    accounts,
    defaultAccount,
    isLoading: loadingAccounts,
    fetchAccounts,
  } = useSavedAccountsStore()

  const [checkedAccounts, setCheckedAccounts] = useState(false)

  // ── Fetch saved accounts once on mount ──────────────────────
  useEffect(() => {
    fetchAccounts().finally(() => setCheckedAccounts(true))
  }, [fetchAccounts])

  // ── Load saved account into the verifiedBank cookie ──────────
  // This allows order-init-card to pick it up exactly like a verified account
  const loadSavedAccountIntoCookie = useCallback((account: SavedAccount) => {
    const bankData = {
      bankName: account.bankName,
      bankCode: account.bankCode,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
    }
    Cookies.set("verifiedBank", JSON.stringify(bankData), { expires: 1 }) // 1 day
  }, [])

  // ── Handlers ─────────────────────────────────────────────────
  const handleSwapComplete = () => {
    setCurrentStep("account")
  }

  // Called from the account gateway — user chose a saved account
  const handleUseSavedAccount = (account: SavedAccount) => {
    loadSavedAccountIntoCookie(account)
    setCurrentStep("order")
  }

  // Called from the account gateway — user wants to use a new account
  const handleUseNewAccount = () => {
    Cookies.remove("verifiedBank")
    setCurrentStep("verification")
  }

  const handleVerificationComplete = () => {
    setCurrentStep("order")
  }

  const handleOrderComplete = () => {
    setCurrentStep("payment")
  }

  const handlePaymentTimeout = () => {
    setCurrentStep("swap")
  }

  const handleBack = () => {
    const backMap: Partial<Record<FlowStep, FlowStep>> = {
      account:      "swap",
      verification: "account",
      order:        "account",
    }
    const prev = backMap[currentStep]
    if (prev) setCurrentStep(prev)
  }

  const canGoBack = currentStep !== "swap" && currentStep !== "payment"

  return (
    <div className="min-h-screen p-2 sm:p-4">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="w-full max-w-lg sm:max-w-md mx-auto mb-6">
        {canGoBack && (
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 text-gray-400 hover:text-white p-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}

        <h1 className="text-2xl font-bold text-center text-gray-700 dark:text-gray-100 mb-2">
          {STEP_LABELS[currentStep].title}
        </h1>
        <p className="text-gray-400 text-center text-sm">
          {STEP_LABELS[currentStep].subtitle}
        </p>
      </div>

      {/* ── Flow ────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {/* Step 1 — Swap */}
          {currentStep === "swap" && (
            <CryptoFiatSwapCard onSwapComplete={handleSwapComplete} />
          )}

          {/* Step 2 — Account Gateway */}
          {currentStep === "account" && (
            <AccountGateway
              accounts={accounts}
              defaultAccount={defaultAccount}
              isLoading={loadingAccounts && !checkedAccounts}
              onUseSaved={handleUseSavedAccount}
              onUseNew={handleUseNewAccount}
            />
          )}

          {/* Step 3 — Verification (only reached via "Use new account") */}
          {currentStep === "verification" && (
            <BankVerificationCard onProceed={handleVerificationComplete} />
          )}

          {/* Step 4 — Order */}
          {currentStep === "order" && (
            <OrderInitializationCard
              onOrderComplete={handleOrderComplete}
              onChangAccount={() => setCurrentStep("account")}
            />
          )}

          {/* Step 5 — Payment Pending */}
          {currentStep === "payment" && paymentOrder && (
            <PendingPaymentCard
              paymentData={paymentOrder}
              onTimeout={handlePaymentTimeout}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Account Gateway — the smart "choose your account" screen
// ─────────────────────────────────────────────────────────────
interface AccountGatewayProps {
  accounts: SavedAccount[]
  defaultAccount: SavedAccount | null
  isLoading: boolean
  onUseSaved: (account: SavedAccount) => void
  onUseNew: () => void
}

function AccountGateway({
  accounts,
  defaultAccount,
  isLoading,
  onUseSaved,
  onUseNew,
}: AccountGatewayProps) {
  const [selected, setSelected] = useState<SavedAccount | null>(
    defaultAccount ?? accounts[0] ?? null
  )

  // Sync when accounts load
  useEffect(() => {
    setSelected(defaultAccount ?? accounts[0] ?? null)
  }, [defaultAccount, accounts])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-400">Checking saved accounts…</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {accounts.length > 0 ? (
        <>
          {/* Saved accounts list */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <BookUser className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Saved Accounts
              </span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {accounts.map((account) => {
                const isSelected = selected?._id === account._id
                return (
                  <button
                    key={account._id}
                    type="button"
                    onClick={() => setSelected(account)}
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {/* Selection indicator */}
                    <div
                      className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>

                    {/* Account details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                          {account.label}
                        </span>
                        {account.isDefault && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        {account.bankName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                        {account.accountNumber}
                        {" · "}
                        {account.accountName}
                      </p>
                      {account.returnAddress && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                          Refund: {account.returnAddress.slice(0, 10)}…{account.returnAddress.slice(-6)}
                        </p>
                      )}
                    </div>

                    {/* Verified badge */}
                    {isSelected && (
                      <ShieldCheck className="shrink-0 w-5 h-5 text-blue-500" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Primary CTA */}
          <Button
            onClick={() => selected && onUseSaved(selected)}
            disabled={!selected}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-base"
          >
            Continue with {selected?.label || "Selected Account"}
          </Button>

          {/* Secondary CTA */}
          <button
            type="button"
            onClick={onUseNew}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors py-2"
          >
            <PlusCircle className="w-4 h-4" />
            Use a different bank account
          </button>
        </>
      ) : (
        /* No saved accounts — nudge to verify */
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
            <BookUser className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
              No Saved Accounts
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Verify your bank account to receive your payout.
              You can save it after for faster future transactions.
            </p>
          </div>
          <Button
            onClick={onUseNew}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
          >
            Verify Bank Account
          </Button>
        </div>
      )}
    </div>
  )
}

export { CryptoFiatFlow }
export default CryptoFiatFlow
