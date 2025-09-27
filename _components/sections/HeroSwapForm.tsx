"use client";
import type React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/src/components/ui/select";
import { currencies } from "@/lib/constants";
import type { Currency } from "@/lib/types";
import { ArrowUpDown } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { useExchangeRate } from "@/hooks/getRates";
import { useAuthStore } from "@/store/Authstore";

const SwapForm: React.FC<{
  sendAmount: string;
  setSendAmount: (value: string) => void;
  sendCurrency: Currency;
  setSendCurrency: (currency: Currency) => void;
  receiveAmount: string;
  setReceiveAmount: (value: string) => void;
  receiveCurrency: Currency;
  setReceiveCurrency: (currency: Currency) => void;
  setShowModal: (value: boolean) => void;
  tab: string;
}> = ({
  sendAmount,
  setSendAmount,
  sendCurrency,
  setSendCurrency,
  receiveAmount,
  setReceiveAmount,
  receiveCurrency,
  setReceiveCurrency,
  setShowModal,
  tab,
}) => {
  const { rate, loading } = useExchangeRate(
    sendCurrency.coingeckoId,
    receiveCurrency.coingeckoId
  );

  const { setLoginModalOpen } = useAuthStore();

  const handleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setter(value);
    }
  };

  // recalc when sendAmount or rate changes
  useEffect(() => {
    if (sendAmount && rate) {
      const sendValue = Number.parseFloat(sendAmount) || 0;
      const converted = sendValue * rate;
      setReceiveAmount(converted.toFixed(4));
      
    } else {
      setReceiveAmount("0");
    }
  }, [sendAmount, rate, setReceiveAmount]);

  const handleSignClick = () => {
    setLoginModalOpen(true);
  };

  // Send is always BTC
  const btcCurrency = currencies.find((c) => c.id === "btc")!;
  useEffect(() => {
    setSendCurrency(btcCurrency);
  }, [setSendCurrency]);

  // Receive is ETH or USDT
  const receiveOptions = currencies.filter((c) =>
    ["usd", "euro"].includes(c.id)
  );

  useEffect(() => {
    if (!receiveOptions.some((c) => c.id === receiveCurrency.id)) {
      setReceiveCurrency(receiveOptions[0]);
    }
  }, [receiveOptions, receiveCurrency, setReceiveCurrency]);

  return (
    <form className="grid gap-6 text-sm text-gray-700 transition-all dark:text-white">
      <div className="relative rounded-[20px] bg-gray-100/50 dark:bg-white/5 backdrop-blur-sm p-3 border border-gray-200/50 dark:border-white/10">
        <div className="flex space-y-2 flex-col">
          {/* Header */}
          <div className="flex flex-col gap-1 px-2 py-1">
            <h3 className="text-2xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Exchange your{" "}
              {tab === "buy"
                ? "fiat for crypto"
                : tab === "sell"
                ? "crypto for fiat"
                : "currencies"}{" "}
              in an instant
            </p>
          </div>

          <div className="flex space-y-2 flex-col relative">
            {/* Send Field */}
            <div className="flex flex-col space-y-2 rounded-xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm px-3 py-2 shadow-sm border border-gray-200/30 dark:border-white/10">
              <label
                htmlFor={`amount-sent-${tab}`}
                className="text-gray-500 dark:text-white/50 text-xs font-medium"
              >
                {tab === "buy" ? "Pay" : "Send"}
              </label>
              <div className="flex items-center justify-between gap-2">
                <input
                  id={`amount-sent-${tab}`}
                  inputMode="decimal"
                  className="w-full rounded-lg border-b border-transparent bg-transparent py-1 text-2xl outline-none placeholder:text-gray-400 text-neutral-900 dark:text-white/80 invalid:border-red-500 font-semibold"
                  value={sendAmount}
                  onChange={(e) => handleAmountChange(e, setSendAmount)}
                  placeholder="0.00"
                  type="text"
                  maxLength={10}
                  aria-describedby="send-error"
                />
                {/* Locked BTC pill */}
                <div className="flex items-center gap-2 min-w-[100px] rounded-full border-2 border-blue-500/20 text-blue-600 dark:text-blue-400 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm px-3 py-1">
                  <Image
                    src={btcCurrency.logo}
                    alt="BTC logo"
                    width={16}
                    height={16}
                    className="w-4 h-4 rounded-full"
                  />
                  <span className="text-xs font-medium">{btcCurrency.name}</span>
                </div>
              </div>
              {sendAmount && !/^\d*\.?\d*$/.test(sendAmount) && (
                <p id="send-error" className="text-xs text-red-500">
                  Please enter a valid number.
                </p>
              )}
            </div>

            {/* Swap Arrow */}
            <div className="flex justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-2 z-40">
              <div className="w-10 h-10 rounded-full mygradient futuristic-button flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer group">
                <ArrowUpDown className="w-5 h-5 text-white group-hover:rotate-180 transition-transform duration-300" />
              </div>
            </div>

            {/* Receive Field */}
            <div className="flex flex-col space-y-2 rounded-xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm px-3 py-2 shadow-sm border border-gray-200/30 dark:border-white/10">
              <label
                htmlFor={`amount-received-${tab}`}
                className="text-gray-500 dark:text-white/50 text-xs font-medium flex items-center justify-between"
              >
                {tab === "buy" ? "Receive" : "Get"}
                <Select
                  onValueChange={(value: string) =>
                    setReceiveCurrency(receiveOptions.find((c) => c.name === value)!)
                  }
                  defaultValue={receiveCurrency.name}
                >
                  <SelectTrigger className="w-fit flex h-9 items-center gap-2 rounded-full p-2 border-2 border-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 dark:hover:bg-purple-400/10 hover:shadow-[0_0_6px_rgba(147,51,234,0.3)] transition-all duration-300 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm">
                    <Image
                      src={receiveCurrency.logo}
                      alt={`${receiveCurrency.name} logo`}
                      width={16}
                      height={16}
                      className="w-4 h-4 rounded-full"
                    />
                    <span className="text-xs font-medium">
                      {receiveCurrency.name}
                    </span>
                  </SelectTrigger>

                  <SelectContent className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-gray-200/50 dark:border-white/10">
                    {receiveOptions.map((currency) => (
                      <SelectItem
                        key={currency.id}
                        value={currency.name}
                        className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      >
                        <div className="flex items-center gap-2">
                          <Image
                            src={currency.logo}
                            alt={`${currency.name} logo`}
                            width={16}
                            height={16}
                            className="w-4 h-4 rounded-full"
                          />
                          <span>{currency.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({currency.type})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <div className="flex items-center justify-between gap-2">
                <input
                  id={`amount-received-${tab}`}
                  inputMode="decimal"
                  className="w-full rounded-lg border-b border-transparent bg-transparent py-1 text-2xl outline-none placeholder:text-gray-400 text-neutral-900 dark:text-white/80 cursor-not-allowed font-semibold"
                  value={Number(receiveAmount).toFixed()}
                  readOnly
                  placeholder="0.00"
                  title="Estimated amount to receive"
                />
              </div>
            </div>

            {/* Rate display */}
            {rate && (
              <p className="text-xs text-gray-500 mt-1 text-center">
                1 {sendCurrency.symbol} = {rate} {receiveCurrency.symbol}
              </p>
            )}
            {loading && (
              <p className="text-xs text-gray-400 mt-1 text-center">
                Fetching latest rates...
              </p>
            )}
          </div>
        </div>
      </div>

      <Button
        disabled={
          !sendAmount ||
          sendAmount === "0" ||
          receiveCurrency.name === "Select currency"
        }
        className="mygradient futuristic-button text-white rounded-full px-6 py-3 mt-4 
           hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] 
           dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] 
           disabled:bg-gray-300 disabled:text-white disabled:hover:scale-100 
           disabled:hover:shadow-none dark:disabled:bg-white/10 
           dark:disabled:text-white/50 transition-all duration-300 font-semibold 
           text-base bg-[length:200%_100%] hover:bg-[position:100%_0] animate-gradient"
        onClick={handleSignClick}
        type="button"
      >
        {tab.charAt(0).toUpperCase() + tab.slice(1)} swap
      </Button>
    </form>
  );
};

export default SwapForm;
