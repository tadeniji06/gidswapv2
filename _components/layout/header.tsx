"use client";

import { useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import Image from "next/image";
import PolicyPrivacyPop from "../policy-privacy";
import { ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/Authstore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";

export default function Header() {
  const {
    isAuthenticated,
    regStatus,
    setRegisterModalOpen,
    setLoginModalOpen,
    initializeAuth,
    logout,
  } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    initializeAuth();
    setMounted(true);
  }, [initializeAuth]);

  const handleRegisterClick = () => {
    setRegisterModalOpen(true);
  };

  const handleSignInClick = () => {
    setLoginModalOpen(true);
  };

  const path = usePathname();
  const hideHeader = path?.startsWith("/dashboard");
  const { theme } = useTheme();
  return (
    <header
      className={`sticky left-0 top-0 z-50 w-full transition-all duration-300 ${
        hideHeader ? "hidden" : "block"
      } ${mounted && theme === "dark" ? "glass-panel border-b border-white/5" : "bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm"}`}
    >
      <nav className="mx-auto container max-w-7xl flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-300">
          {mounted && theme === "light" ? (
            <Image
              src="/images/Gidswaplogo.png"
              alt="Logo"
              width={110}
              height={40}
              className="select-none"
            />
          ) : (
            <Image
              src="/images/gidsfull.png"
              alt="Logo"
              width={110}
              height={40}
              className="select-none"
            />
          )}
        </Link>

        {/* CTA */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link href="/dashboard" passHref>
              <Button className="futuristic-button bg-primary text-white font-bold text-sm px-8 py-6 rounded-2xl shadow-[0_0_20px_rgba(100,150,255,0.3)]">
                DASHBOARD
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleSignInClick}
                className="text-muted-foreground hover:text-white font-bold text-xs tracking-widest uppercase px-6"
              >
                Sign in
              </Button>
              <Button
                onClick={handleRegisterClick}
                className="futuristic-button bg-primary text-white font-black text-xs tracking-widest uppercase px-8 py-5 rounded-xl shadow-[0_0_15px_rgba(100,150,255,0.2)]"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
