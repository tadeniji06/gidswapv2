"use client";

import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import { useState, useEffect, useRef, JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/src/components/ui/button";
import { toPng } from "html-to-image";
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
	Check,
	MessageSquare,
	Send,
	Share2,
} from "lucide-react";
import { Icon } from "@iconify/react";

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
	truncateMiddleOnMobile = false,
}: {
	label: string;
	value: string;
	truncateMiddleOnMobile?: boolean;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(value);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const formatMobileValue = (val: string) => {
		if (truncateMiddleOnMobile && val.length > 18) {
			return `${val.slice(0, 10)}...${val.slice(-8)}`;
		}
		return val;
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
				{truncateMiddleOnMobile && value.length > 18 ? (
					<>
						<p className='text-sm font-mono text-foreground sm:hidden'>
							{formatMobileValue(value)}
						</p>
						<p className='text-sm font-mono text-foreground truncate hidden sm:block'>
							{value}
						</p>
					</>
				) : (
					<p className='text-sm font-mono text-foreground truncate'>
						{value}
					</p>
				)}
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
	const [isSharingImage, setIsSharingImage] = useState(false);
	const receiptCardRef = useRef<HTMLDivElement>(null);

	const handleShareReceiptImage = async (platform?: "whatsapp" | "telegram" | "native") => {
		if (!receiptCardRef.current) return;
		try {
			setIsSharingImage(true);
			const dataUrl = await toPng(receiptCardRef.current, {
				cacheBust: true,
				pixelRatio: 2,
				backgroundColor: "#ffffff",
			});

			const blob = await (await fetch(dataUrl)).blob();
			const file = new File([blob], `gidswap-receipt-${paymentData.reference || "order"}.png`, {
				type: "image/png",
			});

			// If Web Share API supports file sharing (e.g. mobile devices)
			if (platform === "native" || !platform) {
				if (navigator.canShare && navigator.canShare({ files: [file] })) {
					await navigator.share({
						files: [file],
						title: "Gidswap Transaction Receipt",
						text: `Gidswap Receipt for ${paymentData.amount} ${paymentData.token} (${paymentData.reference})`,
					});
					return;
				}
			}

			// Fallback: Trigger instant download of image and open platform
			const link = document.createElement("a");
			link.href = dataUrl;
			link.download = `gidswap-receipt-${paymentData.reference || "order"}.png`;
			link.click();

			if (platform === "whatsapp") {
				window.open(
					`https://wa.me/?text=${encodeURIComponent(
						`✅ Gidswap Receipt: ${paymentData.amount} ${paymentData.token} (Ref: ${paymentData.reference})\nImage receipt downloaded to attach!`
					)}`,
					"_blank"
				);
			} else if (platform === "telegram") {
				window.open(
					`https://t.me/share/url?url=${encodeURIComponent("https://gidswap.com")}&text=${encodeURIComponent(
						`✅ Gidswap Receipt: ${paymentData.amount} ${paymentData.token} (Ref: ${paymentData.reference})`
					)}`,
					"_blank"
				);
			}
		} catch (err) {
			console.error("Error generating receipt image:", err);
		} finally {
			setIsSharingImage(false);
		}
	};

	const [isSharingDeposit, setIsSharingDeposit] = useState(false);
	const depositShareCardRef = useRef<HTMLDivElement>(null);

	const handleShareDepositDetails = async (platform: "whatsapp" | "telegram" | "x" | "native") => {
		if (!depositShareCardRef.current) return;
		try {
			setIsSharingDeposit(true);
			const dataUrl = await toPng(depositShareCardRef.current, {
				cacheBust: true,
				pixelRatio: 2,
				backgroundColor: "#ffffff",
			});

			const blob = await (await fetch(dataUrl)).blob();
			const file = new File([blob], `gidswap-deposit-${paymentData.token}.png`, {
				type: "image/png",
			});

			const shareText = `Send ${paymentData.amount} ${paymentData.token} (${paymentData.network})\nDeposit Address: ${paymentData.receiveAddress}\n\n⚠️ IMPORTANT: This is a ONE-TIME, non-reusable address that expires in 1 hour. Do not reuse.`;

			if (platform === "native") {
				if (navigator.canShare && navigator.canShare({ files: [file] })) {
					await navigator.share({
						files: [file],
						title: `Deposit ${paymentData.token} - Gidswap`,
						text: shareText,
					});
					return;
				}
			}

			// Direct mobile / web link fallbacks with auto-downloaded QR barcode card
			const link = document.createElement("a");
			link.href = dataUrl;
			link.download = `gidswap-deposit-${paymentData.token}.png`;
			link.click();

			if (platform === "whatsapp") {
				window.open(
					`https://wa.me/?text=${encodeURIComponent(
						`🪙 *Deposit ${paymentData.amount} ${paymentData.token} on ${paymentData.network}*\n\nAddress:\n\`${paymentData.receiveAddress}\`\n\n⚠️ *NOTE:* This is a *ONE-TIME, non-reusable address* that *expires in 1 hour*. Do NOT send funds to this address more than once.\n\n(QR barcode card downloaded to attach!)`
					)}`,
					"_blank"
				);
			} else if (platform === "telegram") {
				window.open(
					`https://t.me/share/url?url=${encodeURIComponent(paymentData.receiveAddress)}&text=${encodeURIComponent(
						`🪙 Deposit ${paymentData.amount} ${paymentData.token} (${paymentData.network}) on Gidswap\n\n⚠️ NOTE: This is a ONE-TIME, non-reusable address expiring in 1 hour.`
					)}`,
					"_blank"
				);
			} else if (platform === "x") {
				window.open(
					`https://x.com/intent/tweet?text=${encodeURIComponent(
						`🪙 Deposit ${paymentData.amount} ${paymentData.token} on ${paymentData.network} via @cryptopaddyng\nAddress: ${paymentData.receiveAddress}\n\n⚠️ One-time non-reusable address (expires in 1h)`
					)}`,
					"_blank"
				);
			}
		} catch (err) {
			console.error("Error sharing deposit details:", err);
		} finally {
			setIsSharingDeposit(false);
		}
	};

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

	// Read orderData to retrieve calculated fiat amount in Naira
	const _orderRaw = Cookies.get("order-data");
	const _order = _orderRaw ? JSON.parse(_orderRaw) : null;
	const fiatAmountNaira = _order?.fiatAmount || _order?.receiveAmount || statusData?.fiatAmount;

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

					{/* Instructions & Shareable Deposit Card */}
					<div ref={depositShareCardRef} className='space-y-3 bg-card p-4 rounded-2xl border border-border/80'>

						<CopyField
							label='Network'
							value={formatNetwork(paymentData.network)}
						/>

						<CopyField
							label='Deposit Address'
							value={paymentData.receiveAddress}
							truncateMiddleOnMobile={true}
						/>

						<div className='flex flex-col items-center justify-center py-6 bg-muted/20 rounded-xl border border-border'>
							<div className='p-3 rounded-xl bg-white border border-gray-200 shadow-sm'>
								<QRCodeCanvas
									value={paymentData.receiveAddress}
									size={140}
									bgColor='#ffffff'
									fgColor='#000000'
									level='H'
									includeMargin={false}
								/>
							</div>
							<p className='text-xs font-medium text-muted-foreground mt-3'>
								Scan QR code to pay
							</p>
						</div>

						<div className='flex items-center justify-between px-1 text-xs text-muted-foreground'>
							<span className='inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 px-2.5 py-1 rounded-full'>
								⚠️ One-time address • Expires in 1h (non-reusable)
							</span>
						</div>

						{/* Clean Share Address & Barcode row */}
						<div className='pt-1'>
							<p className='text-[11px] font-medium text-muted-foreground text-center mb-2'>
								Need someone else to pay? Share one-time address &amp; QR:
							</p>
							<div className='grid grid-cols-3 gap-2'>
								<button
									type='button'
									onClick={() => handleShareDepositDetails("whatsapp")}
									disabled={isSharingDeposit}
									className='flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-60 cursor-pointer'
									title="Share via WhatsApp"
								>
									{isSharingDeposit ? (
										<Loader2 className='w-3.5 h-3.5 animate-spin shrink-0' />
									) : (
										<Share2 className='w-3.5 h-3.5 shrink-0' />
									)}
									<span className='truncate'>WhatsApp</span>
								</button>

								<button
									type='button'
									onClick={() => handleShareDepositDetails("x")}
									disabled={isSharingDeposit}
									className='flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-60 cursor-pointer'
									title="Share via X"
								>
									{isSharingDeposit ? (
										<Loader2 className='w-3.5 h-3.5 animate-spin shrink-0' />
									) : (
										<Icon icon="ri:twitter-x-fill" className='w-3.5 h-3.5 shrink-0' />
									)}
									<span className='truncate'>X</span>
								</button>

								<button
									type='button'
									onClick={() => handleShareDepositDetails("telegram")}
									disabled={isSharingDeposit}
									className='flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 active:scale-[0.98] text-xs font-semibold transition-all shadow-sm disabled:opacity-60 cursor-pointer'
									title="Share via Telegram"
								>
									{isSharingDeposit ? (
										<Loader2 className='w-3.5 h-3.5 animate-spin shrink-0' />
									) : (
										<Send className='w-3.5 h-3.5 shrink-0' />
									)}
									<span className='truncate'>Telegram</span>
								</button>
							</div>
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

			{/* ── Success Modal (Minimalist Blue & White Fintech Confirmation) ── */}
			<Dialog
				open={showSuccessModal}
				onOpenChange={handleSuccessOpenChange}
			>
				<DialogContent
					showCloseButton={false}
					className='z-[100] w-[calc(100vw-1.5rem)] sm:max-w-md max-h-[92dvh] overflow-y-auto border border-blue-100 bg-white text-slate-900 p-0 shadow-2xl rounded-3xl'
				>
					<DialogTitle className="sr-only">
						Payment Confirmation
					</DialogTitle>
					<div className='relative overflow-hidden p-5 sm:p-7 space-y-5'>
						{/* Top close/cancel button */}
						<button
							type='button'
							onClick={closeSuccessModal}
							className='absolute right-4 top-4 sm:right-5 sm:top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer'
							title="Close"
						>
							<X className='h-4 w-4' />
						</button>

						{/* Captured Receipt Card for Image Sharing */}
						<div ref={receiptCardRef} className='space-y-5 pt-1 pb-1 bg-white text-slate-900'>
							{/* Minimalist Circular Check & Hero */}
							<div className='flex flex-col items-center text-center'>
								<div className="mb-3 sm:mb-4 flex items-center justify-center text-blue-600">
									<Icon icon="f7:checkmark-seal-fill" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-sm" />
								</div>

								<h2 className='text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950'>
									{Number(paymentData.amount).toFixed(2)} {paymentData.token}
								</h2>
								<p className='text-xs sm:text-sm text-slate-500 font-medium mt-1'>
									Payment confirmed!
								</p>
							</div>

							{/* Clean Key-Value Card */}
							<div className='bg-slate-50/70 rounded-2xl border border-slate-200 divide-y divide-slate-100 p-1 text-xs sm:text-sm'>
								<div className="flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5">
									<span className='text-slate-500 font-medium'>Status</span>
									<span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
										Settled
									</span>
								</div>

								{fiatAmountNaira && (
									<div className="flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5">
										<span className='text-slate-500 font-medium'>Payout Amount</span>
										<span className="text-sm sm:text-base font-bold text-slate-950">
											₦{Number(fiatAmountNaira).toLocaleString()}
										</span>
									</div>
								)}

								{recipientAccount && (
									<div className="flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5">
										<span className='text-slate-500 font-medium'>Recipient Account</span>
										<span className="font-semibold text-slate-900 truncate ml-2">
											{recipientAccount} {bankName ? `(${bankName})` : ""}
										</span>
									</div>
								)}

								{recipientName && (
									<div className="flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5">
										<span className='text-slate-500 font-medium'>Account Name</span>
										<span className="font-medium text-slate-800 truncate ml-2">
											{recipientName}
										</span>
									</div>
								)}

								<div className="flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5">
									<span className='text-slate-500 font-medium'>Network</span>
									<span className="font-semibold text-slate-900">
										{paymentData.network}
									</span>
								</div>

								<div className="flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5">
									<span className='text-slate-500 font-medium'>Reference</span>
									<span className="font-mono text-[11px] sm:text-xs text-blue-600 font-medium truncate ml-2">
										{paymentData.reference}
									</span>
								</div>

								{statusData?.txHash && (
									<div className="flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5">
										<span className='text-slate-500 font-medium'>TX Hash</span>
										<span className="font-mono text-[11px] sm:text-xs text-blue-600 truncate ml-2">
											{statusData.txHash.slice(0, 10)}...{statusData.txHash.slice(-6)}
										</span>
									</div>
								)}
							</div>

							{/* Minimalist Note Callout */}
							<div className="flex items-start gap-2.5 sm:gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 text-[11px] sm:text-xs text-slate-600 leading-relaxed">
								<div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
									i
								</div>
								<p>
									Payout has been settled to your bank account. Depending on interbank settlement speeds, funds reflect within moments.
								</p>
							</div>
						</div>

						{/* Action Buttons: Minimalist Social Share (No wasted space) */}
						<div className="pt-1">
							<div className="grid grid-cols-2 gap-2 sm:gap-3">
								<button
									type="button"
									onClick={() => handleShareReceiptImage("whatsapp")}
									disabled={isSharingImage}
									className="flex items-center justify-center gap-2 py-3 px-3 sm:px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-60 cursor-pointer"
								>
									{isSharingImage ? (
										<Loader2 className="w-4 h-4 animate-spin shrink-0" />
									) : (
										<Share2 className="w-4 h-4 shrink-0" />
									)}
									<span className="truncate">WhatsApp</span>
								</button>

								<button
									type="button"
									onClick={() => handleShareReceiptImage("telegram")}
									disabled={isSharingImage}
									className="flex items-center justify-center gap-2 py-3 px-3 sm:px-4 rounded-xl bg-blue-50 hover:bg-blue-100 active:scale-[0.98] text-blue-600 border border-blue-200 font-semibold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-60 cursor-pointer"
								>
									{isSharingImage ? (
										<Loader2 className="w-4 h-4 animate-spin shrink-0" />
									) : (
										<Send className="w-4 h-4 shrink-0" />
									)}
									<span className="truncate">Telegram</span>
								</button>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
