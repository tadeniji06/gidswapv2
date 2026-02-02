"use client";

import { motion } from "framer-motion";
import { Gift } from "lucide-react";

export default function FloatingGift() {
	return (
		<div className='relative h-24 w-24'>
			<motion.div
				animate={{
					y: [-10, 10, -10],
					rotate: [0, 5, -5, 0],
				}}
				transition={{
					duration: 4,
					repeat: Infinity,
					ease: "easeInOut",
				}}
				className='absolute inset-0 flex items-center justify-center'
			>
				<div className='relative'>
					{/* Glowing effect behind */}
					<div className='absolute -inset-4 rounded-full bg-blue-500/20 blur-xl animate-pulse' />

					{/* 3D-ish Gift Icon using Lucide but styled */}
					<Gift
						size={64}
						className='text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]'
						strokeWidth={1.5}
					/>

					{/* Sparkles */}
					<motion.div
						animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
						transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
						className='absolute -top-2 -right-2 h-2 w-2 rounded-full bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.8)]'
					/>
					<motion.div
						animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
						transition={{
							duration: 2.5,
							repeat: Infinity,
							delay: 1.2,
						}}
						className='absolute bottom-0 -left-2 h-1.5 w-1.5 rounded-full bg-blue-300 shadow-[0_0_10px_rgba(147,197,253,0.8)]'
					/>
				</div>
			</motion.div>
		</div>
	);
}
