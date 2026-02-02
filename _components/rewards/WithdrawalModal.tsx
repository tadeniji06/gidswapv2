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
							className='relative w-full max-w-md overflow-hidden rounded-2xl border border-white/5 bg-zinc-950 p-6 shadow-2xl ring-1 ring-white/5'
						>
							<div className='relative z-10'>
								<div className='flex items-center justify-between mb-6 border-b border-white/5 pb-4'>
									<div>
										<h3 className='text-lg font-medium text-white font-poppins'>
											Withdraw Rewards
										</h3>
										<p className='text-xs text-zinc-500 mt-1'>
											Transfer points directly to your bank
										</p>
									</div>
									<button
										onClick={onClose}
										className='rounded-full bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors'
									>
										<X size={16} />
									</button>
								</div>

								<form onSubmit={handleSubmit} className='space-y-4'>
									<div className='space-y-2'>
										<label className='text-xs uppercase tracking-wider font-semibold text-zinc-500'>
											Amount (Points)
										</label>
										<div className='relative group'>
											<Banknote className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors' />
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
												className='w-full rounded-xl border border-white/5 bg-zinc-900/50 py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:border-white/10 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all'
												placeholder='Min 5000'
											/>
										</div>
										<div className='flex justify-between text-[10px] uppercase tracking-wide text-zinc-500'>
											<span>Min: 5000</span>
											<span
												className={
													formData.points > maxAmount
														? "text-red-400"
														: ""
												}
											>
												Max: {maxAmount.toLocaleString()}
											</span>
										</div>
									</div>

									<div className='space-y-2'>
										<label className='text-xs uppercase tracking-wider font-semibold text-zinc-500'>
											Bank Name
										</label>
										<div className='relative group'>
											<Building className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors' />
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
												className='w-full rounded-xl border border-white/5 bg-zinc-900/50 py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:border-white/10 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all'
												placeholder='e.g. Zenith Bank'
											/>
										</div>
									</div>

									<div className='space-y-2'>
										<label className='text-xs uppercase tracking-wider font-semibold text-zinc-500'>
											Account Number
										</label>
										<div className='relative group'>
											<Banknote className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors' />
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
												className='w-full rounded-xl border border-white/5 bg-zinc-900/50 py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:border-white/10 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all'
												placeholder='0123456789'
											/>
										</div>
									</div>

									<div className='space-y-2'>
										<label className='text-xs uppercase tracking-wider font-semibold text-zinc-500'>
											Account Name
										</label>
										<div className='relative group'>
											<User className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors' />
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
												className='w-full rounded-xl border border-white/5 bg-zinc-900/50 py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:border-white/10 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all'
												placeholder='John Doe'
											/>
										</div>
									</div>

									<button
										type='submit'
										disabled={withdrawMutation.isPending}
										className='relative mt-4 w-full overflow-hidden rounded-xl bg-white py-3 font-semibold text-black shadow-lg transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-70'
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
