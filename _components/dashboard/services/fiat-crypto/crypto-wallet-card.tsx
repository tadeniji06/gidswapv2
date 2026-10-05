"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Wallet, ShieldCheck, ArrowRight } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { useFiatCryptoStore } from "@/lib/fiat-crypto-store"

export function CryptoWalletCard({ onNext }: { onNext: () => void }) {
  const { destinationAddress, setDestinationAddress, selectedToken } = useFiatCryptoStore()

  // EVM networks supported all use 0x addresses
  const isCorrectPrefix = destinationAddress.toLowerCase().startsWith("0x")
  const isLongEnough = destinationAddress.trim().length >= 40
  const isValid = isCorrectPrefix && isLongEnough
  const showWarning = destinationAddress.length > 2 && !isCorrectPrefix

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-2xl shadow-sm p-1"
    >
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" /> Receiving Address
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Where should we send your {selectedToken?.symbol}?
          </p>
        </div>

        <div className={`p-4 rounded-xl border transition-colors space-y-3 ${
          showWarning ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20" : "bg-muted/30 border-transparent focus-within:border-primary/40 focus-within:bg-background"
        }`}>
          <label className={`text-sm font-medium flex items-center gap-2 ${
            showWarning ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
          }`}>
            <ShieldCheck className="w-4 h-4" />
            {showWarning 
              ? "Invalid Format: Must start with 0x" 
              : `Ensure you submit a valid ${selectedToken?.network?.replace(/-/g, " ")} address`}
          </label>
          <input
            type="text"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            placeholder="0x..."
            className={`w-full bg-background border rounded-lg px-4 py-3 text-foreground font-mono placeholder:text-muted-foreground/50 focus:outline-none transition-colors ${
              showWarning 
                ? "border-red-300 dark:border-red-500/50 focus:ring-1 focus:ring-red-500 focus:border-red-500" 
                : "border-input focus:ring-1 focus:ring-primary focus:border-primary"
            }`}
          />
          <AnimatePresence>
            {showWarning && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-red-600 dark:text-red-400 font-medium pl-1 mt-1"
              >
                Please re-input a correct address
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="pt-2">
          <Button
            onClick={onNext}
            disabled={!isValid}
            className="w-full fintech-button-primary py-6 text-lg flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
