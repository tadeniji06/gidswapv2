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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-[-20%] top-0 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[150px] animate-pulse-glow" />
        <div className="absolute right-[-20%] bottom-0 h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-[150px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
      </div>

      {/* Hero Content */}
      <AnimatedSection className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-6xl">
        <h1 className="font-poppins flex flex-col gap-2 font-semibold leading-tight tracking-tight">
          <span className="text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent drop-shadow-sm">
            <span ref={sellRef} className="inline-block text-primary drop-shadow-[0_0_15px_rgba(100,150,255,0.5)]">
              Sell
            </span>{" "}
            <span className="font-playfair text-5xl sm:text-6xl md:text-7xl lg:text-[7.5rem] italic font-medium bg-gradient-to-br from-gray-900 to-blue-700 dark:from-white dark:to-primary bg-clip-text text-transparent">
              Crypto
            </span>
          </span>
          <span className="text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] font-medium text-muted-foreground mt-2">
            in seconds
          </span>
        </h1>

        {/* Swap Form */}
        <AnimatedSection delay={0.2} className="w-full flex justify-center">
          <div className="mt-16 w-full max-w-[480px] rounded-3xl glass-panel neon-border p-8 relative">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-primary/30 to-transparent rounded-3xl opacity-50 blur-sm -z-10"></div>
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
          <div className="flex flex-col items-center gap-3 mt-20 animate-bounce cursor-pointer">
            <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
              Scroll to explore
            </span>
            <div className="p-2 rounded-full glass-panel">
              <ChevronDown className="w-5 h-5 text-primary" />
            </div>
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
