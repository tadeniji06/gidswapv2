"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, BookUser, ShieldCheck, Sparkles, Zap } from "lucide-react"
import { useOnrampStore } from "@/lib/onramp-store"
import { OnrampQuoteCard } from "./onramp/quote-card"
import { OnrampDetailsCard } from "./onramp/details-card"
import { OnrampStatusCard } from "./onramp/status-card"

type OnrampStep = "quote" | "details" | "status"

const STEP_LABELS: Record<OnrampStep, { title: string; subtitle: string }> = {
  quote:   { title: "Off-Ramp",         subtitle: "Convert crypto directly to your Naira bank" },
  details: { title: "Payout Details",   subtitle: "Where should we send your funds?" },
  status:  { title: "Transaction",      subtitle: "Track your direct-to-bank swap" },
}

const STEPS: OnrampStep[] = ["quote", "details", "status"]

function StepDots({ current }: { current: OnrampStep }) {
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

export function OnrampFlow() {
  const { sessionData, reset } = useOnrampStore()
  const [step, setStep] = useState<OnrampStep>("quote")

  useEffect(() => {
    if (sessionData && step !== "status") {
      setStep("status")
    }
  }, [sessionData, step])

  const handleReset = () => {
    reset()
    setStep("quote")
  }

  const handleGoBack = () => {
    if (step === "details") setStep("quote")
  }

  const canGoBack = step === "details"

  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Header */}
      <div className="w-full max-w-lg mx-auto mb-2">
        {canGoBack && (
          <button onClick={handleGoBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors mb-4 font-bold uppercase tracking-widest">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        )}

        <div className="text-center mb-6">
          <h1 className="text-2xl font-black tracking-tight text-white">
            {STEP_LABELS[step].title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            {STEP_LABELS[step].subtitle}
          </p>
        </div>

        <StepDots current={step} />
      </div>

      <div className="w-full max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
          >
            {step === "quote" && <OnrampQuoteCard onNext={() => setStep("details")} />}
            {step === "details" && (
              <OnrampDetailsCard 
                onBack={() => setStep("quote")} 
                onSuccess={() => setStep("status")} 
              />
            )}
            {step === "status" && <OnrampStatusCard onReset={handleReset} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Trust Badge */}
      {step !== "status" && (
        <div className="mt-12 flex justify-center items-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-50 transition-all">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Non-Custodial</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Instant Settlement</span>
          </div>
        </div>
      )}
    </div>
  )
}
