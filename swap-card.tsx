"use client";
import { Button } from "@/src/components/ui/button";
import { useEffect, useRef } from "react";

import { ArrowDownUp, ChevronDown, Info, Settings } from "lucide-react";
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl px-3 py-2 flex items-center gap-2 transition-all duration-200 backdrop-blur-md"
        onClick={onToggle}
      >
        {currency ? (
          <>
            <img
              src={currency.logo || "/placeholder.svg"}
              alt={currency.coin}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-base font-semibold">{currency.coin}</span>
          </>
        ) : (
          <span className="text-sm font-medium">Select token</span>
        )}
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-[280px] bg-[#13151A]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden transform-gpu animate-fade-in"
          style={{ willChange: "transform, opacity" }}
        >
          <div className="p-3 border-b border-white/5">
            <input
              type="text"
              placeholder="Search by name or symbol"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm border border-transparent focus:border-primary/50 outline-none transition-colors"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {currencies
              .filter(
                (curr) =>
                  curr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  curr.coin.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => {
                    onSelect?.(curr);
                    onToggle();
                    setSearchTerm("");
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                >
                  <img
                    src={curr.logo || "/placeholder.svg"}
                    alt={curr.coin}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {curr.name}
                    </div>
                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wider truncate">
                      {curr.coin}
                    </div>
                  </div>
                </button>
              ))}
          </div>
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
    <div className="bg-[#1A1C24]/50 hover:bg-[#1A1C24]/80 transition-colors border border-white/5 rounded-3xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm font-medium">
          {type === "sell" ? "You pay" : "You receive"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          value={amount ?? ""}
          onChange={(e) => onAmountChange?.(e.target.value)}
          readOnly={type === "receive"}
          placeholder="0"
          className="w-full bg-transparent text-4xl font-medium tracking-tight text-white placeholder-white/20 border-none outline-none overflow-hidden"
        />
        <CurrencyDropdown
          currency={currency}
          currencies={currencies}
          onSelect={onCurrencySelect}
          isOpen={dropdownOpen}
          onToggle={onDropdownToggle}
        />
      </div>
      <div className="mt-2 h-5 flex items-center">
        {usdValue && (
          <span className="text-gray-500 text-sm font-medium">{usdValue}</span>
        )}
      </div>
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
    const handler = setTimeout(() => {
      fetchQuote();
    }, 1000);
    return () => clearTimeout(handler);
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

  const switchCurrencies = () => {
    const tempCurr = sellCurrency;
    setSellCurrency(receiveCurrency);
    setReceiveCurrency(tempCurr);
    setSellAmount(receiveAmount);
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
      <div className="w-full max-w-[480px] mx-auto">
        <div className="glass-panel rounded-[2rem] p-8 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-gray-400 font-medium animate-pulse">Loading tokens...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[480px] mx-auto relative group">
      {/* Decorative background glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-purple-500/30 to-blue-500/30 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
      
      <div className="relative glass-panel rounded-[2rem] p-2 overflow-visible">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h2 className="text-white font-medium text-lg">Swap</h2>
          <button className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="p-2 space-y-1 relative">
          <SwapSection
            type="sell"
            amount={sellAmount}
            currency={sellCurrency}
            currencies={currencies}
            usdValue={quote ? `~$${quote.from.usd.toFixed(2)}` : undefined}
            onAmountChange={setSellAmount}
            onCurrencySelect={handleSellCurrencySelect}
            dropdownOpen={sellDropdownOpen}
            onDropdownToggle={() => {
              setSellDropdownOpen(!sellDropdownOpen);
              setReceiveDropdownOpen(false);
            }}
          />

          {/* Switch Button */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <button
              onClick={switchCurrencies}
              className="bg-[#13151A] border-4 border-[#1A1C24]/50 hover:border-[#1A1C24] text-white p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group/btn"
            >
              <ArrowDownUp className="w-5 h-5 text-gray-400 group-hover/btn:text-white transition-colors" />
            </button>
          </div>

          <SwapSection
            type="receive"
            amount={receiveAmount}
            currency={receiveCurrency}
            currencies={currencies}
            usdValue={quote ? `~$${quote.to.usd.toFixed(2)}` : undefined}
            onAmountChange={setReceiveAmount}
            onCurrencySelect={handleReceiveCurrencySelect}
            dropdownOpen={receiveDropdownOpen}
            onDropdownToggle={() => {
              setReceiveDropdownOpen(!receiveDropdownOpen);
              setSellDropdownOpen(false);
            }}
          />
        </div>

        {hasValidationError && (
          <div className="px-4 py-2 mt-1">
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-3 flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                {isAmountTooLow && (
                  <p>Minimum amount is {quote.from.min} {quote.from.coin}</p>
                )}
                {isAmountTooHigh && (
                  <p>Maximum amount is {quote.from.max} {quote.from.coin}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {quote && !hasValidationError && (
          <div className="px-5 py-3 mx-2 mt-2 mb-3 bg-white/5 rounded-xl text-sm font-medium">
            <div className="flex justify-between items-center text-gray-400">
              <span>Exchange Rate</span>
              <span className="text-white">
                1 {quote.from.coin} = {quote.from.rate.toFixed(4)} {quote.to.coin}
              </span>
            </div>
          </div>
        )}

        <div className="p-2 pt-0 mt-2">
          <Button
            className="w-full futuristic-button bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg rounded-2xl shadow-[0_0_20px_-5px_var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            onClick={handleSwap}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? "Processing..." : !sellAmount ? "Enter an amount" : !isFormValid ? "Invalid swap" : "Review Swap"}
          </Button>
        </div>
      </div>
    </div>
  );
}

