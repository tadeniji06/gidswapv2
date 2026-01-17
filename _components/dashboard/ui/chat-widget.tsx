"use client";
import { useState } from "react";
// import { Button } from "@/src/components/ui/button";
import { MessageCircle, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
	FaTwitter,
	FaWhatsapp, 
 FaInstagram,
	FaTiktok,
	FaTimes,
	FaTelegram,
} from "react-icons/fa";
import Link from "next/link";

export function ChatWidget() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className='fixed bottom-20 right-6 z-50 md:bottom-10 md:right-10'>
			{/* Chat Button */}
			<motion.button
				onClick={() => setIsOpen(!isOpen)}
				className='
          w-14 h-14 rounded-full flex items-center justify-center
          bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-100
          shadow-xl border border-gray-200 dark:border-neutral-700
        '
				initial={{ scale: 1 }}
				whileTap={{ scale: 0.92 }}
				animate={{
					scale: [1, 1.08, 1],
				}}
				transition={{
					repeat: Infinity,
					repeatDelay: 60, // bounce every 60 sec
					duration: 0.6,
					ease: "easeInOut",
				}}
			>
				<MessageCircle className='w-6 h-6' />
			</motion.button>

			{/* Popup Panel */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.95 }}
						transition={{ duration: 0.25, ease: "easeOut" }}
						className='
              absolute bottom-20 right-0 w-72 
              bg-white dark:bg-neutral-900 
              text-gray-900 dark:text-gray-50 
              rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-700 
              p-5 backdrop-blur-xl
            '
					>
						<div className='flex justify-between items-center mb-2'>
							<h2 className='text-lg font-semibold'>Contact Us</h2>
							<button
								className='text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
								onClick={() => setIsOpen(false)}
							>
								<FaTimes />
							</button>
						</div>

						<p className='text-sm text-gray-600 dark:text-gray-300 mb-4'>
							We’re here to help. Reach out anytime.
						</p>

						{/* Contact links */}
						<div className='space-y-4 text-sm'>
							{/* Email */}
							<a
								href='mailto:support@gidswap.com'
								className='flex items-center gap-3 group'
							>
								<Mail className='w-4 h-4 text-gray-700 dark:text-gray-200' />
								<span className='group-hover:underline'>
									support@gidswap.com
								</span>
							</a>

							{/* Phone */}
							<a
								href='tel:+2349038958941'
								className='flex items-center gap-3 group'
							>
								<Phone className='w-4 h-4 text-gray-700 dark:text-gray-200' />
								<span className='group-hover:underline'>
									+234 903 895 8941
								</span>
							</a>
						</div>

						{/* Socials */}
						<div className='flex gap-3 mt-6'>
							<Link
								href='https://t.me/gidswap'
								className='
                  p-2 rounded-full bg-gray-100 dark:bg-neutral-800 
                  hover:bg-gray-200 dark:hover:bg-neutral-700 transition
                '
							>
								<FaTelegram className='w-5 h-5' />
							</Link>

							<Link
								href='https://wa.me/2349038958941'
								className='
                  p-2 rounded-full bg-gray-100 dark:bg-neutral-800 
                  hover:bg-gray-200 dark:hover:bg-neutral-700 transition
                '
							>
								<FaWhatsapp className='w-5 h-5' />
							</Link>

							<Link
								href='https://x.com/gidswap_'
								className='
                  p-2 rounded-full bg-gray-100 dark:bg-neutral-800 
                  hover:bg-gray-200 dark:hover:bg-neutral-700 transition
                '
							>
								<FaTwitter className='w-5 h-5' />
							</Link>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
