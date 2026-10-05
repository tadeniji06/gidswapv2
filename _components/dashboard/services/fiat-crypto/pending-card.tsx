"use client";

import { useState, useEffect, JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
	ArrowRight,
	X,
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
			className='group flex items-center justify-between bg-background hover:bg-muted/50 border border-border p-4 rounded-xl transition-colors cursor-pointer'
			onClick={handleCopy}
		>
			<div className='min-w-0 flex-1'>
				<p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1'>
					{label}
				</p>
				<p className='text-sm font-mono text-foreground truncate'>
					{value}
				</p>
			</div>
			<button className='flex-shrink-0 ml-3 w-8 h-8 flex items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors'>
				{copied ? (
					<CheckCircle2 className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
				) : (
					<Copy className='w-4 h-4 text-muted-foreground group-hover:text-primary' />
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
	const [successAcknowledged, setSuccessAcknowledged] = useState(false);
	const [confettiActive, setConfettiActive] = useState(false);
	const [amountCopied, setAmountCopied] = useState(false);
	const terminalStates = [
		"cancelled",
		"refunded",
		"expired",
		"failed",
	];

	if (!paymentOrder || !paymentOrder.providerAccount) {
		return (
			<div className='w-full max-w-lg mx-auto bg-card border border-border p-16 text-center rounded-2xl shadow-sm'>
				<div className='w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground'>
					<Loader2 className='w-8 h-8 animate-spin' />
				</div>
				<p className='text-foreground font-medium'>
					Securing your transaction details...
				</p>
				<p className='text-muted-foreground text-sm mt-2'>
					This only takes a moment
				</p>
			</div>
		);
	}

	const { providerAccount } = paymentOrder;

	const { data: isCompleted } = useQuery({
		queryKey: ["pollPayment", paymentOrder.id],
		queryFn: () => pollPaymentStatus(paymentOrder.id),
		refetchInterval: (query) =>
			query.state.data || terminalStates.includes(paymentOrder.status)
				? false
				: 3000,
		refetchIntervalInBackground: true,
	});

	useEffect(() => {
		if (isCompleted && !successAcknowledged) {
			setShowSuccessModal(true);
			setConfettiActive(true);
			setTimeout(() => setConfettiActive(false), 4000);
		}
	}, [isCompleted, successAcknowledged]);

	const handleSuccessOpenChange = (open: boolean) => {
		setShowSuccessModal(open);
		if (!open) setSuccessAcknowledged(true);
	};

	const closeSuccessModal = () => {
		setSuccessAcknowledged(true);
		setShowSuccessModal(false);
	};

	const finishSuccessFlow = () => {
		closeSuccessModal();
		onNewTransaction();
	};

	useEffect(() => {
		if (!paymentOrder.validUntil) return;
		const interval = setInterval(
			() => setTimeLeft(formatTimeLeft(paymentOrder.validUntil)),
			1000,
		);
		return () => clearInterval(interval);
	}, [paymentOrder.validUntil]);

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
					color: "text-emerald-700 dark:text-emerald-400",
					bg: "bg-emerald-50 dark:bg-emerald-500/10",
					border: "border-emerald-200 dark:border-emerald-500/20",
					icon: <CheckCircle2 className='w-5 h-5' />,
					text: "Transfer Completed",
					sub: "Your crypto is on its way",
				};
			case "processing":
				return {
					color: "text-blue-700 dark:text-blue-400",
					bg: "bg-blue-50 dark:bg-blue-500/10",
					border: "border-blue-200 dark:border-blue-500/20",
					icon: <Loader2 className='w-5 h-5 animate-spin' />,
					text: "Processing Deposit",
					sub: "Minting tokens to your wallet...",
				};
			case "refunded":
				return {
					color: "text-amber-700 dark:text-amber-400",
					bg: "bg-amber-50 dark:bg-amber-500/10",
					border: "border-amber-200 dark:border-amber-500/20",
					icon: <RefreshCw className='w-5 h-5' />,
					text: "Payment Refunded",
					sub: "Your naira payment was returned. No crypto was sent.",
				};
			case "failed":
			case "expired":
			case "cancelled":
				return {
					color: "text-red-700 dark:text-red-400",
					bg: "bg-red-50 dark:bg-red-500/10",
					border: "border-red-200 dark:border-red-500/20",
					icon: <XCircle className='w-5 h-5' />,
					text: "Payment Failed",
					sub: "Funds will be refunded if sent",
				};
			default:
				return {
					color: "text-blue-700 dark:text-blue-400",
					bg: "bg-blue-50 dark:bg-blue-500/10",
					border: "border-blue-200 dark:border-blue-500/20",
					icon: <Loader2 className='w-5 h-5 animate-spin' />,
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
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className='w-full max-w-lg mx-auto bg-card border border-border rounded-2xl shadow-sm overflow-hidden'
			>
				{/* Top accent bar */}
				<div className='h-1 w-full bg-primary' />

				{/* Header */}
				<div className='p-6 border-b border-border flex items-center gap-4'>
					<div className='w-12 h-12 bg-muted rounded-xl flex items-center justify-center flex-shrink-0'>
						<Banknote className='w-6 h-6 text-primary' />
					</div>
					<div>
						<h3 className='text-xl font-semibold text-foreground'>
							Bank Transfer
						</h3>
					</div>
				</div>

				<div className='p-6 space-y-5'>
					{/* Amount + Timer */}
					<div className='bg-muted/30 rounded-xl p-5 border border-border flex justify-between items-center group/amount relative'>
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
							<p className='text-xs font-medium text-muted-foreground mb-1 flex items-center gap-2'>
								Amount to transfer
								{amountCopied ? (
									<span className='text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-xs'>
										<CheckCircle2 className='w-3 h-3' /> Copied
									</span>
								) : (
									<Copy className='w-3 h-3 opacity-0 group-hover/amount:opacity-100 transition-opacity' />
								)}
							</p>
							<div className='flex items-baseline gap-2'>
								<span className='text-4xl font-bold text-foreground tabular-nums tracking-tight'>
									{Number(
										providerAccount.amountToTransfer,
									).toLocaleString("en-NG")}
								</span>
								<span className='text-muted-foreground font-medium text-lg'>
									NGN
								</span>
							</div>
						</div>
						<div className='text-right flex-shrink-0'>
							<p className='text-xs font-medium text-muted-foreground mb-1 flex items-center justify-end gap-1'>
								<Clock className='w-3 h-3' /> Time left
							</p>
							<span
								className={`text-xl font-bold font-mono tabular-nums ${
									timeLeft === "Expired"
										? "text-red-600 dark:text-red-400"
										: isExpiring
											? "text-orange-600 dark:text-orange-400"
											: "text-foreground"
								}`}
							>
								{timeLeft}
							</span>
						</div>
					</div>

					{/* Bank details */}
					<div className='space-y-3'>
						<div className='flex items-center gap-2 text-primary'>
							<ShieldCheck className='w-4 h-4' />
							<span className='text-sm font-medium'>
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
						<div className='bg-background border border-border p-4 rounded-xl'>
							<p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1'>
								Account Name
							</p>
							<p className='text-foreground font-medium'>
								{providerAccount.accountName}
							</p>
						</div>
					</div>

					{/* Status pill */}
					<div
						className={`flex items-center gap-4 p-4 rounded-xl border ${statusUI.bg} ${statusUI.border} transition-colors`}
					>
						<div
							className={`${statusUI.color} flex-shrink-0`}
						>
							{statusUI.icon}
						</div>
						<div>
							<p
								className={`text-sm font-semibold ${statusUI.color}`}
							>
								{statusUI.text}
							</p>
							<p className={`text-xs mt-0.5 opacity-80 ${statusUI.color}`}>
								{statusUI.sub}
							</p>
						</div>
					</div>

					{/* Reference */}
					<p className='text-center text-xs text-muted-foreground font-medium'>
						Ref:{" "}
						<span className='font-mono'>
							{paymentOrder.reference}
						</span>
					</p>

					{isTerminal && (
						<div className="pt-2">
							<Button
								onClick={onNewTransaction}
								className='w-full'
								variant='outline'
							>
								Start New Transaction
							</Button>
						</div>
					)}
				</div>
			</motion.div>

			{/* ── Success Modal ──────────────────────────────────── */}
			<Dialog
				open={showSuccessModal}
				onOpenChange={handleSuccessOpenChange}
			>
				<DialogContent
					showCloseButton={false}
					className='z-[100] w-[calc(100vw-1.5rem)] sm:max-w-md max-h-[90dvh] overflow-y-auto border border-border bg-card p-0 shadow-lg rounded-2xl'
				>
					<div className='relative overflow-hidden'>
						<button
							type='button'
							onClick={closeSuccessModal}
							className='absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors'
						>
							<X className='h-4 w-4' />
						</button>
						{/* Top section */}
						<div className='relative bg-emerald-50 dark:bg-emerald-500/10 px-6 pb-6 pt-10 text-center sm:px-8 border-b border-emerald-100 dark:border-emerald-500/20'>
							{/* Icon */}
							<div className='w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-500/40'>
								<PartyPopper className='w-10 h-10 text-emerald-600 dark:text-emerald-400' />
							</div>

							<DialogTitle className='text-xl sm:text-2xl font-semibold mb-2 text-foreground'>
								Crypto Delivered
							</DialogTitle>
							<p className='text-muted-foreground text-sm font-medium'>
								We've confirmed your{" "}
								<span className='text-foreground font-semibold'>
									₦
									{Number(
										paymentOrder.fiatAmount,
									).toLocaleString()}
								</span>{" "}
								deposit and sent{" "}
								<span className='text-foreground font-semibold'>
									{Number(paymentOrder.amount).toFixed(2)}{" "}
									{selectedToken?.symbol}
								</span>{" "}
								to your wallet.
							</p>
						</div>

						{/* Receipt-style breakdown */}
						<div className='px-6 py-6 sm:px-8 space-y-6'>
							<div className='bg-muted/30 rounded-xl border border-border divide-y divide-border'>
								{[
									{
										label: "Status",
										value: "Settled",
										valueClass:
											"text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded text-xs font-semibold",
									},
									{
										label: "Received",
										value: `${Number(paymentOrder.amount).toFixed(2)} ${selectedToken?.symbol}`,
										valueClass:
											"text-foreground font-semibold text-lg tabular-nums",
									},
									{
										label: "Reference",
										value: `${paymentOrder.reference.slice(0, 14)}...`,
										valueClass: "font-mono text-sm text-muted-foreground",
									},
									...(paymentOrder.txHash
										? [
												{
													label: "TX Hash",
													value: `${paymentOrder.txHash.slice(0, 10)}...`,
													valueClass:
														"font-mono text-sm text-primary",
												},
											]
										: []),
								].map(({ label, value, valueClass }) => (
									<div
										key={label}
										className="flex items-center justify-between px-4 py-3"
									>
										<span className='text-sm text-muted-foreground'>
											{label}
										</span>
										<span className={valueClass}>{value}</span>
									</div>
								))}
							</div>

							{/* CTA */}
							<Button
								className='w-full py-6'
								onClick={finishSuccessFlow}
							>
								Return to Dashboard
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
