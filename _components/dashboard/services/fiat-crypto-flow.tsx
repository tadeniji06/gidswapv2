"use client"
import { SwapHeader } from "@/_components/dashboard/swap/swap-header"
import { Card, CardContent } from "@/src/components/ui/card"

export function FiatCryptoFlow() {
  return (
    <div className="w-full max-w-md">
      <SwapHeader title="Fiat to Crypto" description="Buy cryptocurrency with traditional currency" />
      <Card className="bg-[#2a2d3a] border-[#3a3d4a]">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400 mb-4">Fiat to Crypto purchase coming soon!</p>
          <p className="text-gray-500 text-sm">
            This feature will allow you to buy cryptocurrencies using fiat currencies like USD, EUR, etc.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
