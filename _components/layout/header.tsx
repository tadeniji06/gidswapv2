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

export default function Header() {
  const {
    isAuthenticated,
    regStatus,
    setRegisterModalOpen,
    setLoginModalOpen,
    initializeAuth,
    logout,
  } = useAuthStore();

  useEffect(() => {
    initializeAuth();
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
      className={theme === "dark" ? `sticky left-0 top-0 z-20 w-full bg-transparent backdrop-blur transition-all dark:bg-transparent ${
        hideHeader ? "hidden" : "block"
      }`: `sticky left-0 top-0 z-20 w-full bg-white backdrop-blur transition-all dark:bg-transparent ${
        hideHeader ? "hidden" : "block"
      }`}
    >
      <nav className="mx-auto container max-w-6xl flex items-center justify-between py-3 px-4 text-neutral-900 dark:text-white">
        {/* Logo & dropdown */}
        <div className="relative flex-shrink-0 group">
          {/* Trigger (logo + chevron) */}
          <div className="flex items-center gap-2 cursor-pointer">
            {theme === "light" ? (
              <Image
                src="/images/Gidswaplogo.png"
                alt="Logo"
                width={100}
                height={80}
              />
            ) : (
              <Image
                src="/images/gidsfull.png"
                alt="Logo"
                width={100}
                height={80}
              />
            )}
            {/* <ChevronDown className="hidden sm:inline size-5 text-gray-400 dark:text-white/50 transition-transform duration-200 group-hover:rotate-180" /> */}
          </div>


          {/* Popup - stays inside same group */}
          {/* <div
            className="absolute top-full left-0 mt-2 flex-col gap-3 w-[9rem] text-gray-800 text-sm 
                  bg-white/90 dark:bg-transparent backdrop-blur-sm p-3 rounded-sm shadow-md 
                  dark:text-gray-200 z-50 hidden group-hover:flex"
          >
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/policy" className="hover:underline">
              Terms
            </Link>
          </div>*/}
        </div> 

        {/* CTA */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" passHref>
                <Button className="futuristic-button bg-black/20 dark:bg-white/20 backdrop-blur-sm text-blue-600/90 font-semibold text-sm hover:bg-blue-300/20">
                  Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              {regStatus ? (
                <Button
                  onClick={handleSignInClick}
                  className="futuristic-button bg-black/20 dark:bg-white/20 backdrop-blur-md text-blue-600/90 font-semibold text-sm hover:bg-blue-300/20"
                >
                  Sign in
                </Button>
              ) : (
                <Button
                  onClick={handleRegisterClick}
                  className="futuristic-button bg-black/20 dark:bg-white/20 backdrop-blur-md text-blue-600/90 font-semibold text-sm hover:bg-blue-300/20"
                >
                  Register
                </Button>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
