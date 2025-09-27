"use client";

import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import type React from "react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { LucideProps } from "lucide-react";

interface NavLink {
  name: string;
  // icon: React.ReactNode;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  href: string;
}

interface MobileBottomNavProps {
  navLinks: NavLink[];
  activeLink: string;
  onLinkClick: (linkName: string) => void;
}

export function MobileBottomNav({
  navLinks,
  activeLink,
  onLinkClick,
}: MobileBottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#2a2d3a] border-t border-gray-500">
      <div className="flex items-center justify-around py-3">
        {navLinks.map((link) => (
          <Link key={link.name} href={link.href}>
            <Button
              variant="ghost"
              className={`flex flex-col items-center gap-1 text-gray-600 dark:text-white py-4 hover:text-blue-600 dark:hover:text-blue-400 bg-transparent rounded-none ${
                activeLink === link.name
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : ""
              } hover:bg-blue-400/10`}
              onClick={() => onLinkClick(link.name)}
            >
              <link.icon className="w-5 h-5" />
              {/* {link.icon} */}
              <span className="text-xs">{link.name}</span>
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  );
}
