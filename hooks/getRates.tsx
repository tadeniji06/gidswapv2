"use client";

import { useState, useEffect } from "react";

export function useExchangeRate(sendCurrencyId: string, receiveCurrencyId: string) {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sendCurrencyId && receiveCurrencyId) {
      const fetchRate = async () => {
        try {
          setLoading(true);

          const res = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${sendCurrencyId}&vs_currencies=${receiveCurrencyId.toLowerCase()}`
          );

          const data = await res.json();
          setRate(data[sendCurrencyId]?.[receiveCurrencyId.toLowerCase()] ?? null);
        } catch (err) {
          console.error("Error fetching rate", err);
          setRate(null);
        } finally {
          setLoading(false);
        }
      };

      fetchRate();
    }
  }, [sendCurrencyId, receiveCurrencyId]);

  return { rate, loading };
}
