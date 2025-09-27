"use client";
import Image from "next/image";
import { Moon, Sun, Mail, ArrowUp } from "lucide-react";
import { useTheme } from "next-themes";
import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import Link from "next/link";
import { motion } from "framer-motion";
import Newsletter from "../sections/Newsletter";
import { usePathname } from "next/navigation";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`flex h-11 items-center justify-between gap-2 rounded-full bg-blue-900/20 backdrop-blur-md border border-blue-400/20 p-1 transition-all w-full max-w-[200px] `}
    >
      <button
        onClick={() => setTheme("system")}
        className={`flex cursor-pointer items-center justify-center rounded-full transition-all duration-300 h-9 px-4 ${
          theme === "system"
            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
            : "text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
        }`}
        title="Switch to auto mode"
      >
        <span className="text-sm font-medium">Auto</span>
      </button>
      <button
        onClick={() => setTheme("light")}
        className={`flex cursor-pointer items-center justify-center rounded-full transition-all duration-300 h-9 w-9 ${
          theme === "light"
            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
            : "text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
        }`}
        title="Switch to light mode"
      >
        <Sun className="size-5" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`flex cursor-pointer items-center justify-center rounded-full transition-all duration-300 h-9 w-9 ${
          theme === "dark"
            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
            : "text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
        }`}
        title="Switch to dark mode"
      >
        <Moon className="size-5" />
      </button>
    </div>
  );
}

export default function Footer() {
  const date = new Date().getFullYear();
  const path = usePathname();
  const hideFooter = path?.startsWith("/dashboard");

  const socialLinks = [
    {
      href: "https://www.tiktok.com/gidswap_",
      icon: FaTiktok,
      label: "TikTok",
    },
    {
      href: "mailto:support@gidswap.com",
      icon: MdOutlineEmail,
      label: "Email",
    },
    {
      href: "https://www.instagram.com/gidswap",
      icon: FaInstagram,
      label: "Instagram",
    },
    {
      href: "https://api.whatsapp.com/send?phone=2349038958941",
      icon: FaWhatsapp,
      label: "WhatsApp",
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className={`${hideFooter ? "hidden" : "block"} relative overflow-hidden`}
    >
      {/* Futuristic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Glowing Orbs */}
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Logo and Description */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Image
                  src="/images/gidsfull.png"
                  width={120}
                  height={40}
                  className="object-contain brightness-0 invert"
                  priority
                  alt="gidswap logo"
                />
              </div>
            </div>
            <p className="text-blue-100/80 text-sm leading-relaxed max-w-md">
              The future of decentralized finance. Experience seamless, secure,
              and lightning-fast cryptocurrency exchanges.
            </p>

            {/* Newsletter Signup */}
            <Newsletter />
          </motion.div>

          <div className="flex"></div>

          {/* Contact & Social */}
          <motion.div
            className="space-y-6 flex flex-col md:items-end "
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Theme Toggle */}
            <div className="space-y-3">
              <span className="text-blue-100/70 text-sm">Theme Preference</span>
              <ThemeToggle />
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h4 className="text-blue-200 font-semibold text-lg">
                Connect With Us
              </h4>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <motion.div
                      key={social.label}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={social.href}
                        className="group relative"
                        aria-label={social.label}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-400/20 flex items-center justify-center transition-all duration-300 group-hover:border-blue-400/40 group-hover:shadow-lg group-hover:shadow-blue-500/25">
                          <IconComponent className="size-5 text-blue-300 group-hover:text-blue-100 transition-colors duration-300" />
                        </div>
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-blue-100/60">
            <span>© {date} All rights reserved</span>
            <div className="hidden md:block w-1 h-1 bg-blue-400/40 rounded-full" />
            <Link
              href="https://gidswap.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-100 transition-colors duration-300 hover:underline"
            >
              Powered by Gidswap
            </Link>
          </div>

          {/* Back to Top Button */}
          <motion.button
            onClick={scrollToTop}
            className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-400/20 rounded-full text-blue-300 hover:text-blue-100 transition-all duration-300 hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/25"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-sm">Back to Top</span>
            <ArrowUp className="size-4 group-hover:-translate-y-1 transition-transform duration-300" />
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom Glow Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
    </footer>
  );
}
