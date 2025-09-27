"use client"

import { useState } from "react"
import { useCryptoFiatStore } from "@/lib/crypto-fiat-store"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import Cookies from "js-cookie"

interface OrderInitializationCardProps {
  onBack?: () => void
  onNext?: () => void
  onOrderComplete?: () => void
}

// configurable LP fee (1% for now)
const LP_FEE_PERCENT = 0.01

export function OrderInitializationCard({ onBack, onNext, onOrderComplete }: OrderInitializationCardProps) {
  const [memo, setMemo] = useState("")
  const [returnAddress, setReturnAddress] = useState("")
  const [errors, setErrors] = useState<{ memo?: string; returnAddress?: string }>({})

  const { selectedToken, selectedCurrency, tokenAmount, quote, isInitializingOrder, initializeOrder } =
    useCryptoFiatStore()

  // Extract verified bank data from cookie
  const verifiedBank = Cookies.get("verifiedBank")
  const bankData = verifiedBank ? JSON.parse(verifiedBank) : null
  const { accountNumber, accountName, bankName, bankCode } = bankData || {}

  // Fee + net total calculations
  const lpFee = quote ? quote.total * LP_FEE_PERCENT : 0
  const netTotal = quote ? quote.total - lpFee : 0

  const validateForm = () => {
    const newErrors: { memo?: string; returnAddress?: string } = {}

    if (!memo.trim()) {
      newErrors.memo = "Memo is required"
    }

    if (!returnAddress.trim()) {
      newErrors.returnAddress = "Return address is required"
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(returnAddress)) {
      newErrors.returnAddress = "Invalid wallet address format"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInitializeOrder = async () => {
    if (!validateForm()) return

    if (!bankData) {
      console.error("Missing bank verification data")
      return
    }

    const payload = {
      institution: bankCode,
      accountIdentifier: accountNumber,
      accountName: accountName,
    }

    const success = await initializeOrder(memo, returnAddress, payload)
    if (success) {
      if (onOrderComplete) {
        onOrderComplete()
      } else if (onNext) {
        onNext()
      }
    }
  }

  return (
    <Card className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">Initialize Order</CardTitle>
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

      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Order Summary</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Amount:</span>
            <span className="text-gray-900 dark:text-white">
              {tokenAmount} {selectedToken?.symbol}
            </span>
          </div>
  
          {/* LP Fee row */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">LP Fee:</span>
            <span className="text-gray-900 dark:text-gray-200">
              {lpFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
              {selectedCurrency?.code}
            </span>
          </div>
          {/* Net total row */}
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-800 dark:text-gray-400">You Receive:</span>
            <span className="text-gray-900 dark:text-white">
              {netTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
              {selectedCurrency?.code}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Bank:</span>
            <span className="text-gray-900 dark:text-white">{bankName || "N/A"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Account:</span>
            <span className="text-gray-900 dark:text-white">{accountNumber || "N/A"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Account Name:</span>
            <span className="text-gray-900 dark:text-white">{accountName || "N/A"}</span>
          </div>
        </div>

        {/* Memo Input */}
        <div className="space-y-2">
          <Label htmlFor="memo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Remarks *
          </Label>
          <Input
            id="memo"
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Enter payment description"
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
          {errors.memo && <p className="text-sm text-red-500 dark:text-red-400">{errors.memo}</p>}
        </div>

        {/* Return Address Input */}
        <div className="space-y-2">
          <Label htmlFor="returnAddress" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Refund Wallet Address (in case of error) *
          </Label>
          <Input
            id="returnAddress"
            type="text"
            value={returnAddress}
            onChange={(e) => setReturnAddress(e.target.value)}
            placeholder="0xwallet"
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-mono text-sm"
          />
          {errors.returnAddress && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.returnAddress}</p>
          )}
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Please do not use an exchange wallet address as the refund wallet address.
          </p>
        </div>

        {/* Initialize Order Button */}
        <Button
          onClick={handleInitializeOrder}
          disabled={isInitializingOrder || !memo.trim() || !returnAddress.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isInitializingOrder ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Initializing Order...
            </>
          ) : (
            "Initialize Order"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
