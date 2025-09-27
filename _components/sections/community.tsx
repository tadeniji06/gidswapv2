"use client";
import { motion } from "framer-motion";
import { FaFacebookF, FaTelegramPlane, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { AiOutlineDiscord } from "react-icons/ai";
import { BsTwitterX } from "react-icons/bs";
import Link from "next/link";

export default function Community() {
  const socialLinks = [
    {
      href: "https://www.x.com/gidswap_",
      icon: BsTwitterX,
      label: "Twitter",
      color: "from-blue-400 to-blue-600",
      hoverColor: "hover:from-blue-500 hover:to-blue-700",
    },
    {
      href: "https://wa.me/+234",
      icon: FaWhatsapp,
      label: "Whatsapp",
      color: "from-blue-500 to-blue-700",
      hoverColor: "hover:from-blue-600 hover:to-blue-800",
    },
    {
      href: "https://tiktok.gg/gidswap",
      icon: FaTiktok,
      label: "Tiktok",
      color: "from-indigo-400 to-purple-600",
      hoverColor: "hover:from-indigo-500 hover:to-purple-700",
    },
    {
      href: "https://t.me/gidswap",
      icon: FaTelegramPlane,
      label: "Telegram",
      color: "from-cyan-400 to-blue-500",
      hoverColor: "hover:from-cyan-500 hover:to-blue-600",
    },
  ];

  return (
    <section className="relative py-20 px-5 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-900/20" />

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* Main Heading */}
          <h2 className="flex flex-col gap-2 text-center font-semibold mb-6">
            <span className="text-3xl text-gray-600 dark:text-white/80 sm:text-[2.5rem] md:text-[3.5rem] lg:text-[4rem]">
              Join & Connect
            </span>
            <span className="text-[2rem] font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent sm:text-[3.25rem] md:text-[4rem]">
              with our Global Community
            </span>
          </h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            Be part of our growing community of innovators, traders, and crypto
            enthusiasts. Stay updated with the latest news, features, and
            connect with like-minded individuals.
          </motion.p>
        </motion.div>

        {/* Community Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="relative md:px-6"
        >
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200/50 max-w-6xl mx-auto dark:border-gray-700/50 rounded-3xl p-8 md:p-12 shadow-xl shadow-gray-200/20 dark:shadow-slate-900/20">
            {/* Gradient Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 w-full max-w-6xl via-purple-500/20 to-cyan-500/20 mx-auto rounded-3xl blur-xl -z-10" />

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[
                { number: "500+", label: "Community Members" },
                { number: "24/7", label: "Active Support" },
                { number: "50+", label: "Currencies" },
                { number: "1k+", label: "Transactions" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex justify-center items-center gap-6 md:gap-8">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <motion.div
                    key={social.label}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.6 + index * 0.1,
                      type: "spring",
                      stiffness: 200,
                    }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={social.href}
                      className="group relative block"
                      aria-label={social.label}
                    >
                      <div
                        className={`
                        relative w-16 h-16 md:w-20 md:h-20 rounded-2xl
                        bg-gradient-to-br ${social.color} ${social.hoverColor}
                        flex items-center justify-center
                        shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20
                        transition-all duration-300
                        group-hover:shadow-xl group-hover:shadow-blue-500/40
                        before:absolute before:inset-0 before:rounded-2xl
                        before:bg-gradient-to-br before:from-white/20 before:to-transparent
                        before:opacity-0 group-hover:before:opacity-100 before:transition-opacity
                      `}
                      >
                        <IconComponent className="text-white text-2xl md:text-3xl relative z-10 group-hover:scale-110 transition-transform duration-300" />

                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Tooltip */}
                      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-3 py-1 rounded-lg whitespace-nowrap">
                          {social.label}
                          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose your preferred platform and join thousands of users
                worldwide
              </p>
              {/* <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
              >
                Join Our Newsletter
              </motion.button> */}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
