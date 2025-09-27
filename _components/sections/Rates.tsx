import React from "react";
import { AnimatedSection } from "@/src/components/ui/animate-section";

export default function RatesSection() {
  return (
    <AnimatedSection>
      <div className="mb-20 flex w-full flex-col items-center justify-center gap-6 px-5 md:mb-48">
        <div className="flex flex-col items-center gap-6">
          <h3 className="text-2xl font-semibold sm:text-4xl md:text-5xl">
            Rates like no other
          </h3>
          <p className="max-w-[712px] text-center text-base font-normal leading-[30px] opacity-80 lg:text-lg">
            You have no cause for worry when it comes to rates, Gidswap offers
            the best rates that beat the speed and amount for P2Ps and other
            stablecoin exchange options
          </p>
          <button
            className="futuristic-button group flex items-center gap-2 px-6 py-3 text-base font-medium rounded-full transition-all duration-300 ease-out hover:scale-105 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#0d6fde] focus:ring-offset-2 dark:focus:ring-offset-[#1a1a1a]
        bg-gradient-to-r from-[#0d6fde] to-[#3b82f6] text-white
        dark:from-[#0d6fde]/80 dark:to-[#3b82f6]/80 dark:text-gray-100
        hover:shadow-[0_0_15px_rgba(13,111,222,0.5)] dark:hover:shadow-[0_0_15px_rgba(13,111,222,0.3)]"
          >
            Get started
            <img
              src="/images/arrowwhite.svg"
              alt="get started icon"
              className="h-6"
            />
          </button>
        </div>
        <div className="mx-auto w-full"></div>
      </div>
    </AnimatedSection>
  );
}
