"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CryptoFiatSwapCard } from "./crypto-fiat/crypto-to-fiat-card"
import { OrderInitializationCard } from "./crypto-fiat/order-init-card"
import { BankVerificationCard } from "./crypto-fiat/bank-verification-card"
import { useCryptoFiatStore } from "@/lib/crypto-fiat-store"
import { PendingPaymentCard } from "./crypto-fiat/pending-card"

type FlowStep = "swap" | "verification" | "order" | "payment"

function CryptoFiatFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("swap")
  const { paymentOrder } = useCryptoFiatStore()

  const handleSwapComplete = () => {
    setCurrentStep("verification")
  }

  const handleVerificationComplete = () => {
    setCurrentStep("order")
    console.log("Proceeding to order initialization...")
  }

  const handleOrderComplete = () => {
    setCurrentStep("payment")
    console.log("Proceeding to payment...")
  }

  const handlePaymentTimeout = () => {
    setCurrentStep("swap")
    console.log("Payment expired, redirecting to step 1...")
  }

  const handleBack = () => {
    if (currentStep === "verification") {
      setCurrentStep("swap")
    } else if (currentStep === "order") {
      setCurrentStep("verification")
    } else if (currentStep === "payment") {
      setCurrentStep("order")
    }
  }

  return (
    <div className="min-h-screen  p-2 sm:p-4">
      <div className="w-full max-w-lg sm:max-w-md mx-auto mb-6">
        {currentStep !== "swap" && (
          <Button variant="ghost" onClick={handleBack} className="mb-4 text-gray-400 hover:text-white p-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}

        <h1 className="text-2xl font-bold text-center text-gray-700 dark:text-gray-100 center mb-2">
          {currentStep === "swap" && "Crypto to Fiat"}
          {currentStep === "verification" && "Verify Account"}
          {currentStep === "order" && "Initialize Order"}
          {currentStep === "payment" && "Send Payment"}
        </h1>
        <p className="text-gray-400 text-center text-sm">
          {currentStep === "swap" && "Convert your cryptocurrency to cash instantly"}
          {currentStep === "verification" && "Verify your bank account details"}
          {currentStep === "order" && "Provide transaction details"}
          {currentStep === "payment" && "Send crypto to complete your order"}
        </p>
      </div>

      {currentStep === "swap" && <CryptoFiatSwapCard onSwapComplete={handleSwapComplete} />}

      {currentStep === "verification" && <BankVerificationCard onProceed={handleVerificationComplete} />}

      {currentStep === "order" && <OrderInitializationCard onOrderComplete={handleOrderComplete} />}

      {currentStep === "payment" && paymentOrder && (
        <PendingPaymentCard paymentData={paymentOrder} onTimeout={handlePaymentTimeout} />
      )}
    </div>
  )
}

export { CryptoFiatFlow }
export default CryptoFiatFlow

