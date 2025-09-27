"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatedSection } from "@/src/components/ui/animate-section";
import HeroSwapForm from "./HeroSwapForm";
import { currencies } from "@/lib/constants";
import type { Currency } from "@/lib/types";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(TextPlugin, ScrambleTextPlugin);

export default function Hero() {
  const sellRef = useRef<HTMLSpanElement>(null);
  const cycleWords = ["Sell", "Swap", "Buy"];

  // 🔹 SwapForm state
  const [sendAmount, setSendAmount] = useState("0");
  const [receiveAmount, setReceiveAmount] = useState("0");
  const [sendCurrency, setSendCurrency] = useState<Currency>(currencies[0]);
  const [receiveCurrency, setReceiveCurrency] = useState<Currency>({
    name: "Select currency",
    logo: "",
    rate: 1,
    id: "",
    symbol: "",
    type: 'crypto',
    coingeckoId: ""
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!sellRef.current) return;

    let tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    cycleWords.forEach((word) => {
      tl.to(sellRef.current, {
        duration: 1.2,
        scrambleText: word,
        ease: "power2.inOut",
      }).to({}, { duration: 1 });
    });
  }, []);

  return (
    <div
      id="hero"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-transparent pt-10 pb-10 text-white"
    >
      {/* Background radial glows */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-200px] top-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[200px]" />
        <div className="absolute right-[-200px] top-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[200px]" />
      </div>

      {/* Hero Content */}
      <AnimatedSection className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-poppins flex flex-col gap-2 font-semibold poppins leading-tight">
          <span className="text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] bg-gradient-to-b from-gray-800 to-blue-600 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
            <span ref={sellRef} className="inline-block">
              Sell
            </span>{" "}
            <span className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-[7rem] italic font-medium bg-gradient-to-b from-gray-900 to-blue-700 dark:from-white dark:to-blue-300 bg-clip-text text-transparent">
              Crypto
            </span>
          </span>
          <span className="text-4xl sm:text-5xl md:text-6xl lg:text-[6rem] font-medium bg-gradient-to-b from-gray-800 to-blue-600 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
            in seconds
          </span>
        </h1>

        {/* Swap Form */}
        <AnimatedSection delay={0.2}>
          <div className="mt-12 w-full max-w-md rounded-2xl bg-neutral-900/60 backdrop-blur-md border border-white/10 shadow-xl px-6 py-8">
            <HeroSwapForm
              sendAmount={sendAmount}
              setSendAmount={setSendAmount}
              sendCurrency={sendCurrency}
              setSendCurrency={setSendCurrency}
              receiveAmount={receiveAmount}
              setReceiveAmount={setReceiveAmount}
              receiveCurrency={receiveCurrency}
              setReceiveCurrency={setReceiveCurrency}
              setShowModal={setShowModal}
              tab=""
            />
          </div>
        </AnimatedSection>

        {/* Scroll Indicator */}
        <AnimatedSection delay={0.4}>
          <div className="flex flex-col items-center gap-2 mt-16 animate-bounce">
            <span className="text-sm text-gray-400">
              Scroll down to learn more
            </span>
            <ChevronDown className="w-5 h-5 text-gray-300" />
          </div>
        </AnimatedSection>
      </AnimatedSection>

      {/* Example Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-xl">
            <h2 className="text-lg font-semibold">Confirm Swap</h2>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              Swapping {sendAmount} {sendCurrency.name} → {receiveAmount}{" "}
              {receiveCurrency.name}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
