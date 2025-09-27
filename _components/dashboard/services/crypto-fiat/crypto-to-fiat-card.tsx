"use client";
import { Button } from "@/src/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, ChevronDown, Search, Info } from "lucide-react";
import {
  useCryptoFiatStore,
  type Token,
  type FiatCurrency,
} from "@/lib/crypto-fiat-store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

interface TokenDropdownProps {
  token: Token | null;
  tokens: Token[];
  onSelect: (token: Token) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function TokenDropdown({
  token,
  tokens,
  onSelect,
  isOpen,
  onToggle,
}: TokenDropdownProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isOpen) onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const filteredTokens = tokens.filter(
    (t) =>
      t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.baseCurrency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 flex items-center gap-2 text-sm font-medium"
        onClick={onToggle}
      >
        {token ? (
          <>
            <img
              src={token.logo || "/placeholder.svg"}
              alt={token.symbol}
              className="w-5 h-5 rounded-full"
            />
            <span>{token.symbol}</span>
          </>
        ) : (
          <span>Select token</span>
        )}
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-70 sm:w-72 max-w-[calc(100vw-2rem)] bg-[#2a2d3a] rounded-xl border border-[#3a3d4a] shadow-lg z-50">
          <div className="p-3 border-b border-[#3a3d4a]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tokens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#3a3d4a] text-white placeholder-gray-400 rounded-lg pl-10 pr-3 py-2 text-sm border-none outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((t) => (
                <button
                  key={t.symbol}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#3a3d4a] text-left transition-colors"
                  onClick={() => {
                    onSelect(t);
                    onToggle();
                    setSearchTerm("");
                  }}
                >
                  <img
                    src={t.logo || "/placeholder.svg"}
                    alt={t.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium">{t.symbol}</div>
                    <div className="text-gray-400 text-sm truncate">
                      {t.baseCurrency} • {t.network}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-400 text-sm">
                No tokens found for "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface CurrencyDropdownProps {
  currency: FiatCurrency | null;
  currencies: FiatCurrency[];
  onSelect: (currency: FiatCurrency) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function CurrencyDropdown({
  currency,
  currencies,
  onSelect,
  isOpen,
  onToggle,
}: CurrencyDropdownProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isOpen) onToggle();
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
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 flex items-center gap-2 text-sm font-medium"
        onClick={onToggle}
      >
        {currency ? (
          <>
            <span className="w-5 h-5 flex items-center justify-center text-xs font-bold bg-blue-500 rounded-sm">
              {currency.symbol}
            </span>
            <span>{currency.code}</span>
          </>
        ) : (
          <span>Select currency</span>
        )}
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-70 sm:w-72 max-w-[calc(100vw-2rem)] bg-[#2a2d3a] rounded-xl border border-[#3a3d4a] shadow-lg z-50">
          <div className="p-3 border-b border-[#3a3d4a]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search currencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#3a3d4a] text-white placeholder-gray-400 rounded-lg pl-10 pr-3 py-2 text-sm border-none outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((c) => (
                <button
                  key={c.code}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#3a3d4a] text-left transition-colors"
                  onClick={() => {
                    onSelect(c);
                    onToggle();
                    setSearchTerm("");
                  }}
                >
                  <div className="w-6 h-6 flex items-center justify-center text-xs font-bold bg-blue-500 rounded-sm text-white">
                    {c.symbol}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium">{c.code}</div>
                    <div className="text-gray-400 text-sm truncate">
                      {c.name}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-400 text-sm">
                No currencies found for "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface CryptoFiatSwapCardProps {
  onSwapComplete?: () => void;
}

export function CryptoFiatSwapCard({
  onSwapComplete,
}: CryptoFiatSwapCardProps) {
  const {
    tokens,
    currencies,
    isLoadingTokens,
    isLoadingCurrencies,
    selectedToken,
    selectedCurrency,
    tokenAmount,
    fiatAmount,
    quote,
    isLoadingQuote,
    fetchTokens,
    fetchCurrencies,
    setSelectedToken,
    setSelectedCurrency,
    setTokenAmount,
    fetchQuote,
  } = useCryptoFiatStore();

  const [tokenDropdownOpen, setTokenDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  useEffect(() => {
    fetchTokens();
    fetchCurrencies();
  }, [fetchTokens, fetchCurrencies]);

  // Auto-select the single available currency if only one
  useEffect(() => {
    if (currencies.length === 1 && !selectedCurrency) {
      setSelectedCurrency(currencies[0]);
    }
  }, [currencies, selectedCurrency, setSelectedCurrency]);

  useEffect(() => {
    if (
      selectedToken &&
      selectedCurrency &&
      tokenAmount &&
      Number.parseFloat(tokenAmount) > 0
    ) {
      fetchQuote(selectedToken.symbol, tokenAmount, selectedCurrency.code);
    }
  }, [selectedToken, selectedCurrency, tokenAmount, fetchQuote]);

  const isFormValid =
    selectedToken &&
    selectedCurrency &&
    tokenAmount &&
    Number.parseFloat(tokenAmount) > 0;

  const handleSwap = () => {
    if (!isFormValid) return;
    console.log("Swap initiated:", {
      selectedToken,
      selectedCurrency,
      tokenAmount,
      fiatAmount,
    });
    onSwapComplete?.();
  };

  if (isLoadingTokens || isLoadingCurrencies) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center shadow-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Loading currencies...
          </p>
        </div>
      </div>
    );
  }

  // LP fee + net total
  const lpFee = quote ? quote.total * 0.01 : 0;
  const netTotal = quote ? quote.total - lpFee : 0;

  return (
    <div className="w-full max-w-lg sm:max-w-md mx-auto px-2 sm:px-0">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-2xl py-6 px-4 mb-4 relative flex flex-col gap-1">
        {/* Send Section */}
        <div className="bg-gray-100 dark:bg-black p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <label className="text-gray-400 text-sm font-medium">Send</label>
            <TokenDropdown
              token={selectedToken}
              tokens={tokens}
              onSelect={setSelectedToken}
              isOpen={tokenDropdownOpen}
              onToggle={() => {
                setTokenDropdownOpen(!tokenDropdownOpen);
                setCurrencyDropdownOpen(false);
              }}
            />
          </div>
          <input
            type="text"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-transparent text-2xl sm:text-3xl font-bold text-black dark:text-white placeholder-gray-500 border-none outline-none"
          />
        </div>

        {/* Swap Button */}
        <Button
          variant="ghost"
          size="sm"
          className="bg-gray-100 dark:bg-black border-4 border-white dark:border-gray-800 hover:bg-[#4a4d5a] rounded-full p-2 
    absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
    z-10 w-10 h-10 flex items-center justify-center
    transition-transform duration-300 hover:scale-110"
          aria-label="Swap currencies"
        >
          <ArrowUpDown className="w-5 h-5 text-black dark:text-white text-bold" />
        </Button>

        {/* Receive Section */}
        <div className="bg-gray-100 dark:bg-black p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm font-medium">Receive</span>

            {currencies.length === 1 ? (
              <div className="flex items-center gap-2 bg-blue-600 text-white rounded-full px-4 py-2 text-sm font-medium">
                <span className="w-5 h-5 flex items-center justify-center text-xs font-bold bg-blue-500 rounded-sm">
                  {currencies[0].symbol}
                </span>
                <span>{currencies[0].code}</span>
              </div>
            ) : (
              <CurrencyDropdown
                currency={selectedCurrency}
                currencies={currencies}
                onSelect={setSelectedCurrency}
                isOpen={currencyDropdownOpen}
                onToggle={() => {
                  setCurrencyDropdownOpen(!currencyDropdownOpen);
                  setTokenDropdownOpen(false);
                }}
              />
            )}
          </div>
          <input
            type="text"
            value={fiatAmount}
            readOnly
            placeholder="0"
            className="w-full bg-transparent text-2xl sm:text-3xl font-bold text-black dark:text-white placeholder-gray-500 border-none outline-none"
          />
        </div>
      </div>

      {/* Quote Section */}
      {quote && (
        <div className="bg-white border shadow-sm dark:bg-[#333746] rounded-xl p-4 mb-4 text-sm">
          {/* Rate */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 dark:text-gray-200">Rate</span>
            <span className="text-gray-700 dark:text-white font-medium">
              1 {selectedToken?.symbol} = {selectedCurrency?.symbol}
              {quote.rate.toLocaleString()}
            </span>
          </div>

          {/* LP Fee */}
          <div className="relative flex items-center gap-1 group">
            <span className="text-gray-700 dark:text-gray-200">LP fee</span>

            {/* Info icon */}
            <Info className="w-4 h-4 text-gray-400 cursor-pointer" />

            {/* Hover popup */}
            <div
              className="absolute left-6 top-1/2 -translate-y-1/2 z-10 
               hidden group-hover:block
               bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 
               border border-gray-200 dark:border-gray-700 shadow-md 
               rounded-lg px-3 py-2 text-xs w-56"
            >
              A 1% Liquidity Provider fee is deducted from your total.
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center font-semibold">
            <span className="text-gray-900 dark:text-gray-100">Total</span>
            <span className="text-gray-900 dark:text-white">
              {selectedCurrency?.symbol}
              {netTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSwap}
        disabled={!isFormValid || isLoadingQuote}
      >
        {isLoadingQuote ? "Getting quote..." : "Swap"}
      </Button>
    </div>
  );
}
