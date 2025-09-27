"use client";

import type React from "react";

import Hero from "@/_components/sections/Hero";
import WaysToUse from "@/_components/sections/WaysToUse";
import RatesSection from "@/_components/sections/Rates";
import FaqsSection from "@/_components/sections/Faqs";
import VideoSection from "@/_components/sections/OnboardVideo";
import Community from "@/_components/sections/community";

export default function LandingPage() {
  return (
    <div className="min-h-full min-w-full bg-white transition-colors dark:bg-neutral-900">
      {/* Main Content */}
      <div className="relative mx-auto flex min-h-dvh flex-col items-center transition-all">
        <main className="w-full flex-grow max-w-full">
          <div className="flex w-full flex-col">
            {/* Hero Section */}
            <Hero />

            {/* Video Section */}
            <VideoSection />

            {/* Ways to Use Noblocks */}
            <WaysToUse />

            {/* Rates Section */}
            <RatesSection />

            {/* FAQ Section */}
            <FaqsSection />

            <Community />
          </div>
        </main>
      </div>
    </div>
  );
}
