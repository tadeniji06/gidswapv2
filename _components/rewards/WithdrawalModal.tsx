"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Banknote, Building, User } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	rewardsService,
	WithdrawalRequest,
} from "@/lib/services/rewards";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WithdrawalModalProps {
	isOpen: boolean;
	onClose: () => void;
	maxAmount: number;
}

export default function WithdrawalModal({
	isOpen,
	onClose,
	maxAmount,
}: WithdrawalModalProps) {
	const [formData, setFormData] = useState<WithdrawalRequest>({
		points: 5000,
		accountDetails: {
			accountNumber: "",
			bankName: "",
			accountName: "",
		},
	});

	const queryClient = useQueryClient();

	const withdrawMutation = useMutation({
		mutationFn: rewardsService.withdraw,
		onSuccess: (data) => {
			toast.success(data.message || "Withdrawal request submitted!");
			queryClient.invalidateQueries({
				queryKey: ["rewards-summary"],
			});
			onClose();
		},
		onError: (error: any) => {
			toast.error(
				error.response?.data?.message || "Failed to withdraw",
			);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (formData.points < 5000) {
			toast.error("Minimum withdrawal is 5000 Points");
			return;
		}
		if (formData.points > maxAmount) {
			toast.error("Insufficient balance");
			return;
		}
		withdrawMutation.mutate(formData);
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm'
					/>
					<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							className='relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl'
						>
							{/* Decorative background */}
							<div className='absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl' />
							<div className='absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl' />

							<div className='relative z-10'>
								<div className='flex items-center justify-between mb-6'>
									<h3 className='text-xl font-bold text-white'>
										Withdraw Rewards
									</h3>
									<button
										onClick={onClose}
										className='rounded-full bg-white/5 p-2 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors'
									>
										<X size={18} />
									</button>
								</div>

								<form onSubmit={handleSubmit} className='space-y-4'>
									<div className='space-y-2'>
										<label className='text-sm font-medium text-muted-foreground'>
											Amount to Withdraw (Points)
										</label>
										<div className='relative'>
											<Banknote className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
											<input
												type='number'
												min='5000'
												value={formData.points}
												onChange={(e) =>
													setFormData({
														...formData,
														points: parseInt(e.target.value) || 0,
													})
												}
												className='w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
												placeholder='Min 5000'
											/>
										</div>
										<div className='flex justify-between text-xs text-muted-foreground'>
											<span>Min: 5000 PTS</span>
											<span
												className={
													formData.points > maxAmount
														? "text-red-400"
														: ""
												}
											>
												Max: {maxAmount.toLocaleString()} PTS
											</span>
										</div>
									</div>

									<div className='space-y-2'>
										<label className='text-sm font-medium text-muted-foreground'>
											Bank Name
										</label>
										<div className='relative'>
											<Building className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
											<input
												type='text'
												required
												value={formData.accountDetails.bankName}
												onChange={(e) =>
													setFormData({
														...formData,
														accountDetails: {
															...formData.accountDetails,
															bankName: e.target.value,
														},
													})
												}
												className='w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
												placeholder='e.g. Zenith Bank'
											/>
										</div>
									</div>

									<div className='space-y-2'>
										<label className='text-sm font-medium text-muted-foreground'>
											Account Number
										</label>
										<div className='relative'>
											<Banknote className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
											<input
												type='text'
												required
												value={formData.accountDetails.accountNumber}
												onChange={(e) =>
													setFormData({
														...formData,
														accountDetails: {
															...formData.accountDetails,
															accountNumber: e.target.value,
														},
													})
												}
												className='w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
												placeholder='0123456789'
											/>
										</div>
									</div>

									<div className='space-y-2'>
										<label className='text-sm font-medium text-muted-foreground'>
											Account Name
										</label>
										<div className='relative'>
											<User className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
											<input
												type='text'
												required
												value={formData.accountDetails.accountName}
												onChange={(e) =>
													setFormData({
														...formData,
														accountDetails: {
															...formData.accountDetails,
															accountName: e.target.value,
														},
													})
												}
												className='w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
												placeholder='John Doe'
											/>
										</div>
									</div>

									<button
										type='submit'
										disabled={withdrawMutation.isPending}
										className='relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-70'
									>
										{withdrawMutation.isPending ? (
											<span className='flex items-center justify-center gap-2'>
												<Loader2 className='animate-spin' size={18} />{" "}
												Processing...
											</span>
										) : (
											"Confirm Withdrawal"
										)}
									</button>
								</form>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}
