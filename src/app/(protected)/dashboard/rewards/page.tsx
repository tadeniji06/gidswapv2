"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Wallet,
	TrendingUp,
	ArrowUpRight,
	Coins,
	Loader2,
} from "lucide-react";
import { rewardsService } from "@/lib/services/rewards";
import RewardStatCard from "@/_components/rewards/RewardStatCard";
import RewardHistory from "@/_components/rewards/RewardHistory";
import WithdrawalModal from "@/_components/rewards/WithdrawalModal";
import FloatingGift from "@/_components/rewards/FloatingGift";
import { motion } from "framer-motion";

export default function RewardsPage() {
	const [isWithdrawModalOpen, setIsWithdrawModalOpen] =
		useState(false);

	const {
		data: summary,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["rewards-summary"],
		queryFn: rewardsService.getSummary,
	});

	const { data: historyData, isLoading: isHistoryLoading } = useQuery(
		{
			queryKey: ["rewards-history"],
			queryFn: () => rewardsService.getHistory(1, 20),
		},
	);

	if (error) {
		return (
			<div className='flex h-[80vh] items-center justify-center text-red-400'>
				<div className='text-center'>
					<p>Failed to load rewards data.</p>
					<button
						onClick={() => window.location.reload()}
						className='mt-2 text-sm underline opacity-70'
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen space-y-12 p-4 pb-20 md:p-10'>
			{/* Hero / Header Section */}
			<div className='flex flex-col-reverse justify-between gap-8 md:flex-row md:items-center'>
				<div className='space-y-4'>
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
					>
						<h1 className='text-4xl font-light tracking-tight text-white font-poppins'>
							Rewards Program
						</h1>
						<p className='mt-2 text-lg text-zinc-400 font-light max-w-md'>
							Earn points on every swap and convert them directly to
							cash. Simple as that.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
					>
						<button
							onClick={() => setIsWithdrawModalOpen(true)}
							disabled={!summary?.canWithdraw}
							className='group flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100'
						>
							<Coins className='h-4 w-4 text-zinc-600 group-hover:text-black transition-colors' />
							{summary?.canWithdraw
								? "Withdraw Rewards"
								: "Keep Earning to Withdraw"}
						</button>
						{!summary?.canWithdraw && (
							<p className='mt-2 text-xs text-zinc-600 pl-4'>
								Min withdrawal: 5,000 pts
							</p>
						)}
					</motion.div>
				</div>

				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.8, type: "spring" }}
					className='flex justify-center md:justify-end pr-0 md:pr-10'
				>
					<FloatingGift />
				</motion.div>
			</div>

			{/* Stats Grid - Minimalist */}
			<div className='grid gap-4 md:grid-cols-3'>
				<RewardStatCard
					title='Available Balance'
					value={
						isLoading
							? "..."
							: (summary?.currentBalance || 0).toLocaleString()
					}
					icon={Wallet}
					description='Redeemable Points'
					gradient='text-blue-400'
					delay={0.1}
				/>
				<RewardStatCard
					title='Lifetime Earned'
					value={
						isLoading
							? "..."
							: (summary?.totalEarned || 0).toLocaleString()
					}
					icon={TrendingUp}
					description='Total Accumulated'
					gradient='text-emerald-400'
					delay={0.2}
				/>
				<RewardStatCard
					title='Total Withdrawn'
					value={
						isLoading
							? "..."
							: (summary?.totalWithdrawn || 0).toLocaleString()
					}
					icon={ArrowUpRight}
					description='Successfully Paid Out'
					gradient='text-purple-400'
					delay={0.3}
				/>
			</div>

			{/* Main Content Area */}
			<div className='grid gap-12 lg:grid-cols-3'>
				{/* Recent Activity Section */}
				<div className='lg:col-span-2 space-y-6'>
					<h3 className='text-xl font-light text-white font-poppins border-b border-zinc-800 pb-4'>
						Transaction History
					</h3>
					<RewardHistory
						transactions={historyData?.rewards || []}
						isLoading={isHistoryLoading || isLoading}
					/>
				</div>

				{/* Info/Rules Section - Minimalist */}
				<div className='space-y-6'>
					<div className='rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 p-6'>
						<h3 className='mb-4 text-base font-medium text-zinc-300 font-poppins uppercase tracking-wider'>
							How it works
						</h3>
						<ul className='space-y-4 text-sm text-zinc-500'>
							<li className='flex items-start gap-3'>
								<span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] text-zinc-300'>
									1
								</span>
								<span>
									Earn <span className='text-zinc-300'>1 Point</span>{" "}
									for every <span className='text-zinc-300'>$1</span>{" "}
									worth of crypto swapped.
								</span>
							</li>
							<li className='flex items-start gap-3'>
								<span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] text-zinc-300'>
									2
								</span>
								<span>
									Points are verified and credited immediately after
									successful transaction.
								</span>
							</li>
							<li className='flex items-start gap-3'>
								<span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] text-zinc-300'>
									3
								</span>
								<span>
									Reach{" "}
									<span className='text-zinc-300'>5,000 Points</span>{" "}
									to request a direct bank withdrawal.
								</span>
							</li>
						</ul>
					</div>
				</div>
			</div>

			{/* Withdrawal Modal */}
			<WithdrawalModal
				isOpen={isWithdrawModalOpen}
				onClose={() => setIsWithdrawModalOpen(false)}
				maxAmount={summary?.currentBalance || 0}
			/>
		</div>
	);
}
