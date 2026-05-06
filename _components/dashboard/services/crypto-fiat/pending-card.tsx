"use client";

import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import { useState, useEffect, JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
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
	ExternalLink,
	RefreshCw,
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
			<span className='text-xs text-gray-500'>Loading…</span>
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
				`${API_URL}/api/payCrest/trade/status/${paymentData.id}`,
				{
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
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
				].includes(s)
			)
				return false;
			return 3000;
		},
		refetchIntervalInBackground: true,
		initialData: paymentData,
	});

	const currentStatus = statusData?.status ?? paymentData.status;
	const isCompleted = statusData?.isCompleted ?? false;

	useEffect(() => {
		if (isCompleted && !showSuccessModal) {
			setShowSuccessModal(true);
			setConfettiActive(true);
			setTimeout(() => setConfettiActive(false), 4000);
		}
	}, [isCompleted, showSuccessModal]);

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
					color: "text-emerald-400",
					bg: "bg-emerald-400/10",
					border: "border-emerald-400/20",
					icon: <CheckCircle2 className='w-5 h-5' />,
					text: "Transfer Completed",
					sub: "Your funds have been processed",
				};
			case "processing":
				return {
					color: "text-blue-400",
					bg: "bg-blue-400/10",
					border: "border-blue-400/20",
					icon: <Loader2 className='w-5 h-5 animate-spin' />,
					text: "Processing Deposit",
					sub: "Confirming blockchain transaction...",
				};
			case "failed":
			case "expired":
			case "cancelled":
				return {
					color: "text-red-400",
					bg: "bg-red-400/10",
					border: "border-red-400/20",
					icon: <XCircle className='w-5 h-5' />,
					text: "Order Failed",
					sub: "Please contact support if funds were sent",
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
					text: "Awaiting Deposit",
					sub: "Waiting for your crypto transfer",
				};
		}
	};

	const statusUI = getStatusUI();
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
				initial={{ opacity: 0, y: 24, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, scale: 0.96 }}
				transition={{ duration: 0.45 }}
				className='w-full max-w-lg mx-auto'
			>
				<div className='relative group'>
					<div className='absolute -inset-1 bg-gradient-to-r from-primary/30 via-blue-500/20 to-primary/30 rounded-[2.5rem] blur-lg opacity-30 group-hover:opacity-60 transition-all duration-1000' />

					<div className='relative glass-panel neon-border rounded-[2rem] overflow-hidden shadow-2xl'>
						<div className='h-1 w-full bg-gradient-to-r from-primary via-blue-400 to-primary' />

						<div className='p-6 md:p-8 border-b border-white/5 flex items-center gap-4'>
							<div className='w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 flex-shrink-0'>
								<Wallet className='w-7 h-7 text-primary' />
							</div>
							<div>
								<h3 className='text-xl font-black text-white tracking-tight'>
									Crypto Transfer
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
											paymentData.amount,
										);
										setAmountCopied(true);
										setTimeout(() => setAmountCopied(false), 2000);
									}}
								>
									<p className='text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2'>
										Amount to send
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
										<span className='text-3xl font-black text-white tabular-nums tracking-tighter'>
											{Number(paymentData.amount).toFixed(2)}
										</span>
										<span className='text-primary font-black text-lg'>
											{paymentData.token}
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
													? "text-orange-400"
													: "text-amber-400"
										}`}
									>
										{timeLeft}
									</span>
								</div>
							</div>

							{/* Instructions */}
							<div className='space-y-2'>
								<div className='flex items-center gap-2 text-primary mb-3'>
									<ShieldCheck className='w-4 h-4' />
									<span className='text-[10px] font-black uppercase tracking-widest'>
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

								<div className='flex flex-col items-center justify-center py-4 bg-black/20 rounded-2xl border border-white/5'>
									<div className='p-3 rounded-xl bg-white'>
										<QRCodeCanvas
											value={paymentData.receiveAddress}
											size={120}
											bgColor='#ffffff'
											fgColor='#000000'
											level='H'
											includeMargin={false}
										/>
									</div>
									<p className='text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-3'>
										Scan QR to pay
									</p>
								</div>
							</div>

							<div className='bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4'>
								<p className='text-orange-400 text-[10px] font-bold leading-relaxed text-center uppercase tracking-wide'>
									⚠️ Send only {paymentData.token} on{" "}
									{formatNetwork(paymentData.network)}.
								</p>
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
									{paymentData.reference}
								</span>
							</p>
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
						<div className='relative bg-gradient-to-b from-emerald-500/25 via-emerald-500/10 to-transparent pt-12 pb-8 px-8 text-center overflow-hidden'>
							{confettiActive && (
								<div className='absolute inset-0 pointer-events-none'>
									{Array.from({ length: 20 }).map((_, i) => (
										<motion.div
											key={i}
											className='absolute w-2 h-2 rounded-full'
											style={{
												backgroundColor: [
													"#10b981",
													"#3b82f6",
													"#8b5cf6",
												][i % 3],
												left: `${Math.random() * 100}%`,
												top: "-10%",
											}}
											animate={{
												y: "120vh",
												opacity: [1, 1, 0],
											}}
											transition={{
												duration: 2 + Math.random() * 2,
												delay: Math.random() * 1.5,
											}}
										/>
									))}
								</div>
							)}

							<motion.div
								animate={{ scale: [1, 1.15, 1] }}
								className='w-24 h-24 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/40'
							>
								<PartyPopper className='w-12 h-12 text-emerald-400' />
							</motion.div>

							<DialogTitle className='text-3xl font-black tracking-tighter mb-2 text-white'>
								Payment Successful! 🎉
							</DialogTitle>
							<p className='text-muted-foreground text-sm font-medium leading-relaxed px-4'>
								We've confirmed your{" "}
								<span className='text-emerald-400 font-bold'>
									{Number(paymentData.amount).toFixed(2)}{" "}
									{paymentData.token}
								</span>{" "}
								deposit and processed your payout.
							</p>
						</div>

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
										label: "Amount Sent",
										value: `${Number(paymentData.amount).toFixed(2)} ${paymentData.token}`,
										valueClass: "text-white font-black tabular-nums",
									},
									{
										label: "Reference",
										value: `${paymentData.reference.slice(0, 14)}...`,
										valueClass: "font-mono text-xs text-white/50",
									},
									...(statusData?.txHash
										? [
												{
													label: "TX Hash",
													value: `${statusData.txHash.slice(0, 10)}...`,
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

							<div className='flex flex-col gap-2'>
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
									onClick={() => setShowSuccessModal(false)}
									className='w-full futuristic-button bg-primary text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-[0_0_30px_rgba(100,150,255,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform'
								>
									<ArrowRight className='w-4 h-4' />
									Return to Dashboard
								</Button>
							</div>
						</div>
					</motion.div>
				</DialogContent>
			</Dialog>
		</>
	);
}
