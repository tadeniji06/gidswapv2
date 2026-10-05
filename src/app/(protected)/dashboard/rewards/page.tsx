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
import { Button } from "@/src/components/ui/button";

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
			<div className='flex h-[80vh] items-center justify-center text-red-600 dark:text-red-400'>
				<div className='text-center'>
					<p className="font-medium">Failed to load rewards data.</p>
					<Button
						variant="outline"
						onClick={() => window.location.reload()}
						className='mt-4'
					>
						Retry
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-12 p-4 md:p-8 max-w-7xl mx-auto'>
			{/* Hero / Header Section */}
			<div className='flex flex-col-reverse justify-between gap-8 md:flex-row md:items-center'>
				<div className='space-y-4'>
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
					>
						<h1 className='text-4xl font-semibold tracking-tight text-foreground'>
							Rewards Program
						</h1>
						<p className='mt-2 text-lg text-muted-foreground font-medium max-w-md'>
							Earn points on every swap and convert them directly to
							cash. Simple as that.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
					>
						<Button
							size="lg"
							onClick={() => setIsWithdrawModalOpen(true)}
							disabled={!summary?.canWithdraw}
							className='group rounded-xl font-semibold mt-4 text-base px-8'
						>
							<Coins className='h-5 w-5 mr-2' />
							{summary?.canWithdraw
								? "Withdraw Rewards"
								: "Keep Earning to Withdraw"}
						</Button>
						{!summary?.canWithdraw && (
							<p className='mt-2 text-sm text-muted-foreground font-medium ml-2'>
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
			<div className='grid gap-6 md:grid-cols-3'>
				<RewardStatCard
					title='Available Balance'
					value={
						isLoading
							? "..."
							: (summary?.currentBalance || 0).toLocaleString()
					}
					icon={Wallet}
					description='Redeemable Points'
					gradient='text-blue-600 dark:text-blue-400'
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
					gradient='text-emerald-600 dark:text-emerald-400'
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
					gradient='text-purple-600 dark:text-purple-400'
					delay={0.3}
				/>
			</div>

			{/* Main Content Area */}
			<div className='grid gap-12 lg:grid-cols-3'>
				{/* Recent Activity Section */}
				<div className='lg:col-span-2 space-y-6'>
					<h3 className='text-xl font-semibold text-foreground border-b border-border pb-4'>
						Transaction History
					</h3>
					<RewardHistory
						transactions={historyData?.rewards || []}
						isLoading={isHistoryLoading || isLoading}
					/>
				</div>

				{/* Info/Rules Section - Minimalist */}
				<div className='space-y-6'>
					<div className='rounded-2xl border border-border bg-card shadow-sm p-6'>
						<h3 className='mb-5 text-sm font-bold text-foreground uppercase tracking-wider'>
							How it works
						</h3>
						<ul className='space-y-5 text-sm text-muted-foreground font-medium'>
							<li className='flex items-start gap-4'>
								<span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-primary text-xs font-bold'>
									1
								</span>
								<span className="leading-relaxed">
									Earn <span className='text-foreground font-semibold'>1 Point</span>{" "}
									for every <span className='text-foreground font-semibold'>$1</span>{" "}
									worth of crypto swapped.
								</span>
							</li>
							<li className='flex items-start gap-4'>
								<span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-primary text-xs font-bold'>
									2
								</span>
								<span className="leading-relaxed">
									Points are verified and credited immediately after
									successful transaction.
								</span>
							</li>
							<li className='flex items-start gap-4'>
								<span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-primary text-xs font-bold'>
									3
								</span>
								<span className="leading-relaxed">
									Reach{" "}
									<span className='text-foreground font-semibold'>5,000 Points</span>{" "}
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
