"use client";
import type React from "react";
import { useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { faqs } from "@/lib/constants";
import { Minus, Plus } from "lucide-react";
import { useRef } from "react";

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
      animate={
        isInView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 50, filter: "blur(10px)" }
      }
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function FaqsSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className="relative py-20 px-5 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-blue-50/20 dark:from-slate-900/50 dark:to-blue-900/10" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/10 dark:bg-blue-500/5 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200/10 dark:bg-purple-500/5 rounded-full blur-xl animate-pulse delay-1000" />

      <AnimatedSection className="relative z-10 w-full">
        <div className="mx-auto mb-20 flex w-full max-w-[999px] flex-col gap-6 lg:mb-30 lg:grid lg:grid-cols-[1fr_2fr]">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <h2 className="flex gap-1 text-center text-3xl font-semibold italic sm:gap-2 sm:text-5xl md:text-6xl lg:max-w-[294px] lg:flex-col lg:items-start lg:gap-5 lg:text-left lg:leading-[0.9] flex-wrap">
              <span className="text-gray-800 dark:text-white/90">
                Frequently{" "}
              </span>
              <span className="text-gray-800 dark:text-white/90">Asked </span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-6 text-gray-600 dark:text-gray-400 lg:text-left text-center max-w-md"
            >
              Find answers to common questions about Noblocks and how our
              platform works.
            </motion.p>
          </motion.div>

          {/* FAQ Items */}
          <div className="flex flex-col gap-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-300">
                  {/* Question Button */}
                  <motion.button
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-center gap-4 p-6 text-left focus:outline-none group-hover:bg-gray-50/50 dark:group-hover:bg-slate-700/50 transition-colors duration-300"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {/* Icon */}
                    <motion.div
                      animate={{
                        backgroundColor:
                          openFaq === index ? "#3b82f6" : "#e5e7eb",
                        scale: openFaq === index ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="flex h-8 w-8 items-center justify-center rounded-full dark:bg-slate-600"
                    >
                      <AnimatePresence mode="wait">
                        {openFaq === index ? (
                          <motion.div
                            key="minus"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Minus className="h-4 w-4 text-white" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="plus"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Plus className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Question Text */}
                    <span className="text-base font-semibold text-gray-900 dark:text-white/90 flex-1 pr-4">
                      {faq.question}
                    </span>

                    {/* Chevron Indicator */}
                    <motion.div
                      animate={{ rotate: openFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="text-gray-400 dark:text-gray-500"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </motion.div>
                  </motion.button>

                  {/* Answer Section with Smooth Animation */}
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: { duration: 0.4, ease: "easeInOut" },
                          opacity: { duration: 0.3, ease: "easeInOut" },
                        }}
                        className="overflow-hidden"
                      >
                        <motion.div
                          initial={{ y: -10 }}
                          animate={{ y: 0 }}
                          exit={{ y: -10 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="px-6 pb-6"
                        >
                          <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Gradient Border Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/5 group-hover:to-cyan-500/10 transition-all duration-500 pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
