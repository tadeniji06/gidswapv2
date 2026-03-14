"use client"

import { useState } from "react"
import { useOnrampStore } from "@/lib/onramp-store"
import { OnrampQuoteCard } from "./onramp/quote-card"
import { OnrampDetailsCard } from "./onramp/details-card"
import { OnrampStatusCard } from "./onramp/status-card"
import { Button } from "@/src/components/ui/button"

export function OnrampFlow() {
  const { sessionData, reset } = useOnrampStore()
  const [step, setStep] = useState<"quote" | "details" | "status">("quote")

  // Auto-switch to status view if there is a session active
  if (sessionData && step !== "status") {
    setStep("status")
  }

  const handleReset = () => {
    reset()
    setStep("quote")
  }

  return (
    <div className="w-full min-h-screen p-2 sm:p-4">
      <div className="w-full max-w-lg mx-auto mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-100 mb-2">
          {step === "quote" && "Crypto to Fiat Onramp"}
          {step === "details" && "Payout Details"}
          {step === "status" && "Transaction Status"}
        </h1>
        <p className="text-gray-400 text-sm">
          {step === "quote" && "Convert any cryptocurrency directly to your Naira bank account"}
          {step === "details" && "Provide the details where you wish to receive your funds"}
          {step === "status" && "Track the progress of your direct-to-bank swap"}
        </p>
      </div>

      {step === "quote" && <OnrampQuoteCard onNext={() => setStep("details")} />}
      {step === "details" && (
        <OnrampDetailsCard 
          onBack={() => setStep("quote")} 
          onSuccess={() => setStep("status")} 
        />
      )}
      {step === "status" && <OnrampStatusCard onReset={handleReset} />}
    </div>
  )
}
