"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ChevronDown, Search, Info, Zap, Loader2, X } from "lucide-react";
import { useCryptoFiatStore, type Token, type FiatCurrency } from "@/lib/crypto-fiat-store";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";

// ─── Network badge ────────────────────────────────────────────────────────────
const NETWORK_META: Record<string, { short: string; color: string }> = {
  "bnb-smart-chain": { short: "BNB",  color: "from-yellow-400 to-yellow-600" },
  ethereum:          { short: "ETH",  color: "from-blue-400 to-indigo-500" },
  polygon:           { short: "POL",  color: "from-purple-400 to-purple-700" },
  "arbitrum-one":    { short: "ARB",  color: "from-sky-400 to-blue-600" },
  base:              { short: "BASE", color: "from-blue-300 to-blue-500" },
  tron:              { short: "TRX",  color: "from-red-400 to-red-600" },
};

function NetworkBadge({ network }: { network: string }) {
  const n = NETWORK_META[network.toLowerCase()] ?? { short: network.toUpperCase().slice(0, 4), color: "from-gray-400 to-gray-600" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest bg-gradient-to-r ${n.color} text-white`}>
      {n.short}
    </span>
  );
}

// ─── Token Selector (Modal based for professional UX) ────────────────────────
function TokenSelector({ token, tokens, onSelect }: {
  token: Token | null; tokens: Token[]; onSelect: (t: Token) => void;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = tokens.filter(
    (t) => t.symbol.toLowerCase().includes(search.toLowerCase()) || t.network.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-primary/40 rounded-2xl px-4 py-2.5 transition-all shadow-lg active:scale-95 group">
          {token ? (
            <>
              <img src={token.logo || "/placeholder.svg"} alt={token.symbol} className="w-6 h-6 rounded-full ring-2 ring-white/20" />
              <div className="text-left">
                <div className="text-white text-sm font-black leading-none">{token.symbol}</div>
                <NetworkBadge network={token.network} />
              </div>
            </>
          ) : <span className="text-muted-foreground text-sm font-medium">Select token</span>}
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px] bg-[#0d0e12] border-white/10 p-0 overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] outline-none">
        <DialogHeader className="p-6 pb-2 border-b border-white/5">
          <DialogTitle className="text-xl font-black text-white flex items-center justify-between">
            Select Token
          </DialogTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text" placeholder="Search by token name or network..." value={search}
              onChange={(e) => setSearch(e.target.value)} autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-all shadow-inner"
            />
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filtered.length > 0 ? filtered.map((t) => {
            const isSel = token?.symbol === t.symbol && token?.network === t.network;
            return (
              <button key={`${t.symbol}-${t.network}`}
                onClick={() => { onSelect(t); setIsOpen(false); setSearch(""); }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/5 rounded-2xl transition-all text-left group ${isSel ? "bg-primary/20 border border-primary/20" : "border border-transparent"}`}
              >
                <div className="relative">
                  <img src={t.logo || "/placeholder.svg"} alt={t.symbol} className="w-10 h-10 rounded-full ring-2 ring-white/5 shadow-xl group-hover:scale-105 transition-transform" />
                  {isSel && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full border-2 border-[#0d0e12]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-black text-base tracking-tight">{t.symbol}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <NetworkBadge network={t.network} />
                    <span className="text-xs text-muted-foreground capitalize font-bold tracking-tight">{t.network.replace(/-/g, " ")}</span>
                  </div>
                </div>
                {isSel && (
                  <div className="flex flex-col items-end gap-1">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-[10px] text-primary font-black uppercase tracking-tighter">Active</span>
                  </div>
                )}
              </button>
            );
          }) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground/20" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">No tokens found for "{search}"</p>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-white/5 border-t border-white/5">
          <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest">
            Don't see your token? Check the network selection
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Currency chip (usually just NGN — no dropdown needed) ────────────────────
function CurrencyChip({ currency }: { currency: FiatCurrency }) {
  return (
    <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl px-3 py-2">
      <span className="text-emerald-400 text-sm font-black">{currency.symbol}</span>
      <span className="text-white text-sm font-black">{currency.code}</span>
    </div>
  );
}

// ─── Main swap card ───────────────────────────────────────────────────────────
export function CryptoFiatSwapCard({ onSwapComplete }: { onSwapComplete?: () => void }) {
  const {
    tokens, currencies, isLoadingTokens, isLoadingCurrencies,
    selectedToken, selectedCurrency, tokenAmount, fiatAmount,
    quote, isLoadingQuote,
    fetchTokens, fetchCurrencies, setSelectedToken, setSelectedCurrency, setTokenAmount, fetchQuote,
  } = useCryptoFiatStore();

  // Removed tokenOpen state as we use Modal now

  useEffect(() => { fetchTokens(); fetchCurrencies(); }, [fetchTokens, fetchCurrencies]);
  useEffect(() => { if (currencies.length === 1 && !selectedCurrency) setSelectedCurrency(currencies[0]); }, [currencies, selectedCurrency, setSelectedCurrency]);
  useEffect(() => {
    if (selectedToken && selectedCurrency && tokenAmount && Number.parseFloat(tokenAmount) > 0)
      fetchQuote(selectedToken.symbol, tokenAmount, selectedCurrency.code);
  }, [selectedToken, selectedCurrency, tokenAmount, fetchQuote]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(val) || val === "") setTokenAmount(val);
  };

  const lpFee = quote ? quote.total * 0.01 : 0;
  const netTotal = quote ? quote.total - lpFee : 0;
  const isFormValid = selectedToken && selectedCurrency && tokenAmount && Number.parseFloat(tokenAmount) > 0;

  if (isLoadingTokens || isLoadingCurrencies) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground font-medium text-sm">Loading swap options...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-panel neon-border rounded-3xl relative shadow-2xl overflow-hidden"
    >
      {/* Ambient glows */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8 space-y-3">
        {/* Header */}
        {/* <div className="mb-6">
          <h3 className="text-xl font-black tracking-tight text-white">Off-Ramp</h3>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest mt-1">Crypto → Fiat</p>
        </div> */}

        {/* Send (crypto) */}
        <div className="bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/5 focus-within:border-primary/50 transition-all duration-300 shadow-inner">
          <div className="flex justify-between items-center mb-3">
            <label className="text-muted-foreground text-xs font-black tracking-widest uppercase">You send</label>
            <TokenSelector
              token={selectedToken} tokens={tokens} onSelect={setSelectedToken}
            />
          </div>
          <input
            type="number" inputMode="decimal" value={tokenAmount}
            onChange={handleAmountChange} placeholder="0.00"
            className="w-full bg-transparent text-4xl font-black text-white outline-none h-12 tracking-tight placeholder:text-white/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Arrow */}
        <div className="flex justify-center py-1">
          <div className="bg-background/80 backdrop-blur-xl p-2.5 rounded-full border border-white/10 shadow-lg">
            <ArrowDown className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Receive (fiat) */}
        <div className="bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-inner">
          <div className="flex justify-between items-center mb-3">
            <label className="text-muted-foreground text-xs font-black tracking-widest uppercase">You receive</label>
            {selectedCurrency ? <CurrencyChip currency={selectedCurrency} /> : null}
          </div>
          <input
            type="text" readOnly value={fiatAmount || ""} placeholder="0.00"
            className="w-full bg-transparent text-4xl font-black text-emerald-400 outline-none h-12 tracking-tight placeholder:text-white/15"
          />
          {isLoadingQuote && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />)}
              </div>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Calculating...</span>
            </div>
          )}
        </div>

        {/* Quote breakdown */}
        <AnimatePresence>
          {quote && !isLoadingQuote && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden"
            >
              <div className="p-4 space-y-2.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Rate</span>
                  <span className="text-white font-bold tabular-nums">
                    1 {selectedToken?.symbol} = {selectedCurrency?.symbol}{quote.rate.toLocaleString("en-NG", { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="font-medium">Provider Fee</span>
                    <div className="relative group">
                      <Info className="w-3.5 h-3.5 cursor-help" />
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 hidden group-hover:block bg-black/90 border border-white/10 rounded-xl px-3 py-2 text-xs w-52 z-50 text-white shadow-xl">
                        0.5% <span className="text-primary">Provider</span> fee is deducted from your total.
                      </div>
                    </div>
                  </div>
                  <span className="text-muted-foreground font-medium tabular-nums">
                    -{selectedCurrency?.symbol}{lpFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-white/5 pt-2.5">
                  <span className="text-white font-black uppercase tracking-widest text-xs">Total Payout</span>
                  <span className="text-emerald-400 font-black text-lg tabular-nums">
                    {selectedCurrency?.symbol}{netTotal.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <button
          onClick={() => { if (isFormValid) onSwapComplete?.(); }}
          disabled={!isFormValid || isLoadingQuote}
          className="w-full futuristic-button bg-primary text-white py-5 text-base font-black rounded-2xl shadow-[0_0_20px_rgba(100,150,255,0.2)] disabled:opacity-40 disabled:shadow-none tracking-widest uppercase transition-all"
        >
          {isLoadingQuote ? "Getting Quote..." : "Continue to Payout →"}
        </button>
      </div>
    </motion.div>
  );
}
