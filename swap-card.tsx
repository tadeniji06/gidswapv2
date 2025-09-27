"use client";
import { Button } from "@/src/components/ui/button";
import { useEffect, useRef } from "react";

import { ArrowUpDown, ChevronDown, Info } from "lucide-react";
import { useState } from "react";
import { useSwapStore } from "./lib/swap-store";

interface Currency {
  code: string;
  coin: string;
  network: string;
  name: string;
  logo: string;
  color: string;
  recv: number;
  send: number;
}

interface SwapCardProps {
  onSwap: (swapData: any) => void;
  isLoading?: boolean;
}

function CurrencyDropdown({
  currency,
  currencies,
  onSelect,
  isOpen,
  onToggle,
}: {
  currency: Currency | null;
  currencies: Currency[];
  onSelect?: (currency: Currency) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isOpen) {
          onToggle();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const filteredCurrencies = currencies.filter(
    (curr) =>
      curr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curr.coin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curr.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        className="bg-[#3a3d4a] hover:bg-[#4a4d5a] text-white rounded-full px-4 py-2 flex items-center gap-2"
        onClick={onToggle}
      >
        {currency ? (
          <>
            <img
              src={currency.logo || "/placeholder.svg"}
              alt={currency.coin}
              className="w-5 h-5 rounded-full"
            />
            <span className="text-sm">{currency.coin}</span>
          </>
        ) : (
          <span className="text-sm">Select</span>
        )}
        <ChevronDown className="w-4 h-4" />
      </Button>

      {/*{isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 sm:w-64 max-w-[calc(100vw-2rem)] bg-[#2a2d3a] rounded-xl border border-[#3a3d4a] shadow-lg z-50 max-h-60 overflow-hidden">
          <div className="p-3 border-b border-[#3a3d4a]">
            <input
              type="text"
              placeholder="Search currencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#3a3d4a] text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm border-none outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((curr) => (
                <button
                  key={curr.code}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#3a3d4a] text-left"
                  onClick={() => {
                    onSelect?.(curr)
                    onToggle()
                    setSearchTerm("") // Clear search when currency is selected
                  }}
                >
                  <img src={curr.logo || "/placeholder.svg"} alt={curr.coin} className="w-6 h-6 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{curr.coin}</div>
                    <div className="text-gray-400 text-sm truncate">{curr.name}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-400 text-sm">No currencies found for "{searchTerm}"</div>
            )}
          </div>
        </div>
      )} */}

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 mx-4 bg-[#2a2d3a] rounded-xl border border-[#3a3d4a] shadow-lg z-50 max-h-60 overflow-y-auto min-w-0 transform-gpu"
          style={{ willChange: "contents" }}
        >
          {currencies.map((curr) => (
            <button
              key={curr.code}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#3a3d4a] text-left"
            >
              <img
                src={curr.logo || "/placeholder.svg"}
                alt={curr.coin}
                className="w-6 h-6 rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">
                  {curr.coin}
                </div>
                <div className="text-gray-400 text-sm truncate">
                  {curr.name}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SwapSection({
  type,
  amount,
  currency,
  currencies,
  usdValue,
  onAmountChange,
  onCurrencySelect,
  dropdownOpen,
  onDropdownToggle,
}: {
  type: "sell" | "receive";
  amount: string;
  currency: Currency | null;
  currencies: Currency[];
  usdValue?: string;
  onAmountChange?: (value: string) => void;
  onCurrencySelect?: (currency: Currency) => void;
  dropdownOpen: boolean;
  onDropdownToggle: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm capitalize">{type}</span>
        <CurrencyDropdown
          currency={currency}
          currencies={currencies}
          onSelect={onCurrencySelect}
          isOpen={dropdownOpen}
          onToggle={onDropdownToggle}
        />
      </div>
      <input
        type="text"
        value={amount ?? ""}
        onChange={(e) => onAmountChange?.(e.target.value)}
        readOnly={type === "receive"}
        placeholder="0.00"
        className="w-full bg-transparent text-2xl md:text-3xl font-bold mb-2 text-white placeholder-gray-500 border-none outline-none"
      />
      {usdValue && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-black">$</span>
          </div>
          <span className="text-blue-400 font-semibold">{usdValue}</span>
        </div>
      )}
    </div>
  );
}

export function SwapCard({ onSwap, isLoading }: SwapCardProps) {
  const {
    sellAmount,
    receiveAmount,
    currencies,
    sellCurrency,
    receiveCurrency,
    quote,
    isLoadingCurrencies,
    setSellAmount,
    setReceiveAmount,
    setSellCurrency,
    setReceiveCurrency,
    fetchQuote,
    showQuote,
  } = useSwapStore();

  const [sellDropdownOpen, setSellDropdownOpen] = useState(false);
  const [receiveDropdownOpen, setReceiveDropdownOpen] = useState(false);

  const sellAmountNum = Number.parseFloat(sellAmount);
  const isAmountTooLow = quote && sellAmount && sellAmountNum < quote.from.min;
  const isAmountTooHigh = quote && sellAmount && sellAmountNum > quote.from.max;
  const hasValidationError = isAmountTooLow || isAmountTooHigh;

  const isFormValid =
    !!sellAmount &&
    sellAmountNum > 0 &&
    !!sellCurrency &&
    !!receiveCurrency &&
    !!quote &&
    !hasValidationError;

  useEffect(() => {
    fetchQuote();
  }, [sellAmount, sellCurrency, receiveCurrency, fetchQuote]);

  const handleSellCurrencySelect = (currency: Currency) => {
    setSellCurrency(currency);
    if (currency.coin === receiveCurrency?.coin) {
      const alt = currencies.find((c) => c.coin !== currency.coin);
      setReceiveCurrency(alt || null);
    }
  };

  const handleReceiveCurrencySelect = (currency: Currency) => {
    setReceiveCurrency(currency);
    if (currency.coin === sellCurrency?.coin) {
      const alt = currencies.find((c) => c.coin !== currency.coin);
      setSellCurrency(alt || null);
    }
  };

  const handleSwap = async () => {
    if (!isFormValid) return;

    const swapData = {
      fromCcy: sellCurrency!.code,
      toCcy: receiveCurrency!.code,
      amount: Number.parseFloat(sellAmount),
      direction: "from",
      type: "float",
      quote: quote,
      sellCurrency: sellCurrency,
      receiveCurrency: receiveCurrency,
    };

    showQuote(swapData);
  };

  if (isLoadingCurrencies) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-[#2a2d3a] rounded-2xl p-6 text-center">
          <span className="text-gray-400">Loading currencies...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#2a2d3a] rounded-2xl p-6 mb-6">
        <div className="mb-4">
          <SwapSection
            type="sell"
            amount={sellAmount}
            currency={sellCurrency}
            currencies={currencies}
            usdValue={quote ? `$${quote.from.usd.toFixed(2)}` : undefined}
            onAmountChange={setSellAmount}
            onCurrencySelect={handleSellCurrencySelect}
            dropdownOpen={sellDropdownOpen}
            onDropdownToggle={() => {
              setSellDropdownOpen(!sellDropdownOpen);
              setReceiveDropdownOpen(false);
            }}
          />
          {hasValidationError && (
            <div className="mt-2 text-sm text-red-400">
              {isAmountTooLow && (
                <span>
                  Amount too low. Minimum: {quote.from.min} {quote.from.coin}
                </span>
              )}
              {isAmountTooHigh && (
                <span>
                  Amount too high. Maximum: {quote.from.max} {quote.from.coin}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center my-4">
          <Button
            variant="ghost"
            size="sm"
            className="bg-[#3a3d4a] hover:bg-[#4a4d5a] rounded-full p-2"
          >
            <ArrowUpDown className="w-5 h-5 text-gray-400" />
          </Button>
        </div>

        <div>
          <SwapSection
            type="receive"
            amount={receiveAmount}
            currency={receiveCurrency}
            currencies={currencies}
            usdValue={quote ? `$${quote.to.usd.toFixed(2)}` : undefined}
            onAmountChange={setReceiveAmount}
            onCurrencySelect={handleReceiveCurrencySelect}
            dropdownOpen={receiveDropdownOpen}
            onDropdownToggle={() => {
              setReceiveDropdownOpen(!receiveDropdownOpen);
              setSellDropdownOpen(false);
            }}
          />
        </div>
      </div>

      {quote && (
        <div className="bg-[#2a2d3a] rounded-xl p-4 mb-4 text-sm text-gray-300">
          <div className="flex justify-between mb-1">
            <span className="font-semibold text-blue-700/90">Minimum</span>
            <span className="text-white">
              {quote.from.min} {quote.from.coin}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-semibold text-blue-700/90">Maximum</span>
            <span className="text-white">
              {quote.from.max} {quote.from.coin}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-semibold text-blue-700/90">Network</span>
            <span className="text-white">{quote.to.network}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-semibold text-blue-700/90">Rate</span>
            <span className="text-white">
              1 {quote.from.coin} ≈ {quote.from.rate.toFixed(2)} {quote.to.coin}
            </span>
          </div>
          <div className="flex justify-between"></div>
        </div>
      )}

      <Button
        className="w-full bg-blue-900 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSwap}
        disabled={!isFormValid || isLoading}
      >
        {isLoading ? "Processing..." : "Swap"}
      </Button>
    </div>
  );
}
