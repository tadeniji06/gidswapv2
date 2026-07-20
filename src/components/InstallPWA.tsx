"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already installed or if user dismissed recently
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We no longer need the prompt. Clear it up
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt || isDismissed) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="relative bg-[#2a2d3a] border border-blue-500/30 shadow-2xl rounded-2xl p-4 w-72 flex flex-col items-start gap-3">
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Close install prompt"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1">
          <Download className="w-5 h-5" />
          <span>Install Gidswap</span>
        </div>
        <p className="text-sm text-gray-300">
          Install our app for faster access, offline support, and a better experience!
        </p>
        <button
          onClick={handleInstallClick}
          className="mt-1 w-full text-center bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          Install App
        </button>
      </div>
    </div>
  );
}
