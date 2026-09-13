"use client";

import { DesktopNav } from "@/_components/dashboard/navigation/desktop-nav";
import { MobileNav } from "@/_components/dashboard/navigation/mobile-nav";
import { useState } from "react";
import { MobileBottomNav } from "@/_components/dashboard/navigation/mobile-bottom-nav";
import { ChatWidget } from "@/_components/dashboard/ui/chat-widget";
import { navLinks } from "@/lib/constants";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeLink, setActiveLink] = useState("Swap");

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
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
      <ChatWidget />
    </div>
  );
}
