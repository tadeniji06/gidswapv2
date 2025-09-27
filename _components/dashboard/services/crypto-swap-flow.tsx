"use client";
import { useEffect } from "react";
import { SwapHeader } from "@/_components/dashboard/swap/swap-header";
import { SwapCard } from "@/_components/dashboard/swap/swap-card";
import { QuoteCard } from "@/_components/dashboard/swap/quote-card";
import { PendingDepositCard } from "@/_components/dashboard/swap/pending-card";
import { WalletAddressCard } from "@/_components/dashboard/swap/wallet-card";
import { useSwapStore } from "@/lib/swap-store";

export function CryptoSwapFlow() {
  const {
    swapStep,
    swapData,
    isSwapping,
    backToSwap,
    proceedWithWallet,
    fetchCurrencies,
  } = useSwapStore();

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  return (
    <div className="w-full max-w-md">
      {swapStep === "swap" ? (
        <>
          <SwapHeader
            title="Swap"
            description="Exchange cryptocurrencies instantly"
          />
          <SwapCard
            isLoading={isSwapping}
            onSwap={function (swapData: any): void {
              throw new Error("Function not implemented.");
            }}
          />
        </>
      ) : swapStep === "quote" ? (
        <>
          <SwapHeader
            title="Confirm Swap"
            description="Review details and enter your wallet address"
          />
          <QuoteCard />
        </>
      ) : swapStep === "pending" ? (
        <>
          <SwapHeader
            title="Send Deposit"
            description="Send the exact amount to complete your swap"
          />
          <PendingDepositCard swapData={swapData} />
        </>
      ) : (
        <>
          <SwapHeader
            title="Complete Swap"
            description="Enter your wallet address to receive your funds"
          />
          {swapData ? (
            <WalletAddressCard
              swapData={swapData}
              onBack={backToSwap}
              onProceed={proceedWithWallet}
            />
          ) : (
            <div className="bg-[#2a2d3a] rounded-2xl p-6 text-center">
              <p className="text-gray-400">Loading swap details...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
