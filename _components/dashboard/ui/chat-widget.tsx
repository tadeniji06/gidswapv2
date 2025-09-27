"use client";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTwitter, FaInstagram, FaDiscord, FaWhatsapp, FaTimes, FaTelegram } from "react-icons/fa";
import Link from "next/link";
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(!isOpen)

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Chat Button */}
      <Button
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full w-14 h-14 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* Popup Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-20 right-0 w-72 bg-white text-gray-900 rounded-2xl shadow-2xl p-6 dark:bg-blue-950 dark:text-gray-50"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold mb-1">Contact us</h2>
              <button className="bg-transparent" onClick={close}><FaTimes /></button>
            </div>
            <p className="text-sm text-gray-900 mb-4 dark:text-gray-50">
              Got any questions? ask us.
            </p>

            <div className="space-y-4 text-sm ">
              <a href="mailto:support@gidswap.com" className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-900 dark:text-gray-50" />
                <a href="mailto:support@gidswap.com" className="text-gray-800 dark:text-gray-100 hover:underline">
                  support@gidswap.com
                </a>
              </a>
              <a href="tel:+2349038958941" className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-900 dark:text-gray-50" />
                <a href="tel:+2349038958941" className="text-gray-800 dark:text-gray-100 hover:underline">
                  +234 903 895 8941
                </a>
              </a>

            </div>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <Link href="#" className="p-2 rounded-full bg-gray-200 hover:bg-gray-200 dark:bg-blue-950/20">
                <FaTelegram className="w-5 h-5" />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-gray-200 hover:bg-gray-200 dark:bg-blue-950/20">
                <FaWhatsapp className="w-5 h-5" />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-gray-200 hover:bg-gray-200 dark:bg-blue-950/20">
                <FaTwitter className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
