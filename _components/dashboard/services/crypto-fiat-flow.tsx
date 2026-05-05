"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Loader2, BookUser, ShieldCheck, PlusCircle, ChevronRight } from "lucide-react"
import { CryptoFiatSwapCard } from "./crypto-fiat/crypto-to-fiat-card"
import { OrderInitializationCard } from "./crypto-fiat/order-init-card"
import { BankVerificationCard } from "./crypto-fiat/bank-verification-card"
import { useCryptoFiatStore } from "@/lib/crypto-fiat-store"
import { useSavedAccountsStore, SavedAccount } from "@/lib/saved-accounts-store"
import { PendingPaymentCard } from "./crypto-fiat/pending-card"
import Cookies from "js-cookie"

type FlowStep = "swap" | "account" | "verification" | "order" | "payment"

const STEP_LABELS: Record<FlowStep, { title: string; subtitle: string }> = {
  swap:         { title: "Off-Ramp",          subtitle: "Convert crypto to fiat instantly" },
  account:      { title: "Payout Account",    subtitle: "Choose where to receive your funds" },
  verification: { title: "Verify Account",    subtitle: "Verify a new bank account" },
  order:        { title: "Finalize Order",    subtitle: "Provide transaction details to start" },
  payment:      { title: "Payment Pending",   subtitle: "Complete your bank transfer" },
}

// Step progress indicator
const STEPS: FlowStep[] = ["swap", "account", "order", "payment"]

function StepDots({ current }: { current: FlowStep }) {
  const idx = STEPS.indexOf(current)
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`h-1.5 rounded-full transition-all duration-500 ${
            i < idx ? "w-6 bg-primary" :
            i === idx ? "w-8 bg-primary shadow-[0_0_8px_rgba(100,150,255,0.6)]" :
            "w-3 bg-white/10"
          }`} />
        </div>
      ))}
    </div>
  )
}

function CryptoFiatFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("swap")
  const { paymentOrder } = useCryptoFiatStore()
  const { accounts, defaultAccount, isLoading: loadingAccounts, fetchAccounts } = useSavedAccountsStore()
  const [checkedAccounts, setCheckedAccounts] = useState(false)

  useEffect(() => {
    fetchAccounts().finally(() => setCheckedAccounts(true))
  }, [fetchAccounts])

  const loadSavedAccountIntoCookie = useCallback((account: SavedAccount) => {
    Cookies.set("verifiedBank", JSON.stringify({
      bankName: account.bankName,
      bankCode: account.bankCode,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
    }), { expires: 1 })
  }, [])

  const handleSwapComplete    = () => setCurrentStep("account")
  const handleUseSavedAccount = (account: SavedAccount) => { loadSavedAccountIntoCookie(account); setCurrentStep("order") }
  const handleUseNewAccount   = () => { Cookies.remove("verifiedBank"); setCurrentStep("verification") }
  const handleVerificationComplete = () => setCurrentStep("order")
  const handleOrderComplete   = () => setCurrentStep("payment")
  const handleNewTransaction  = () => setCurrentStep("swap")

  const handleBack = () => {
    const backMap: Partial<Record<FlowStep, FlowStep>> = {
      account: "swap", verification: "account", order: "account",
    }
    const prev = backMap[currentStep]
    if (prev) setCurrentStep(prev)
  }

  const canGoBack = currentStep !== "swap" && currentStep !== "payment"

  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Header */}
      <div className="w-full max-w-lg mx-auto mb-2">
        {/* Back button */}
        {canGoBack && (
          <button onClick={handleBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors mb-4 font-bold uppercase tracking-widest">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        )}

        {/* Step title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black tracking-tight text-white">
            {STEP_LABELS[currentStep].title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            {STEP_LABELS[currentStep].subtitle}
          </p>
        </div>

        {/* Progress dots */}
        <StepDots current={currentStep} />
      </div>

      {/* Flow content */}
      <div className="w-full max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
          >
            {currentStep === "swap" && (
              <CryptoFiatSwapCard onSwapComplete={handleSwapComplete} />
            )}

            {currentStep === "account" && (
              <AccountGateway
                accounts={accounts}
                defaultAccount={defaultAccount}
                isLoading={loadingAccounts && !checkedAccounts}
                onUseSaved={handleUseSavedAccount}
                onUseNew={handleUseNewAccount}
              />
            )}

            {currentStep === "verification" && (
              <BankVerificationCard onProceed={handleVerificationComplete} />
            )}

            {currentStep === "order" && (
              <OrderInitializationCard
                onOrderComplete={handleOrderComplete}
                onChangAccount={() => setCurrentStep("account")}
              />
            )}

            {currentStep === "payment" && (
              <PendingPaymentCard 
                paymentData={paymentOrder!} 
                onTimeout={handleNewTransaction} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Account Gateway ─────────────────────────────────────────────────────────
interface AccountGatewayProps {
  accounts: SavedAccount[]
  defaultAccount: SavedAccount | null
  isLoading: boolean
  onUseSaved: (account: SavedAccount) => void
  onUseNew: () => void
}

function AccountGateway({ accounts, defaultAccount, isLoading, onUseSaved, onUseNew }: AccountGatewayProps) {
  const [selected, setSelected] = useState<SavedAccount | null>(defaultAccount ?? accounts[0] ?? null)

  useEffect(() => {
    setSelected(defaultAccount ?? accounts[0] ?? null)
  }, [defaultAccount, accounts])

  if (isLoading) {
    return (
      <div className="glass-panel neon-border rounded-3xl p-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Checking saved accounts…</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {accounts.length > 0 ? (
        <>
          {/* Saved accounts */}
          <div className="glass-panel neon-border rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="px-6 py-5 border-b border-white/5 flex items-center gap-2 relative z-10">
              <BookUser className="w-4 h-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Saved Accounts</span>
            </div>

            <div className="divide-y divide-white/5 relative z-10">
              {accounts.map((account) => {
                const isSelected = selected?._id === account._id
                return (
                  <button
                    key={account._id}
                    type="button"
                    onClick={() => setSelected(account)}
                    className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-all duration-200 ${
                      isSelected ? "bg-primary/10" : "hover:bg-white/5"
                    }`}
                  >
                    {/* Selection ring */}
                    <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? "border-primary bg-primary" : "border-white/20"
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{account.label}</span>
                        {account.isDefault && (
                          <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{account.bankName}</p>
                      <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">
                        {account.accountNumber} · {account.accountName}
                      </p>
                    </div>

                    {isSelected
                      ? <ShieldCheck className="shrink-0 w-5 h-5 text-primary" />
                      : <ChevronRight className="shrink-0 w-4 h-4 text-muted-foreground/40" />
                    }
                  </button>
                )
              })}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => selected && onUseSaved(selected)}
            disabled={!selected}
            className="w-full futuristic-button bg-primary text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(100,150,255,0.25)] disabled:opacity-40 disabled:shadow-none transition-all hover:scale-[1.01]"
          >
            Continue with {selected?.label || "Selected Account"} →
          </button>

          <button
            type="button"
            onClick={onUseNew}
            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors py-2 font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            Use a different bank account
          </button>
        </>
      ) : (
        /* No accounts — push to verify */
        <div className="glass-panel neon-border rounded-3xl p-10 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20 relative z-10">
            <BookUser className="w-8 h-8 text-primary" />
          </div>
          <div className="relative z-10">
            <h3 className="font-black text-white text-lg">No Saved Accounts</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Verify your bank account to receive your payout. You can save it for faster future transactions.
            </p>
          </div>
          <button
            onClick={onUseNew}
            className="futuristic-button bg-primary text-white w-full py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(100,150,255,0.25)] relative z-10"
          >
            Verify Bank Account →
          </button>
        </div>
      )}
    </motion.div>
  )
}

export { CryptoFiatFlow }
export default CryptoFiatFlow
