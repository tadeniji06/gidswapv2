"use client";

import { useAuthStore } from "@/store/Authstore";
import { AlertCircle, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export function KycFloatingWidget() {
  const { isAuthenticated, user } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Only show if user is authenticated and KYC is NOT verified
    if (isAuthenticated && user && (!user.kyc || user.kyc.status !== "verified")) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isAuthenticated, user]);

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="relative bg-[#2a2d3a] border border-blue-500/30 shadow-2xl rounded-2xl p-4 w-72 flex flex-col items-start gap-2">
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Close KYC prompt"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1">
          <AlertCircle className="w-5 h-5" />
          <span>Action Required</span>
        </div>
        <p className="text-sm text-gray-300">
          Your account is not fully verified. Complete KYC to unlock all features.
        </p>
        <Link
          href="/dashboard/account"
          className="mt-2 w-full text-center bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          Verify Now
        </Link>
      </div>
    </div>
  );
}
