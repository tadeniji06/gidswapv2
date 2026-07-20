"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone
    ) {
      return;
    }

    // Check if user is on iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(userAgent));

    // Show prompt after a short delay regardless of event (so iOS gets it too)
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 3000);

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the native install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      // We no longer need the prompt. Clear it up
      setDeferredPrompt(null);
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
    } else {
      // No native prompt available, show manual instructions
      setShowInstructions(true);
    }
  };

  if (!showPrompt || isDismissed) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-[#1e2029] border border-blue-500/20 shadow-2xl rounded-2xl p-6 w-full max-w-sm flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-300">
        
        {showInstructions ? (
          <>
            <button onClick={() => setIsDismissed(true)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
              <Download className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-white">How to Install</h2>
            <div className="text-sm text-gray-300 space-y-3 mb-2">
              {isIos ? (
                <>
                  <p>1. Tap the <strong>Share</strong> button at the bottom of your screen.</p>
                  <p>2. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
                  <p>3. Tap <strong>Add</strong> in the top right corner.</p>
                </>
              ) : (
                <>
                  <p>1. Tap the browser menu (three dots) in the top right.</p>
                  <p>2. Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>
                  <p>3. Follow the on-screen prompts.</p>
                </>
              )}
            </div>
            <button
              onClick={() => setIsDismissed(true)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all"
            >
              Got it!
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
              <Download className="w-8 h-8 text-blue-500" />
            </div>
            
            <h2 className="text-xl font-bold text-white">Install Gidswap</h2>
            
            <p className="text-sm text-gray-300 mb-2">
              Install our web app on your device for faster access, offline support, and a seamless native experience!
            </p>

            <div className="w-full flex flex-col gap-3 mt-2">
              <button
                onClick={handleInstallClick}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all active:scale-[0.98]"
              >
                Install App
              </button>
              
              <button
                onClick={() => setIsDismissed(true)}
                className="w-full bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-medium py-3 px-4 rounded-xl transition-all"
              >
                Not Interested
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
