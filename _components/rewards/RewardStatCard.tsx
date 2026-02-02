"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface RewardStatCardProps {
	title: string;
	value: string | number;
	icon: React.ElementType;
	description?: string;
	className?: string;
	gradient?: string;
	delay?: number;
}

export default function RewardStatCard({
	title,
	value,
	icon: Icon,
	description,
	className,
	gradient = "text-blue-500", // Changed default to text color class
	delay = 0,
}: RewardStatCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay }}
			className={cn(
				"group relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-sm p-6 hover:border-white/10 transition-colors",
				className,
			)}
		>
			<div className='relative z-10 flex items-start justify-between'>
				<div>
					<p className='text-sm font-medium text-zinc-400'>{title}</p>
					<h3 className='mt-2 text-3xl font-light tracking-tight text-white font-poppins'>
						{value}
					</h3>
					{description && (
						<p className='mt-1 text-xs text-zinc-500'>
							{description}
						</p>
					)}
				</div>
				<div
					className={cn(
						"rounded-xl p-3 bg-white/5 ring-1 ring-white/5 group-hover:bg-white/10 transition-colors",
						// gradient is now used for icon color if provided, or we can use generic
					)}
				>
					<Icon className={cn("h-6 w-6", gradient)} />
				</div>
			</div>

			{/* Subtle glow effect on hover only */}
			<div className='absolute inset-0 -z-10 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
		</motion.div>
	);
}
