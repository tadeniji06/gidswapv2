"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Wallet, ShieldCheck, ArrowRight } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { useFiatCryptoStore } from "@/lib/fiat-crypto-store"

export function CryptoWalletCard({ onNext }: { onNext: () => void }) {
  const { destinationAddress, setDestinationAddress, selectedToken } = useFiatCryptoStore()

  // Very basic check - real validation could be regex depending on network
  const isValid = destinationAddress.trim().length > 10

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[#1a1d27] border border-[#252836] shadow-xl rounded-2xl p-6"
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Wallet className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Destination Wallet</h3>
          <p className="text-sm text-gray-400 mt-1">
            Where should we send your {selectedToken?.symbol}?
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-sm text-gray-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            Ensure you submit a valid {selectedToken?.network} address
          </label>
          <Input
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            placeholder={`e.g. 0x... or typical ${selectedToken?.symbol} address`}
            className="w-full bg-[#13161e] border-[#252836] text-white focus:border-blue-500 transition-colors py-6 text-lg rounded-xl"
          />
        </div>

        <Button
          onClick={onNext}
          disabled={!isValid}
          className="w-full bg-[#4f8ef7] hover:bg-[#3b7ae0] text-white py-6 text-lg font-semibold rounded-xl flex items-center justify-center gap-2"
        >
          Validate & Continue
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  )
}
