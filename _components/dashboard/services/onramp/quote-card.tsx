import { useState } from "react";
import { ArrowDown, Info } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useOnrampStore } from "@/lib/onramp-store";

// Hardcoded for onramp
const supportedCryptos = [
  { symbol: "BTC", name: "Bitcoin", network: "BTC", logo: "/images/bitcoin.png" },
  { symbol: "ETH", name: "Ethereum", network: "ETH", logo: "/images/ethereum.png" },
  { symbol: "USDT", name: "Tether (TRC20)", network: "TRX", logo: "/images/usdt.png" },
  { symbol: "BNB", name: "Binance Coin", network: "BSC", logo: "/placeholder.svg" },
  { symbol: "SOL", name: "Solana", network: "SOL", logo: "/placeholder.svg" },
  { symbol: "MATIC", name: "Polygon", network: "MATIC", logo: "/placeholder.svg" },
];

interface QuoteCardProps {
  onNext: () => void;
}

export function OnrampQuoteCard({ onNext }: QuoteCardProps) {
  const { fromCurrency, fromNetwork, fromAmount, rateData, isFetchingRate, setField, fetchRate } = useOnrampStore();

  const handleAmountChange = (val: string) => {
    setField("fromAmount", val);
  };

  const handleBlur = () => {
    fetchRate();
  };

  const selectedCrypto = supportedCryptos.find(c => c.symbol === fromCurrency) || supportedCryptos[0];

  const isValid = parseFloat(fromAmount) > 0 && rateData?.to?.estimatedAmount;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-2xl py-6 px-4 mb-4 relative flex flex-col gap-1">
        
        {/* Send Crypto */}
        <div className="bg-gray-100 dark:bg-black p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <label className="text-gray-400 text-sm font-medium">Send Crypto</label>
            <select 
               className="bg-blue-600 outline-none text-white rounded-full px-4 py-2 text-sm font-medium appearance-none cursor-pointer"
               value={fromCurrency}
               onChange={(e) => {
                 const t = supportedCryptos.find(c => c.symbol === e.target.value);
                 if (t) {
                   setField("fromCurrency", t.symbol);
                   setField("fromNetwork", t.network);
                   setTimeout(fetchRate, 100);
                 }
               }}
            >
              {supportedCryptos.map(c => (
                <option key={c.symbol} value={c.symbol}>{c.symbol} ({c.network})</option>
              ))}
            </select>
          </div>
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="0"
            className="w-full bg-transparent text-2xl sm:text-3xl font-bold text-black dark:text-white placeholder-gray-500 border-none outline-none"
          />
           <div className="text-xs text-gray-500 mt-2">
            Minimum: {rateData?.ffMinAmount || 0} {selectedCrypto.symbol} | Maximum: {rateData?.ffMaxAmount || "∞"} {selectedCrypto.symbol}
          </div>
        </div>

        {/* Swap Arrow Down */}
        <Button
          variant="ghost"
          size="sm"
          className="bg-gray-100 dark:bg-black border-4 border-white dark:border-gray-800 hover:bg-[#4a4d5a] rounded-full p-2 
            absolute top-[calc(50%-1.5rem)] left-1/2 transform -translate-x-1/2 -translate-y-1/2
            z-10 w-10 h-10 flex items-center justify-center transition-transform hover:scale-110"
        >
          <ArrowDown className="w-5 h-5 text-black dark:text-white" />
        </Button>

        {/* Receive Fiat */}
        <div className="bg-gray-100 dark:bg-black p-4 rounded-xl mt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm font-medium">Receive Fiat</span>
            <div className="flex items-center gap-2 bg-green-600 text-white rounded-full px-4 py-2 text-sm font-medium">
              <span>₦ NGN</span>
            </div>
          </div>
          <div className="w-full bg-transparent text-2xl sm:text-3xl font-bold text-black dark:text-white border-none outline-none">
             {isFetchingRate ? <span className="text-gray-400 text-lg">Fetching est...</span> : (rateData?.to?.estimatedAmount ? `₦${rateData.to.estimatedAmount.toLocaleString()}` : "0")}
          </div>
          {rateData?.warning && (
            <div className="text-xs text-yellow-500 mt-2">
              Note: {rateData.warning}
            </div>
          )}
        </div>
      </div>

      {rateData && rateData.to.estimatedAmount && (
        <div className="bg-white border shadow-sm dark:bg-[#333746] rounded-xl p-4 mb-4 text-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 dark:text-gray-200">Rate</span>
            <span className="text-gray-700 dark:text-white font-medium">
               1 Crypto ≈ ₦{((rateData.to.estimatedAmount) / parseFloat(fromAmount)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 dark:text-gray-200">Estimated Stables (Leg 1)</span>
            <span className="text-gray-700 dark:text-white font-medium">
               {rateData.intermediate?.estimatedAmount} {rateData.intermediate?.currency}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-200">Final Fiat Payout (Leg 2)</span>
            <span className="text-green-600 dark:text-green-400 font-bold">
               ₦{rateData.to.estimatedAmount.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl disabled:opacity-50"
        onClick={onNext}
        disabled={!isValid || isFetchingRate}
      >
        {isFetchingRate ? "Calculating..." : "Continue to Payout Details"}
      </Button>
    </div>
  );
}
