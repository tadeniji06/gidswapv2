"use client";
import React, { useEffect, useState } from "react";
import { AnimatedSection } from "@/src/components/ui/animate-section";
import { useAuthStore } from "@/store/Authstore";
import Cookies from "js-cookie";

interface RateRow {
  pair: string;
  symbol: string;
  rate: string;
  trend: string;
}

const RATE_PAIRS = [
  { symbol: "USDT", network: "bnb-smart-chain", label: "USDT / NGN" },
  { symbol: "USDC", network: "bnb-smart-chain", label: "USDC / NGN" },
  { symbol: "USDT", network: "ethereum",        label: "USDT (ETH) / NGN" },
  { symbol: "USDC", network: "base",            label: "USDC (Base) / NGN" },
];

export default function RatesSection() {
  const { setRegisterModalOpen } = useAuthStore();
  const [rates, setRates] = useState<RateRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      const token = Cookies.get("token");
      const api = process.env.NEXT_PUBLIC_PROD_API;
      const results: RateRow[] = [];

      for (const pair of RATE_PAIRS) {
        try {
          const res = await fetch(
            `${api}/api/payCrest/trade/tokenRates/${pair.network}/${pair.symbol}/1/NGN?side=sell`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          let rate = 0;
          if (data?.data?.sell?.rate) rate = Number(data.data.sell.rate);
          else if (data?.data?.rate) rate = Number(data.data.rate);

          results.push({
            pair: pair.label,
            symbol: pair.symbol,
            rate: rate > 0 ? rate.toLocaleString("en-NG", { maximumFractionDigits: 2 }) : "—",
            trend: rate > 0 ? "+Live" : "—",
          });
        } catch {
          results.push({ pair: pair.label, symbol: pair.symbol, rate: "—", trend: "—" });
        }
      }

      setRates(results);
      setLoading(false);
    };

    fetchRates();
    const interval = setInterval(fetchRates, 60_000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatedSection>
      <div className="mb-20 flex w-full flex-col items-center justify-center gap-10 px-5 md:mb-48 relative">
        {/* Decorative Background Blur */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] -z-10" />

        <div className="flex flex-col items-center gap-8 max-w-4xl text-center">
          <h3 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight">
            Rates like <span className="text-primary italic">no other</span>
          </h3>
          <p className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed">
            Trade with confidence. Gidswap leverages institutional-grade liquidity
            to provide rates that consistently outperform traditional P2P markets
            and standard exchange protocols.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
            <button
              className="futuristic-button bg-primary text-white font-black text-xs tracking-widest uppercase px-12 py-5 rounded-2xl shadow-[0_0_30px_rgba(100,150,255,0.4)] hover:scale-105 transition-transform"
              onClick={() => setRegisterModalOpen(true)}
            >
              Get Started Now
            </button>

            <div className="flex items-center gap-3 px-6 py-3 glass-panel rounded-2xl border-white/5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Live Rates Active
              </span>
            </div>
          </div>
        </div>

        {/* Live Rate Cards */}
        <div className="w-full max-w-5xl mt-8 glass-panel rounded-[2rem] border-white/5 p-8 md:p-12 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2 animate-pulse">
                  <div className="h-3 bg-white/10 rounded w-3/4" />
                  <div className="h-7 bg-white/10 rounded w-full" />
                  <div className="h-3 bg-white/10 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
              {rates.map((item, i) => (
                <div key={i} className="space-y-2 group/card">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {item.pair}
                  </p>
                  <p className="text-2xl font-black tabular-nums tracking-tighter text-white">
                    ₦{item.rate}
                  </p>
                  <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    {item.trend}
                  </p>
                </div>
              ))}
            </div>
          )}

          <p className="text-[9px] text-muted-foreground/40 uppercase tracking-widest font-bold mt-8 text-right">
            Powered by PayCrest Protocol · Updates every 60s
          </p>
        </div>
      </div>
    </AnimatedSection>
  );
}
