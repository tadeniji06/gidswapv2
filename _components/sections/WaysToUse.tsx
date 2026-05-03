import React from "react";
import { AnimatedSection } from "@/src/components/ui/animate-section";
import { useCaseNoExp, useWeb3Dengen } from "@/lib/constants";
import Image from "next/image";
import { motion } from "framer-motion";

export default function WaysToUse() {
  return (
    <AnimatedSection>
      <div className="mb-36 flex w-full flex-col items-center justify-center gap-16 px-5 md:mb-48 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-full blur-[120px] -z-10" />

        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
            Ways you can use <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Gidswap</span>
          </h2>
          <p className="text-muted-foreground text-lg font-medium">Built for both the curious and the crypto-native.</p>
        </div>

        <div className="container mx-auto max-w-6xl w-full">
          <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] border-white/5 shadow-2xl relative">
            <div className="absolute top-0 right-0 p-6 opacity-20">
              <div className="w-24 h-24 border-t-2 border-r-2 border-primary rounded-tr-3xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {useCaseNoExp.map((data, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group flex flex-col gap-6 rounded-3xl bg-black/20 p-8 border border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 shadow-lg"
                >
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Image
                      src={data.icon}
                      alt={data.text}
                      width={100}
                      height={100}
                      className="w-10 h-10 group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <span className="text-lg font-bold tracking-tight leading-snug group-hover:text-white transition-colors">
                    {data.text}
                  </span>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-gray-800" />
                  ))}
                </div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Joined by 10k+ degens</p>
              </div>
              <button className="futuristic-button bg-primary text-white px-10 py-4 rounded-2xl font-black tracking-widest text-xs uppercase shadow-[0_0_20px_rgba(100,150,255,0.3)]">
                Explore Protocol
              </button>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
