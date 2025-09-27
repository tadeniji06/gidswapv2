"use client";
import { useEffect, useState } from "react";
import type React from "react";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/components/ui/button";

interface ResponsiveModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function ResponsiveModal({
  open,
  onClose,
  children,
  title,
}: ResponsiveModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: isMobile
      ? { y: "100%", opacity: 0 }
      : { scale: 0.8, opacity: 0, y: 20 },
    visible: isMobile ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1, y: 0 },
    exit: isMobile
      ? { y: "100%", opacity: 0 }
      : { scale: 0.8, opacity: 0, y: 20 },
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div
            className={`relative w-full h-full flex ${
              isMobile ? "items-end" : "items-center justify-center"
            }`}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.3,
              }}
              className={`
                relative w-full max-w-md mx-auto
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-700
                shadow-2xl
                ${
                  isMobile
                    ? "rounded-t-3xl min-h-[60vh] max-h-[90vh] overflow-y-auto"
                    : "rounded-2xl max-h-[90vh] overflow-y-auto m-4"
                }
              `}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                {title && (
                  <h2 className="text-base font-medium text-gray-900 dark:text-white">
                    {title}
                  </h2>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="px-6 py-6">{children}</div>

              {/* Mobile handle indicator */}
              {isMobile && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
