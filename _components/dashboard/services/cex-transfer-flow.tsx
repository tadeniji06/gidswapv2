"use client"

import { useState } from "react"
import { useCEXStore } from "@/lib/cex-store"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { Copy, ExternalLink, Check, ChevronDown } from "lucide-react"

export default function CexTransferFlow() {
  const { exchanges, selectedExchange, isLoading, error, selectExchange, copyUID, resetSelection } = useCEXStore()

  const [copied, setCopied] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleCopyUID = async (uid: string) => {
    await copyUID(uid)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExchangeSelect = (exchange: any) => {
    selectExchange(exchange)
    setIsDropdownOpen(false)
  }

  if (selectedExchange) {
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Transfer to {selectedExchange.name}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Copy your UID to proceed
          </p>
        </div>

        {/* Selected Exchange Card */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: selectedExchange.color + "20" }}
            >
              <img
                src={selectedExchange.logo || "/placeholder.svg"}
                alt={selectedExchange.name}
                className="w-8 h-8 rounded-full"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedExchange.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Exchange Platform</p>
            </div>
          </div>

          {/* UID Display */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Your {selectedExchange.name} UID
              </label>
              <div className="flex items-center gap-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                <code className="flex-1 text-lg font-mono text-gray-900 dark:text-white">{selectedExchange.uid}</code>
                <Button
                  onClick={() => handleCopyUID(selectedExchange.uid)}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy UID
                    </>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">What happens next?</p>
                  <p className="text-sm text-blue-600 dark:text-blue-200">
                    After copying your UID, you'll be redirected to WhatsApp to complete your transfer request with our
                    support team. You're required to send your proof of payment to the WhatsApp number.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={resetSelection}
              variant="outline"
              className="w-full border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 bg-transparent"
            >
              Select Different Exchange
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-2 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Exchange</h2>
        <p className="text-gray-600 dark:text-gray-400">Choose your preferred exchange platform</p>
      </div>

      <div className="relative">
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-4 py-2 flex items-center justify-between text-left transition-colors"
          >
            <span className="text-gray-900 dark:text-white font-medium">Select an exchange</span>
            <ChevronDown
              className={`h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isDropdownOpen && (
            <div className="border-t border-gray-200 dark:border-gray-800">
              {exchanges.map((exchange) => (
                <button
                  key={exchange.id}
                  onClick={() => handleExchangeSelect(exchange)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-200 dark:border-gray-800 last:border-b-0"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: exchange.color + "20" }}
                  >
                    <img
                      src={exchange.logo}
                      alt={exchange.name}
                      className="w-8 h-8 rounded-full"
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900 dark:text-white">{exchange.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">UID: {exchange.uid}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 space-y-4">
        {/* How it works */}
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">How it works</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select your exchange, copy the provided UID, and you'll be automatically redirected to WhatsApp to
              complete your transfer request.
            </p>
          </div>
        </div>

        {/* Active Hours */}
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Active Hours</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              9am – 6pm <span className="text-gray-500 dark:text-gray-500">(transactions completed within max 30 mins)</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Outside this time, processing may vary.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
