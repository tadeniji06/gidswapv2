"use client";
import { Button } from "@/src/components/ui/button";
import type React from "react";

import Image from "next/image";
import { Sun, Moon, LucideProps } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { useAuthStore } from "@/store/Authstore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
interface NavLink {
  name: string;
  // icon: React.ReactNode;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  href: string;
}

interface DesktopNavProps {
  navLinks: NavLink[];
  activeLink: string;
  onLinkClick: (linkName: string) => void;
}

export function DesktopNav({
  navLinks,
  activeLink,
  onLinkClick,
}: DesktopNavProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter()
  const {logout} = useAuthStore();
  const handleLogout  = () => {
    logout()
    router.push("/")
    toast.info("Logged out")
  }

  return (
    <nav className="hidden sticky top-0 z-50 bg-white dark:bg-[#1a1d29] md:flex items-center justify-between px-6 py-4 border-b border-gray-300">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div className="relative flex items-center gap-2 flex-shrink-0 group">
          {theme === "dark" ? (
            <Image
              src="/images/gidsfull.png"
              alt="Logo"
              width={100}
              height={80}
            />
          ) : (
            <Image
              src="/images/Gidswaplogo.png"
              alt="Logo"
              width={100}
              height={80}
            />
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href}>
              <Button
                variant="ghost"
                className={`flex items-center gap-2 text-gray-600 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 bg-transparent ${
                  activeLink === link.name
                    ? "border-2 border-blue-600 text-blue-600 rounded-full"
                    : ""
                } hover:bg-blue-400/10`}
                onClick={() => onLinkClick(link.name)}
              >
                <link.icon className="w-5 h-5" />
                {/* {link.icon} */}
                <span className="hidden md:inline">{link.name}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-gray-400 hover:text-white"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-gray-100" />
          ) : (
            <Moon className="w-5 h-5 text-gray-800" />
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="text-red-700 hover:text-red-600 dark:text-red-600 dark:bg-transparent dark:border-none hover:bg-red-200  px-6 py-2 bg-transparent"
        >
          Logout
        </Button>
      </div>
    </nav>
  );
}
