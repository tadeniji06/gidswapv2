"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft, BookUser } from "lucide-react"
import { useFiatCryptoStore } from "@/lib/fiat-crypto-store"
import { useSavedAccountsStore, SavedAccount } from "@/lib/saved-accounts-store"
import { FiatCryptoCard } from "./fiat-crypto/fiat-crypto-card"
import { CryptoWalletCard } from "./fiat-crypto/crypto-wallet-card"
import { OrderInitializationCard } from "./fiat-crypto/order-init-card"
import { PendingPaymentCard } from "./fiat-crypto/pending-card"
import { BankVerificationCard } from "./crypto-fiat/bank-verification-card"
import Cookies from "js-cookie"

type FlowStep = "swap" | "wallet" | "account" | "verification" | "order" | "payment"

const STEP_LABELS: Record<FlowStep, { title: string; subtitle: string }> = {
  swap:         { title: "Fiat to Crypto",    subtitle: "Buy crypto natively with NGN" },
  wallet:       { title: "Destination Wallet",subtitle: "Provide your crypto wallet address" },
  account:      { title: "Refund Account",    subtitle: "Select a bank account for refunds" },
  verification: { title: "Verify Account",    subtitle: "Add a new bank account" },
  order:        { title: "Order Summary",     subtitle: "Review your transaction before paying" },
  payment:      { title: "Make Deposit",      subtitle: "Transfer NGN to the virtual account" },
}

export function FiatCryptoFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("swap")
  const { paymentOrder, resetService } = useFiatCryptoStore()
  
  // Account gateway states
  const {
    accounts,
    defaultAccount,
    isLoading: loadingAccounts,
  } = useSavedAccountsStore()

  const loadSavedAccountIntoCookie = useCallback((account: SavedAccount) => {
    const bankData = {
      bankName: account.bankName,
      bankCode: account.bankCode,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
    }
    Cookies.set("verifiedBank", JSON.stringify(bankData), { expires: 1 })
  }, [])

  const handleGoBack = () => {
    switch (currentStep) {
      case "wallet":
        setCurrentStep("swap")
        break
      case "account":
        setCurrentStep("wallet")
        break
      case "verification":
        setCurrentStep("account") // back to gateway picker
        break
      case "order":
        setCurrentStep("account")
        break
      case "payment":
        // Usually can't go back from active payment
        break
    }
  }

  // --- Step Components ---

  const renderAccountGateway = () => {
    if (loadingAccounts) {
      return (
        <div className="flex justify-center p-8 text-gray-400">Loading saved accounts...</div>
      )
    }

    if (!accounts || accounts.length === 0) {
      setCurrentStep("verification")
      return null
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="space-y-4"
      >
        <div className="bg-[#1a1d27] border border-[#252836] shadow-xl rounded-2xl p-6">
          <BookUser className="w-10 h-10 text-blue-400 mb-4 mx-auto" />
          <h3 className="text-xl font-semibold text-white text-center mb-6">Select Refund Bank</h3>
          
          <div className="space-y-3">
            {accounts.map((acc) => (
              <Button
                key={acc._id}
                variant="outline"
                className="w-full text-left h-auto py-4 px-5 justify-start bg-[#13161e] border-[#2d3142] hover:bg-[#252836] hover:text-white group relative overflow-hidden"
                onClick={() => {
                  loadSavedAccountIntoCookie(acc)
                  setCurrentStep("order")
                }}
              >
                {acc._id === defaultAccount?._id && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-xs text-white px-2 py-0.5 rounded-bl-lg font-medium">
                    Default
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">
                    {acc.bankName}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {acc.accountNumber} • {acc.accountName}
                  </p>
                </div>
              </Button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-[#252836]">
            <Button
              variant="ghost"
              className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border border-dashed border-blue-500/30"
              onClick={() => setCurrentStep("verification")}
            >
              Add New Bank Account
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Dynamic Header */}
      <div className="flex flex-col items-center text-center space-y-2 mb-8 relative">
        {currentStep !== "swap" && currentStep !== "payment" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {STEP_LABELS[currentStep].title}
        </h1>
        <p className="text-gray-400 text-sm max-w-[280px]">
          {STEP_LABELS[currentStep].subtitle}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === "swap" && (
          <FiatCryptoCard key="swap" onNext={() => setCurrentStep("wallet")} />
        )}
        
        {currentStep === "wallet" && (
          <CryptoWalletCard key="wallet" onNext={() => setCurrentStep("account")} />
        )}

        {currentStep === "account" && (
          <div key="account">{renderAccountGateway()}</div>
        )}

        {currentStep === "verification" && (
          <BankVerificationCard
            key="verification"
            onProceed={() => setCurrentStep("order")}
          />
        )}

        {currentStep === "order" && (
          <OrderInitializationCard
            key="order"
            onSuccess={() => setCurrentStep("payment")}
            onChangeAccount={() => setCurrentStep("account")}
          />
        )}

        {currentStep === "payment" && (
          <PendingPaymentCard
            key="payment"
            onNewTransaction={() => {
              resetService()
              setCurrentStep("swap")
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
