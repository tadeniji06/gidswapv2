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
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-panel neon-border shadow-2xl rounded-3xl p-6 md:p-8 relative overflow-hidden group"
    >
      <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 group-hover:bg-primary/20 transition-all duration-700" />
      
      <div className="space-y-8 relative z-10">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform">
            <Wallet className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-2xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Destination Wallet</h3>
          <p className="text-sm text-muted-foreground mt-2 tracking-wide">
            Where should we send your <span className="font-bold text-white">{selectedToken?.symbol}</span>?
          </p>
        </div>

        <div className="bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-inner transition-colors focus-within:border-primary/50 space-y-4">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Ensure you submit a valid {selectedToken?.network} address
          </label>
          <Input
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            placeholder={`e.g. 0x...`}
            className="w-full bg-black/50 border border-white/10 text-white focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all py-6 text-lg rounded-xl font-mono tracking-wider placeholder:text-white/20"
          />
        </div>

        <Button
          onClick={onNext}
          disabled={!isValid}
          className="w-full futuristic-button bg-primary text-white py-7 text-lg font-bold rounded-2xl shadow-[0_0_20px_rgba(100,150,255,0.2)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
        >
          Validate & Continue
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>
  )
}
