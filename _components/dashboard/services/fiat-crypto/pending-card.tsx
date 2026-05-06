"use client";

import { useState, useEffect, JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
	Copy,
	Clock,
	Loader2,
	CheckCircle2,
	ShieldCheck,
	Banknote,
	RefreshCw,
	XCircle,
	PartyPopper,
	Sparkles,
	ArrowRight,
	ExternalLink,
	ChevronRight,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useFiatCryptoStore } from "@/lib/fiat-crypto-store";
import Cookies from "js-cookie";
import {
	Dialog,
	DialogContent,
	DialogTitle,
} from "@/src/components/ui/dialog";

function formatTimeLeft(endTimeStr: string) {
	const diff = new Date(endTimeStr).getTime() - Date.now();
	if (diff <= 0) return "Expired";
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((diff % (1000 * 60)) / 1000);
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function CopyField({
	label,
	value,
}: {
	label: string;
	value: string;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(value);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div
			className='group flex items-center justify-between bg-black/40 hover:bg-black/50 border border-white/5 hover:border-white/10 p-4 rounded-2xl transition-all duration-200 cursor-pointer'
			onClick={handleCopy}
		>
			<div className='min-w-0 flex-1'>
				<p className='text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1'>
					{label}
				</p>
				<p className='text-sm font-mono text-white truncate'>
					{value}
				</p>
			</div>
			<button className='flex-shrink-0 ml-3 w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-primary/20 transition-all duration-200'>
				{copied ? (
					<CheckCircle2 className='w-4 h-4 text-emerald-400' />
				) : (
					<Copy className='w-4 h-4 text-muted-foreground group-hover:text-white' />
				)}
			</button>
		</div>
	);
}

export function PendingPaymentCard({
	onNewTransaction,
}: {
	onNewTransaction: () => void;
}) {
	const { paymentOrder, pollPaymentStatus, selectedToken } =
		useFiatCryptoStore();
	const [timeLeft, setTimeLeft] = useState<string>("");
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [confettiActive, setConfettiActive] = useState(false);
	const [amountCopied, setAmountCopied] = useState(false);

	if (!paymentOrder || !paymentOrder.providerAccount) {
		return (
			<div className='w-full max-w-lg mx-auto glass-panel p-16 text-center rounded-3xl'>
				<div className='w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20'>
					<Loader2 className='w-8 h-8 text-primary animate-spin' />
				</div>
				<p className='text-muted-foreground font-bold'>
					Securing your transaction details...
				</p>
				<p className='text-muted-foreground/50 text-xs font-medium mt-2'>
					This only takes a moment
				</p>
			</div>
		);
	}

	const { providerAccount } = paymentOrder;

	const { data: isCompleted } = useQuery({
		queryKey: ["pollPayment", paymentOrder.id],
		queryFn: () => pollPaymentStatus(paymentOrder.id),
		refetchInterval: (query) => (query.state.data ? false : 3000),
		refetchIntervalInBackground: true,
	});

	useEffect(() => {
		if (isCompleted) {
			setShowSuccessModal(true);
			setConfettiActive(true);
			setTimeout(() => setConfettiActive(false), 4000);
		}
	}, [isCompleted]);

	useEffect(() => {
		if (!paymentOrder.validUntil) return;
		const interval = setInterval(
			() => setTimeLeft(formatTimeLeft(paymentOrder.validUntil)),
			1000,
		);
		return () => clearInterval(interval);
	}, [paymentOrder.validUntil]);

	const terminalStates = [
		"cancelled",
		"refunded",
		"expired",
		"failed",
	];
	const isTerminal = terminalStates.includes(paymentOrder.status);

	type StatusUI = {
		color: string;
		bg: string;
		border: string;
		icon: JSX.Element;
		text: string;
		sub: string;
	};
	const getStatusUI = (): StatusUI => {
		switch (paymentOrder.status) {
			case "settled":
			case "fulfilled":
			case "validated":
				return {
					color: "text-emerald-400",
					bg: "bg-emerald-400/10",
					border: "border-emerald-400/20",
					icon: <CheckCircle2 className='w-5 h-5' />,
					text: "Transfer Completed",
					sub: "Your crypto is on its way",
				};
			case "processing":
				return {
					color: "text-blue-400",
					bg: "bg-blue-400/10",
					border: "border-blue-400/20",
					icon: <Loader2 className='w-5 h-5 animate-spin' />,
					text: "Processing Deposit",
					sub: "Minting tokens to your wallet...",
				};
			case "failed":
			case "expired":
			case "cancelled":
				return {
					color: "text-red-400",
					bg: "bg-red-400/10",
					border: "border-red-400/20",
					icon: <XCircle className='w-5 h-5' />,
					text: "Payment Failed",
					sub: "Funds will be refunded if sent",
				};
			default:
				return {
					color: "text-blue-400",
					bg: "bg-blue-400/10",
					border: "border-blue-400/20",
					icon: (
						<div className='flex gap-2 px-1'>
							{[0, 1, 2].map((i) => (
								<motion.div
									key={i}
									className='w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]'
									animate={{
										opacity: [0.4, 1, 0.4],
										scale: [1, 1.25, 1],
										backgroundColor: [
											"#60a5fa",
											"#3b82f6",
											"#60a5fa",
										],
									}}
									transition={{
										duration: 1.8,
										repeat: Infinity,
										delay: i * 0.25,
										ease: "easeInOut",
									}}
								/>
							))}
						</div>
					),
					text: "Awaiting Transfer",
					sub: "Send exact amount to complete",
				};
		}
	};

	const statusUI = getStatusUI();
	const isExpiring =
		timeLeft !== "Expired" &&
		timeLeft !== "" &&
		parseInt(timeLeft.split(":")[0]) === 0 &&
		parseInt(timeLeft.split(":")[1]) < 120;

	return (
		<>
			<motion.div
				initial={{ opacity: 0, y: 24, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, scale: 0.96 }}
				transition={{ duration: 0.45 }}
				className='w-full max-w-lg mx-auto'
			>
				{/* Outer glow ring */}
				<div className='relative group'>
					<div className='absolute -inset-1 bg-gradient-to-r from-primary/30 via-blue-500/20 to-primary/30 rounded-[2.5rem] blur-lg opacity-30 group-hover:opacity-60 transition-all duration-1000' />

					<div className='relative glass-panel neon-border rounded-[2rem] overflow-hidden shadow-2xl'>
						{/* Top accent bar */}
						<div className='h-1 w-full bg-gradient-to-r from-primary via-blue-400 to-primary' />

						{/* Header */}
						<div className='p-6 md:p-8 border-b border-white/5 flex items-center gap-4'>
							<div className='w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 flex-shrink-0'>
								<Banknote className='w-7 h-7 text-primary' />
							</div>
							<div>
								<h3 className='text-xl font-black text-white tracking-tight'>
									Bank Transfer
								</h3>
							</div>
						</div>

						<div className='p-6 md:p-8 space-y-5'>
							{/* Amount + Timer */}
							<div className='bg-black/40 rounded-2xl p-5 border border-white/5 flex justify-between items-center group/amount relative overflow-hidden'>
								<div
									className='cursor-pointer flex-1'
									onClick={() => {
										navigator.clipboard.writeText(
											providerAccount.amountToTransfer,
										);
										setAmountCopied(true);
										setTimeout(() => setAmountCopied(false), 2000);
									}}
								>
									<p className='text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2'>
										Amount to transfer
										{amountCopied ? (
											<span className='text-emerald-400 normal-case flex items-center gap-1 animate-in fade-in slide-in-from-left-2'>
												<CheckCircle2 className='w-2.5 h-2.5' />{" "}
												Copied
											</span>
										) : (
											<Copy className='w-2.5 h-2.5 opacity-0 group-hover/amount:opacity-100 transition-opacity' />
										)}
									</p>
									<div className='flex items-baseline gap-2'>
										<span className='text-4xl font-black text-white tabular-nums tracking-tighter'>
											{Number(
												providerAccount.amountToTransfer,
											).toLocaleString("en-NG")}
										</span>
										<span className='text-primary font-black text-lg'>
											NGN
										</span>
									</div>
								</div>
								<div className='text-right flex-shrink-0'>
									<p className='text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center justify-end gap-1'>
										<Clock className='w-3 h-3' /> Time left
									</p>
									<span
										className={`text-2xl font-black font-mono tracking-widest tabular-nums ${
											timeLeft === "Expired"
												? "text-red-500 animate-pulse"
												: isExpiring
													? "text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]"
													: "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
										}`}
									>
										{timeLeft}
									</span>
								</div>
							</div>

							{/* Bank details */}
							<div className='space-y-2'>
								<div className='flex items-center gap-2 text-primary mb-3'>
									<ShieldCheck className='w-4 h-4' />
									<span className='text-[10px] font-black uppercase tracking-widest'>
										Transfer Instructions
									</span>
								</div>
								<CopyField
									label='Bank Name'
									value={providerAccount.institution}
								/>
								<CopyField
									label='Account Number'
									value={providerAccount.accountIdentifier}
								/>
								<div className='bg-black/40 border border-white/5 p-4 rounded-2xl'>
									<p className='text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1'>
										Account Name
									</p>
									<p className='text-white font-bold'>
										{providerAccount.accountName}
									</p>
								</div>
							</div>

							{/* Status pill */}
							<div
								className={`flex items-center gap-4 p-5 rounded-3xl border shadow-md ${statusUI.bg} ${statusUI.border} transition-all duration-300`}
							>
								<div
									className={`${statusUI.color} flex-shrink-0 scale-110`}
								>
									{statusUI.icon}
								</div>
								<div>
									<p
										className={`text-base font-black tracking-tight ${statusUI.color}`}
									>
										{statusUI.text}
									</p>
									<p className='text-muted-foreground text-[10px] font-bold opacity-70 uppercase tracking-widest mt-0.5'>
										{statusUI.sub}
									</p>
								</div>
							</div>

							{/* Reference */}
							<p className='text-center text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest'>
								Ref:{" "}
								<span className='text-white/30 font-mono'>
									{paymentOrder.reference}
								</span>
							</p>

							{isTerminal && (
								<Button
									onClick={onNewTransaction}
									className='w-full glass-panel border-white/10 text-white hover:bg-white/10 py-6 rounded-2xl font-black tracking-widest uppercase text-sm'
									variant='outline'
								>
									Start New Transaction
								</Button>
							)}
						</div>
					</div>
				</div>
			</motion.div>

			{/* ── Success Modal ──────────────────────────────────── */}
			<Dialog
				open={showSuccessModal}
				onOpenChange={setShowSuccessModal}
			>
				<DialogContent className='sm:max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none'>
					<motion.div
						initial={{ opacity: 0, scale: 0.85, y: 30 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						transition={{
							type: "spring",
							stiffness: 300,
							damping: 25,
						}}
						className='glass-panel border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(52,211,153,0.2)]'
					>
						{/* Top gradient */}
						<div className='relative bg-gradient-to-b from-emerald-500/25 via-emerald-500/10 to-transparent pt-12 pb-8 px-8 text-center overflow-hidden'>
							{/* Confetti dots */}
							{confettiActive && (
								<div className='absolute inset-0 pointer-events-none overflow-hidden'>
									{Array.from({ length: 20 }).map((_, i) => (
										<motion.div
											key={i}
											className='absolute w-2 h-2 rounded-full'
											style={{
												backgroundColor: [
													"#10b981",
													"#3b82f6",
													"#8b5cf6",
													"#f59e0b",
													"#ef4444",
												][i % 5],
												left: `${Math.random() * 100}%`,
												top: "-10%",
											}}
											animate={{
												y: "120vh",
												rotate: 360 * Math.random(),
												opacity: [1, 1, 0],
											}}
											transition={{
												duration: 2 + Math.random() * 2,
												delay: Math.random() * 1.5,
												ease: "easeIn",
											}}
										/>
									))}
								</div>
							)}

							{/* Icon */}
							<motion.div
								animate={{
									scale: [1, 1.15, 1],
									rotate: [0, -5, 5, 0],
								}}
								transition={{ duration: 0.8, delay: 0.3 }}
								className='w-24 h-24 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.4)]'
							>
								<PartyPopper className='w-12 h-12 text-emerald-400' />
							</motion.div>

							<DialogTitle className='text-3xl font-black tracking-tighter mb-2 text-white'>
								You're in! 🎉
							</DialogTitle>
							<p className='text-muted-foreground text-sm font-medium leading-relaxed px-4'>
								We've confirmed your{" "}
								<span className='text-emerald-400 font-bold'>
									₦
									{Number(
										paymentOrder.fiatAmount,
									).toLocaleString()}
								</span>{" "}
								deposit and sent{" "}
								<span className='text-white font-black'>
									{Number(paymentOrder.amount).toFixed(2)}{" "}
									{selectedToken?.symbol}
								</span>{" "}
								to your wallet.
							</p>
						</div>

						{/* Receipt-style breakdown */}
						<div className='px-8 pb-8 space-y-4'>
							<div className='bg-black/50 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden'>
								{[
									{
										label: "Status",
										value: "Settled",
										valueClass:
											"text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-xs font-black",
									},
									{
										label: "Received",
										value: `${Number(paymentOrder.amount).toFixed(2)} ${selectedToken?.symbol}`,
										valueClass:
											"text-white font-black text-lg tabular-nums",
									},
									{
										label: "Reference",
										value: `${paymentOrder.reference.slice(0, 14)}...`,
										valueClass: "font-mono text-xs text-white/50",
									},
									...(paymentOrder.txHash
										? [
												{
													label: "TX Hash",
													value: `${paymentOrder.txHash.slice(0, 10)}...`,
													valueClass:
														"font-mono text-xs text-primary",
												},
											]
										: []),
								].map(({ label, value, valueClass }, i) => (
									<div
										key={label}
										className={`flex items-center justify-between px-5 py-4 ${i !== 0 ? "border-t border-white/5" : ""}`}
									>
										<span className='text-[10px] font-black uppercase tracking-widest text-muted-foreground'>
											{label}
										</span>
										<span className={valueClass}>{value}</span>
									</div>
								))}
							</div>

							{/* CTA */}
							<button
								className='w-full futuristic-button bg-primary text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-[0_0_30px_rgba(100,150,255,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform'
								onClick={() => {
									setShowSuccessModal(false);
									onNewTransaction();
								}}
							>
								<ArrowRight className='w-4 h-4' />
								Return to Dashboard
							</button>
						</div>
					</motion.div>
				</DialogContent>
			</Dialog>
		</>
	);
}
