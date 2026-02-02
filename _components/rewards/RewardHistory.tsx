"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
	ArrowDownLeft,
	ArrowUpRight,
	Clock,
	CheckCircle2,
	XCircle,
	History,
} from "lucide-react";
import { RewardTransaction } from "@/lib/services/rewards";
import { cn } from "@/lib/utils";

interface RewardHistoryProps {
	transactions: RewardTransaction[];
	isLoading?: boolean;
}

export default function RewardHistory({
	transactions,
	isLoading,
}: RewardHistoryProps) {
	if (isLoading) {
		return (
			<div className='space-y-4'>
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className='h-20 animate-pulse rounded-xl bg-zinc-900/50'
					/>
				))}
			</div>
		);
	}

	if (transactions.length === 0) {
		return (
			<div className='flex flex-col items-center justify-center py-12 text-center text-zinc-500'>
				<History className='mb-4 h-12 w-12 opacity-20' />
				<p>No reward activity yet.</p>
			</div>
		);
	}

	return (
		<div className='space-y-3'>
			{transactions.map((tx, index) => (
				<motion.div
					key={tx._id}
					initial={{ opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.2, delay: index * 0.05 }}
					className='group relative flex flex-col gap-3 rounded-xl border border-white/5 bg-zinc-900/30 p-4 transition-all hover:bg-zinc-900/50 hover:border-white/10'
				>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-4'>
							<div
								className={cn(
									"flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-zinc-400",
									tx.type === "earned"
										? "text-emerald-500"
										: "text-amber-500",
								)}
							>
								{tx.type === "earned" ? (
									<ArrowDownLeft size={16} />
								) : (
									<ArrowUpRight size={16} />
								)}
							</div>
							<div>
								<p className='text-sm font-medium text-zinc-200'>
									{tx.type === "earned"
										? "Points Earned"
										: "Withdrawal"}
								</p>
								<div className='flex items-center gap-2 text-xs text-zinc-500'>
									<span>
										{new Date(tx.createdAt).toLocaleDateString()}
									</span>
									<span className='opacity-50'>•</span>
									<span>
										{new Date(tx.createdAt).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
							</div>
						</div>

						<div className='text-right'>
							<p
								className={cn(
									"font-medium font-poppins text-sm",
									tx.type === "earned"
										? "text-emerald-400"
										: "text-zinc-400",
								)}
							>
								{tx.type === "earned" ? "+" : ""}
								{tx.points.toLocaleString()}
							</p>

							{/* Simple Status Dot */}
							{tx.type === "withdrawn" && tx.withdrawalDetails && (
								<div className='mt-1 flex items-center justify-end gap-1.5 text-[10px] uppercase tracking-wider font-medium'>
									{tx.withdrawalDetails.status === "completed" ? (
										<span className='text-emerald-500/80'>Paid</span>
									) : tx.withdrawalDetails.status === "failed" ? (
										<span className='text-red-500/80'>Failed</span>
									) : (
										<span className='text-amber-500/80'>Pending</span>
									)}
								</div>
							)}
						</div>
					</div>
				</motion.div>
			))}
		</div>
	);
}
