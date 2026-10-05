"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Loader2, ArrowRight, Building2, Wallet
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { useFiatCryptoStore } from "@/lib/fiat-crypto-store"
import Cookies from "js-cookie"
import { toast } from "sonner"

export function OrderInitializationCard({
  onSuccess,
  onChangeAccount
}: {
  onSuccess: () => void
  onChangeAccount: () => void
}) {
  const {
    fiatAmount,
    tokenAmount,
    selectedToken,
    selectedCurrency,
    destinationAddress,
    quote,
    initializeOrder,
    isInitializingOrder
  } = useFiatCryptoStore()

  const [bankData, setBankData] = useState<any>(null)

  useEffect(() => {
    const cookieData = Cookies.get("verifiedBank")
    if (cookieData) {
      try {
        setBankData(JSON.parse(cookieData))
      } catch (e) {
        console.error("Failed to parse bank data", e)
      }
    }
  }, [])

  const handleInitialize = async () => {
    if (!bankData) {
      toast.error("Refund bank data is missing")
      return
    }
    
    const success = await initializeOrder(bankData, "")
    if (success) {
      onSuccess()
    } else {
      throw new Error("Order failed")
    }
  }

  if (!bankData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-2xl shadow-sm w-full max-w-md mx-auto">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium text-sm">Loading data...</p>
      </div>
    )
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
        <div className="text-center space-y-1">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">Order Summary</h3>
          <p className="text-muted-foreground text-sm">Review & confirm your payment</p>
        </div>

        {/* Transaction Amounts */}
        <div className="bg-muted/30 p-5 rounded-xl border border-border space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <span className="text-muted-foreground text-sm">Rate</span>
            <span className="text-foreground font-medium text-sm">
              1 {selectedToken?.symbol} = {selectedCurrency?.symbol}{quote?.rate.toLocaleString("en-NG", { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm font-medium">Pay</span>
            <span className="text-xl font-semibold text-foreground">
              {Number(fiatAmount).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-muted-foreground text-sm font-medium ml-1">{selectedCurrency?.code}</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm font-medium">Receive</span>
            <span className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
              {Number(tokenAmount).toLocaleString(undefined, { maximumFractionDigits: 6 })} <span className="text-muted-foreground text-sm font-medium ml-1">{selectedToken?.symbol}</span>
            </span>
          </div>
        </div>

        {/* Destination Wallet */}
        <div className="bg-background p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Receiving Address</span>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
            <p className="text-sm text-foreground break-all font-mono">
              {destinationAddress}
            </p>
          </div>
        </div>

        {/* Refund Bank Account */}
        <div className="bg-background p-4 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Refund Bank</span>
            </div>
            <button 
              onClick={onChangeAccount} 
              className="text-xs font-medium text-primary hover:underline"
            >
              Change
            </button>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg border border-border/50 space-y-2">
            <p className="font-medium text-foreground text-sm">{bankData.bankName}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Account</p>
                <p className="text-sm font-mono text-foreground">{bankData.accountNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Name</p>
                <p className="text-sm text-foreground truncate">{bankData.accountName}</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
            Used for safety if a transaction fails.
          </p>
        </div>

        {/* CTA */}
        <div className="pt-2">
          <Button
            onClick={handleInitialize}
            disabled={isInitializingOrder}
            className="w-full fintech-button-primary py-6 text-lg"
          >
            {isInitializingOrder ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm & Pay
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
