"use client";

import { DesktopNav } from "@/_components/dashboard/navigation/desktop-nav";
import { MobileNav } from "@/_components/dashboard/navigation/mobile-nav";
import { useState } from "react";
import { MobileBottomNav } from "@/_components/dashboard/navigation/mobile-bottom-nav";
import { ChatWidget } from "@/_components/dashboard/ui/chat-widget";
import { navLinks } from "@/lib/constants";
// import { navLinks } from "../../dashboardb/page";
import { QueryClientProvider, } from "@tanstack/react-query";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeLink, setActiveLink] = useState("Swap");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d29] text-white">
      {/* Navigation */}
      <DesktopNav
        navLinks={navLinks}
        activeLink={activeLink}
        onLinkClick={setActiveLink}
      />
      <MobileNav />
      <main className="py-8 pb-12">{children}</main>
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        navLinks={navLinks}
        activeLink={activeLink}
        onLinkClick={setActiveLink}
      />

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
