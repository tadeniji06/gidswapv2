"use client";

import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import { useState, useEffect, JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/src/components/ui/button";
import {
	Copy,
	Clock,
	Wallet,
	Loader2,
	CheckCircle2,
	XCircle,
	ShieldCheck,
	PartyPopper,
	ArrowRight,
	RefreshCw,
	X,
} from "lucide-react";

// PDF receipt + share — dynamically imported (client only, @react-pdf/renderer)
const PDFReceiptButton = dynamic(
	() =>
		import("@/_components/dashboard/receipt/PDFReceipt").then(
			(m) => m.PDFReceiptButton,
		),
	{
		ssr: false,
		loading: () => (
			<span className='text-xs text-muted-foreground'>Loading…</span>
		),
	},
);
const ShareReceiptButton = dynamic(
	() =>
		import("@/_components/dashboard/receipt/PDFReceipt").then(
			(m) => m.ShareReceiptButton,
		),
	{ ssr: false, loading: () => null },
);

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

interface PendingPaymentData {
	id: string;
	reference: string;
	amount: string;
	token: string;
	network: string;
	receiveAddress: string;
	senderFee: string;
	transactionFee: string;
	validUntil: string;
	status: string;
	isCompleted?: boolean;
	txHash?: string;
	amountInUsd?: string;
	fiatAmount?: string;
}

interface PendingPaymentCardProps {
	paymentData: PendingPaymentData;
	onTimeout: () => void;
}

export function PendingPaymentCard({
	paymentData,
	onTimeout,
}: PendingPaymentCardProps) {
	const [timeLeft, setTimeLeft] = useState<string>("");
	const [amountCopied, setAmountCopied] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [successAcknowledged, setSuccessAcknowledged] = useState(false);
	const [confettiActive, setConfettiActive] = useState(false);

	const API_URL = process.env.NEXT_PUBLIC_PROD_API;
	const authToken = Cookies.get("token");

	// Read recipient bank details for receipt
	const _bankRaw = Cookies.get("verifiedBank");
	const _bank = _bankRaw ? JSON.parse(_bankRaw) : null;
	const recipientAccount = _bank?.accountNumber;
	const recipientName = _bank?.accountName;
	const bankName = _bank?.bankName;

	const { data: statusData } = useQuery<PendingPaymentData>({
		queryKey: ["payment-status", paymentData?.id],
		queryFn: async () => {
			const res = await fetch(
				`${API_URL}/api/payCrest/trade/status/${paymentData.id}?_=${Date.now()}`,
				{
					cache: "no-store",
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
						"Cache-Control": "no-cache",
					},
				},
			);
			if (!res.ok) throw new Error("Failed to fetch");
			const json = await res.json();
			return json.data || json;
		},
		enabled: !!paymentData?.id,
		refetchInterval: (query) => {
			const s = query.state.data?.status;
			if (
				s &&
				[
					"validated",
					"fulfilled",
					"settled",
					"cancelled",
					"expired",
					"failed",
					"refunded",
				].includes(s)
			)
				return false;
			return 3000;
		},
		refetchIntervalInBackground: true,
		initialData: paymentData,
	});

	const currentStatus = statusData?.status ?? paymentData.status;
	const isCompleted =
		Boolean(statusData?.isCompleted) ||
		["validated", "fulfilled", "settled"].includes(currentStatus);

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
		onTimeout();
	};

	useEffect(() => {
		if (!paymentData?.validUntil) return;
		const interval = setInterval(
			() => setTimeLeft(formatTimeLeft(paymentData.validUntil)),
			1000,
		);
		return () => clearInterval(interval);
	}, [paymentData?.validUntil]);

	const getStatusUI = () => {
		switch (currentStatus) {
			case "settled":
			case "fulfilled":
			case "validated":
				return {
					color: "text-emerald-700 dark:text-emerald-400",
					bg: "bg-emerald-50 dark:bg-emerald-500/10",
					border: "border-emerald-200 dark:border-emerald-500/20",
					icon: <CheckCircle2 className='w-5 h-5' />,
					text: "Transfer Completed",
					sub: "Your funds have been processed",
				};
			case "processing":
				return {
					color: "text-blue-700 dark:text-blue-400",
					bg: "bg-blue-50 dark:bg-blue-500/10",
					border: "border-blue-200 dark:border-blue-500/20",
					icon: <Loader2 className='w-5 h-5 animate-spin' />,
					text: "Processing Deposit",
					sub: "Confirming blockchain transaction...",
				};
			case "refunded":
				return {
					color: "text-amber-700 dark:text-amber-400",
					bg: "bg-amber-50 dark:bg-amber-500/10",
					border: "border-amber-200 dark:border-amber-500/20",
					icon: <RefreshCw className='w-5 h-5' />,
					text: "Payment Refunded",
					sub: "Your deposit was returned. No payout was made.",
				};
			case "failed":
			case "expired":
			case "cancelled":
				return {
					color: "text-red-700 dark:text-red-400",
					bg: "bg-red-50 dark:bg-red-500/10",
					border: "border-red-200 dark:border-red-500/20",
					icon: <XCircle className='w-5 h-5' />,
					text: "Order Failed",
					sub: "Please contact support if funds were sent",
				};
			default:
				return {
					color: "text-blue-700 dark:text-blue-400",
					bg: "bg-blue-50 dark:bg-blue-500/10",
					border: "border-blue-200 dark:border-blue-500/20",
					icon: <Loader2 className='w-5 h-5 animate-spin' />,
					text: "Awaiting Deposit",
					sub: "Waiting for your crypto transfer",
				};
		}
	};

	const statusUI = getStatusUI();
	const terminalStatuses = [
		"cancelled",
		"expired",
		"failed",
		"refunded",
	];
	const isTerminal = terminalStatuses.includes(currentStatus);
	const isExpiring =
		timeLeft !== "Expired" &&
		timeLeft !== "" &&
		parseInt(timeLeft.split(":")[0]) === 0 &&
		parseInt(timeLeft.split(":")[1]) < 120;

	const formatNetwork = (network: string) => {
		if (!network) return "Unknown Network";
		return network
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

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

				<div className='p-6 border-b border-border flex items-center gap-4'>
					<div className='w-12 h-12 bg-muted rounded-xl flex items-center justify-center flex-shrink-0'>
						<Wallet className='w-6 h-6 text-primary' />
					</div>
					<div>
						<h3 className='text-xl font-semibold text-foreground'>
							Crypto Transfer
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
									paymentData.amount,
								);
								setAmountCopied(true);
								setTimeout(() => setAmountCopied(false), 2000);
							}}
						>
							<p className='text-xs font-medium text-muted-foreground mb-1 flex items-center gap-2'>
								Amount to send
								{amountCopied ? (
									<span className='text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-xs'>
										<CheckCircle2 className='w-3 h-3' /> Copied
									</span>
								) : (
									<Copy className='w-3 h-3 opacity-0 group-hover/amount:opacity-100 transition-opacity' />
								)}
							</p>
							<div className='flex items-baseline gap-2'>
								<span className='text-3xl font-bold text-foreground tabular-nums tracking-tight'>
									{Number(paymentData.amount).toFixed(2)}
								</span>
								<span className='text-muted-foreground font-medium text-sm'>
									{paymentData.token}
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

					{/* Instructions */}
					<div className='space-y-3'>
						<div className='flex items-center gap-2 text-primary'>
							<ShieldCheck className='w-4 h-4' />
							<span className='text-sm font-medium'>
								Send to Address
							</span>
						</div>

						<CopyField
							label='Network'
							value={formatNetwork(paymentData.network)}
						/>

						<CopyField
							label='Deposit Address'
							value={paymentData.receiveAddress}
						/>

						<div className='flex flex-col items-center justify-center py-6 bg-muted/20 rounded-xl border border-border'>
							<div className='p-3 rounded-xl bg-white border border-gray-200'>
								<QRCodeCanvas
									value={paymentData.receiveAddress}
									size={140}
									bgColor='#ffffff'
									fgColor='#000000'
									level='H'
									includeMargin={false}
								/>
							</div>
							<p className='text-xs font-medium text-muted-foreground mt-4'>
								Scan QR to pay
							</p>
						</div>
					</div>

					<div className='bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-4'>
						<p className='text-orange-800 dark:text-orange-400 text-xs font-medium leading-relaxed text-center uppercase tracking-wider'>
							⚠️ Send only {paymentData.token} on{" "}
							{formatNetwork(paymentData.network)}.
						</p>
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
							{paymentData.reference}
						</span>
					</p>

					{isTerminal && (
						<div className="pt-2">
							<Button
								onClick={onTimeout}
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
						<div className='relative bg-emerald-50 dark:bg-emerald-500/10 px-6 pb-6 pt-10 text-center sm:px-8 border-b border-emerald-100 dark:border-emerald-500/20'>
							<div className='w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-500/40'>
								<PartyPopper className='w-10 h-10 text-emerald-600 dark:text-emerald-400' />
							</div>

							<DialogTitle className='text-xl sm:text-2xl font-semibold mb-2 text-foreground'>
								Payout Processed
							</DialogTitle>
							<p className='text-muted-foreground text-sm font-medium'>
								We've confirmed your{" "}
								<span className='text-foreground font-semibold'>
									{Number(paymentData.amount).toFixed(2)}{" "}
									{paymentData.token}
								</span>{" "}
								deposit and processed your payout.
							</p>
						</div>

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
										label: "Amount Sent",
										value: `${Number(paymentData.amount).toFixed(2)} ${paymentData.token}`,
										valueClass: "text-foreground font-semibold tabular-nums",
									},
									{
										label: "Reference",
										value: `${paymentData.reference.slice(0, 14)}...`,
										valueClass: "font-mono text-sm text-muted-foreground",
									},
									...(statusData?.txHash
										? [
												{
													label: "TX Hash",
													value: `${statusData.txHash.slice(0, 10)}...`,
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

							<div className='flex flex-col gap-3'>
								<PDFReceiptButton
									data={{
										orderId: paymentData.id,
										reference: paymentData.reference,
										amount: paymentData.amount,
										token: paymentData.token,
										network: paymentData.network,
										status: currentStatus,
										receiveAddress: paymentData.receiveAddress,
										date: new Date().toLocaleString(),
										recipientAccount,
										recipientName,
										bankName,
									}}
								/>
								<ShareReceiptButton
									data={{
										orderId: paymentData.id,
										reference: paymentData.reference,
										amount: paymentData.amount,
										token: paymentData.token,
										network: paymentData.network,
										status: currentStatus,
										receiveAddress: paymentData.receiveAddress,
										date: new Date().toLocaleString(),
										recipientAccount,
										recipientName,
										bankName,
									}}
								/>
								<Button
									onClick={finishSuccessFlow}
									className='w-full py-6'
								>
									Return to Dashboard
								</Button>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
