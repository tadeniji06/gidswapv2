"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpDown, Home, History, BarChart3 } from "lucide-react";
import { useSwapStore } from "@/lib/swap-store";

import { CryptoSwapFlow } from "@/_components/dashboard/services/crypto-swap-flow";
import CryptoFiatFlow from "@/_components/dashboard/services/crypto-fiat-flow";
import CexTransferFlow from "@/_components/dashboard/services/cex-transfer-flow";
import { FiatCryptoFlow } from "@/_components/dashboard/services/fiat-crypto-flow";

type ServiceType =
  | "crypto-crypto"
  | "crypto-fiat"
  | "fiat-crypto"
  | "cex-transfer"
  | null;

const services = [
  {
    id: "crypto-crypto" as ServiceType,
    title: "Crypto to Crypto",
    description:
      "Swap between different cryptocurrencies instantly with competitive rates",
    icon: "🔄",
    color: "from-blue-500 to-purple-600",
  },
  {
    id: "crypto-fiat" as ServiceType,
    title: "Crypto to Cash",
    description:
      "Convert your cryptocurrency to fiat currency and withdraw to your bank",
    icon: "💰",
    color: "from-green-500 to-emerald-600",
  },

  {
    id: "cex-transfer" as ServiceType,
    title: "Exchange Transfer",
    description:
      "Transfer funds between different cryptocurrency exchanges securely",
    icon: "🔀",
    color: "from-purple-500 to-pink-600",
  },
];

export default function Dashboard() {
  const { fetchCurrencies } = useSwapStore();

  const [selectedService, setSelectedService] = useState<ServiceType>(null);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  const renderServiceFlow = () => {
    switch (selectedService) {
      case "crypto-crypto":
        return <CryptoSwapFlow />;
      case "crypto-fiat":
        return <CryptoFiatFlow />;
      case "fiat-crypto":
        return <FiatCryptoFlow />;
      case "cex-transfer":
        return <CexTransferFlow />;
      default:
        return null;
    }
  };

  const renderServiceSelection = () => (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Flip, Swap & Send
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          All your crypto moves in one place
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => setSelectedService(service.id)}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            aria-label={`Select service: ${service.title}`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            />
            <div className="relative p-8">
              <div className="flex items-start gap-4">
                <div className="text-4xl" aria-hidden="true">
                  {service.icon}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {service.description}
                  </p>
                </div>
              </div>
              <div className="mt-6 text-sm text-blue-600 dark:text-blue-400 flex items-center">
                Click to get started{" "}
                <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <main className="flex-1 px-4 pb-10">
      {selectedService ? (
        <div className="max-w-md mx-auto w-full">
          <button
            onClick={() => setSelectedService(null)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
            aria-label="Go back to service selection"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </button>
          {renderServiceFlow()}
        </div>
      ) : (
        renderServiceSelection()
      )}
    </main>
  );
}
