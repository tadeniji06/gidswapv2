import React from "react";
import { AnimatedSection } from "@/src/components/ui/animate-section";
import { useAuthStore } from "@/store/Authstore";

export default function RatesSection() {
  const { setRegisterModalOpen} = useAuthStore()
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
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live Rates active</span>
            </div>
          </div>
        </div>

        {/* Dynamic Rate Preview Placeholder */}
        <div className="w-full max-w-5xl mt-16 glass-panel rounded-[2rem] border-white/5 p-8 md:p-12 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            {[
              { pair: 'NGN / USDT', rate: '1,540.00', trend: '+0.2%' },
              { pair: 'NGN / USDC', rate: '1,538.50', trend: '+0.1%' },
              { pair: 'NGN / PYUSD', rate: '1,542.10', trend: '-0.05%' },
              { pair: 'NGN / EURC', rate: '1,650.00', trend: '+0.4%' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.pair}</p>
                <p className="text-2xl font-black tabular-nums tracking-tighter">₦{item.rate}</p>
                <p className={`text-[10px] font-bold ${item.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{item.trend}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
