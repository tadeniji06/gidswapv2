"use client";

import Cookies from "js-cookie";
import { useState, useEffect, JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import {
	Copy,
	Clock,
	Wallet,
	Hash,
	Loader2,
	CheckCircle2,
	XCircle,
	RefreshCw,
	ShieldCheck,
	CircleDollarSign,
	RotateCw,
	QrCode,
	ExternalLink,
	PartyPopper,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/src/components/ui/dialog";

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
}

interface PendingPaymentCardProps {
	paymentData: PendingPaymentData;
	onTimeout: () => void;
}

export function PendingPaymentCard({
	paymentData,
	onTimeout,
}: PendingPaymentCardProps) {
	const [timeLeft, setTimeLeft] = useState<number>(0);
	const [copied, setCopied] = useState<string>("");
	const [isDesktop, setIsDesktop] = useState(false);
	const [qrOpen, setQrOpen] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [transactionStartTime] = useState<number>(Date.now());
	const [completionTime, setCompletionTime] = useState<string>("");
	const [hasShownSuccess, setHasShownSuccess] = useState(false);

	const API_URL = process.env.NEXT_PUBLIC_PROD_API;
	const authToken = Cookies.get("token");

	// Detect desktop
	useEffect(() => {
		const userAgent =
			typeof window !== "undefined" ? navigator.userAgent : "";
		const mobileRegex =
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
		setIsDesktop(!mobileRegex.test(userAgent));
	}, []);

	// Poll every 2 seconds for better UX - THIS IS THE KEY CHANGE!
	const { data: statusData, isError } = useQuery<PendingPaymentData>({
		queryKey: ["payment-status", paymentData.id],
		queryFn: async () => {
			console.log(`🔄 Polling payment status for: ${paymentData.id}`);
			const res = await fetch(
				`${API_URL}/api/payCrest/trade/status/${paymentData.id}`,
				{
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},
				}
			);
			if (!res.ok) throw new Error("Failed to fetch payment status");
			const data = await res.json();
			console.log(`Current status: ${data.status}`);
			return data;
		},
		refetchInterval: 5000,
		refetchIntervalInBackground: true, // Keep polling even when tab is not focused
		initialData: paymentData,
		retry: 3, // Retry failed requests
	});

	const currentStatus = statusData?.status ?? paymentData.status;

	// Detect when transaction is settled and show success modal
	useEffect(() => {
		if (currentStatus === "settled" && !hasShownSuccess) {
			console.log("Transaction settled! Showing success modal");

			// Calculate completion time
			const duration = Date.now() - transactionStartTime;
			const seconds = Math.floor(duration / 1000);
			const minutes = Math.floor(seconds / 60);
			const remainingSeconds = seconds % 60;

			if (minutes > 0) {
				setCompletionTime(`${minutes}m ${remainingSeconds}s`);
			} else {
				setCompletionTime(`${seconds}s`);
			}

			setShowSuccessModal(true);
			setHasShownSuccess(true);
		}
	}, [currentStatus, hasShownSuccess, transactionStartTime]);

	// Status map with animations
	const statusMap: Record<
		string,
		{ label: string; icon: JSX.Element; color: string }
	> = {
		pending: {
			label: "Order created, waiting for deposit",
			icon: (
				<Loader2 className='w-5 h-5 text-yellow-400 animate-spin' />
			),
			color: "text-yellow-400",
		},
		processing: {
			label: "Provider assigned, processing payment",
			icon: (
				<RefreshCw className='w-5 h-5 text-blue-400 animate-spin' />
			),
			color: "text-blue-400",
		},
		fulfilled: {
			label: "Payment completed by provider",
			icon: <CheckCircle2 className='w-5 h-5 text-green-400' />,
			color: "text-green-400",
		},
		validated: {
			label: "Payment validated and confirmed",
			icon: <ShieldCheck className='w-5 h-5 text-emerald-400' />,
			color: "text-emerald-400",
		},
		settled: {
			label: "Order fully completed on blockchain",
			icon: <CircleDollarSign className='w-5 h-5 text-green-500' />,
			color: "text-green-500",
		},
		cancelled: {
			label: "Order cancelled",
			icon: <XCircle className='w-5 h-5 text-red-400' />,
			color: "text-red-400",
		},
		refunded: {
			label: "Funds refunded to sender",
			icon: <RotateCw className='w-5 h-5 text-purple-400' />,
			color: "text-purple-400",
		},
	};

	const statusInfo = statusMap[currentStatus] ?? {
		label: "Unknown status",
		icon: <Loader2 className='w-5 h-5 text-gray-400' />,
		color: "text-gray-400",
	};

	// Timer logic for expiration countdown
	useEffect(() => {
		const calculateTimeLeft = () => {
			const now = new Date().getTime();
			const validUntil = new Date(paymentData.validUntil).getTime();
			const difference = validUntil - now;
			return difference > 0 ? Math.floor(difference / 1000 / 60) : 0;
		};

		setTimeLeft(calculateTimeLeft());
		const timer = setInterval(() => {
			const newTimeLeft = calculateTimeLeft();
			setTimeLeft(newTimeLeft);
			if (newTimeLeft <= 0) {
				clearInterval(timer);
				onTimeout();
			}
		}, 60000); // Check expiration every minute

		return () => clearInterval(timer);
	}, [paymentData.validUntil, onTimeout]);

	const copyToClipboard = (text: string, type: string) => {
		navigator.clipboard.writeText(text);
		setCopied(type);
		setTimeout(() => setCopied(""), 2000);
	};

	const formatNetwork = (network: string) =>
		network
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

	const shareOnX = () => {
		const text = `I Just completed a payment of ${
			paymentData.amount
		} ${paymentData.token} on ${formatNetwork(
			paymentData.network
		)} in ${completionTime} with @gidswapng!`;
		const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
			text
		)}`;
		window.open(url, "_blank", "noopener,noreferrer");
	};

	return (
		<div className='w-full max-w-lg mx-auto'>
			<Card className='bg-[#1a1b24] border-gray-700 shadow-lg shadow-black/30 rounded-2xl'>
				<CardHeader className='text-center pb-4'>
					<div className='flex items-center justify-between'>
						<AnimatePresence mode='wait'>
							<motion.div
								key={currentStatus}
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 10 }}
								transition={{ duration: 0.3 }}
								className={`flex items-center gap-2 ${statusInfo.color}`}
							>
								{statusInfo.icon}
								<CardTitle className='text-md capitalize'>
									{currentStatus}
								</CardTitle>
							</motion.div>
						</AnimatePresence>

						<div className='flex items-center gap-2 text-orange-400'>
							<Clock className='w-4 h-4' />
							<span className='text-sm font-semibold'>
								{timeLeft > 0 ? `${timeLeft} mins left` : "Expired"}
							</span>
						</div>
					</div>

					<p className='text-gray-400 text-sm mt-3'>
						{statusInfo.label}
					</p>

					{/* Polling indicator */}
					<div className='flex items-center justify-center gap-2 mt-2'>
						<div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
						<span className='text-xs text-gray-500'>
							Auto-updating every 5s
						</span>
					</div>
				</CardHeader>

				<CardContent className='space-y-4'>
					{/* Amount & Token */}
					<div className='bg-[#22232e] rounded-lg p-4'>
						<div className='flex justify-between'>
							<span className='text-gray-400'>Amount</span>
							<span className='text-white font-semibold'>
								{paymentData.amount} {paymentData.token}
							</span>
						</div>
						<div className='flex justify-between mt-2'>
							<span className='text-gray-400'>Network</span>
							<span className='text-white'>
								{formatNetwork(paymentData.network)}
							</span>
						</div>
					</div>

					{/* Wallet Address */}
					<div className='bg-[#22232e] rounded-lg p-4'>
						<div className='flex items-center gap-2 mb-2'>
							<Wallet className='w-5 h-5 text-blue-400' />
							<span className='text-gray-400'>Send to Address</span>
						</div>

						<div className='flex items-center gap-2'>
							<code className='flex-1 text-white text-sm bg-[#11121a] p-2 rounded break-all'>
								{paymentData.receiveAddress}
							</code>
							<Button
								variant='ghost'
								size='sm'
								onClick={() =>
									copyToClipboard(
										paymentData.receiveAddress,
										"address"
									)
								}
								className='text-blue-400 hover:text-blue-300'
							>
								{copied === "address" ? (
									<CheckCircle2 className='w-4 h-4 text-green-400' />
								) : (
									<Copy className='w-4 h-4' />
								)}
							</Button>

							{/* Show QR trigger */}
							<Button
								variant='ghost'
								size='sm'
								onClick={() => setQrOpen(true)}
								className='text-blue-400 hover:text-blue-300'
							>
								<QrCode className='w-4 h-4' />
							</Button>
						</div>

						{copied === "address" && (
							<motion.p
								initial={{ opacity: 0, y: -5 }}
								animate={{ opacity: 1, y: 0 }}
								className='text-blue-400 text-xs mt-1'
							>
								✓ Address copied!
							</motion.p>
						)}

						{/* Inline QR for desktop */}
						{isDesktop && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4 }}
								className='flex flex-col items-center justify-center mt-4'
							>
								<div className='p-3 rounded-xl bg-[#0f1015] border border-blue-500/20 shadow-inner'>
									<QRCodeCanvas
										value={paymentData.receiveAddress}
										size={150}
										bgColor='#0f1015'
										fgColor='#00BFFF'
										level='H'
										includeMargin={true}
									/>
								</div>
								<p className='text-gray-500 text-xs mt-2'>
									Scan QR to pay
								</p>
							</motion.div>
						)}
					</div>

					{/* Reference */}
					<div className='bg-[#22232e] rounded-lg p-4'>
						<div className='flex items-center gap-2 mb-2'>
							<Hash className='w-5 h-5 text-blue-400' />
							<span className='text-gray-400'>Reference</span>
						</div>
						<div className='flex items-center gap-2'>
							<code className='flex-1 text-white text-sm bg-[#11121a] p-2 rounded break-all'>
								{paymentData.reference}
							</code>
							<Button
								variant='ghost'
								size='sm'
								onClick={() =>
									copyToClipboard(paymentData.reference, "reference")
								}
								className='text-blue-400 hover:text-blue-300'
							>
								{copied === "reference" ? (
									<CheckCircle2 className='w-4 h-4 text-green-400' />
								) : (
									<Copy className='w-4 h-4' />
								)}
							</Button>
						</div>
						{copied === "reference" && (
							<motion.p
								initial={{ opacity: 0, y: -5 }}
								animate={{ opacity: 1, y: 0 }}
								className='text-blue-400 text-xs mt-1'
							>
								✓ Reference copied!
							</motion.p>
						)}
					</div>

					{/* Warning */}
					<div className='bg-orange-500/10 border border-orange-500/20 rounded-lg p-4'>
						<p className='text-orange-400 text-sm'>
							⚠️ Send only {paymentData.token} on{" "}
							{formatNetwork(paymentData.network)}. Sending other
							tokens or using the wrong network will result in loss of
							funds.
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Mobile QR Modal */}
			<Dialog open={qrOpen} onOpenChange={setQrOpen}>
				<DialogContent className='bg-[#1a1b24] border border-gray-700 text-white rounded-xl'>
					<DialogHeader>
						<DialogTitle className='text-center'>
							Scan Payment QR
						</DialogTitle>
					</DialogHeader>

					<div className='flex flex-col items-center justify-center space-y-3'>
						<div className='p-3 bg-[#0f1015] border border-blue-500/30 rounded-xl'>
							<QRCodeCanvas
								value={paymentData.receiveAddress}
								size={180}
								bgColor='#0f1015'
								fgColor='#00BFFF'
								level='H'
								includeMargin={true}
							/>
						</div>
						<p className='text-gray-400 text-xs text-center'>
							Scan this code in your wallet app to make payment
						</p>
					</div>

					<DialogFooter>
						<Button
							onClick={() => setQrOpen(false)}
							className='w-full bg-blue-600 hover:bg-blue-700 text-white'
						>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Success Modal - The star of the show! */}
			<Dialog
				open={showSuccessModal}
				onOpenChange={setShowSuccessModal}
			>
				<DialogContent className='bg-gradient-to-br from-[#1a1b24] to-[#22232e] border-2 border-green-500/30 text-white rounded-2xl max-w-md'>
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.3 }}
					>
						<DialogHeader className='text-center space-y-4'>
							{/* Animated success icon */}
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{
									delay: 0.2,
									type: "spring",
									stiffness: 200,
									damping: 10,
								}}
								className='mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center relative'
							>
								<motion.div
									animate={{
										scale: [1, 1.2, 1],
										opacity: [0.5, 0.8, 0.5],
									}}
									transition={{
										duration: 2,
										repeat: Infinity,
										ease: "easeInOut",
									}}
									className='absolute inset-0 bg-green-500/20 rounded-full'
								/>
								<PartyPopper className='w-10 h-10 text-green-400 relative z-10' />
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
							>
								<DialogTitle className='text-2xl font-bold text-green-400'>
									Payment Successful! 🎉
								</DialogTitle>

								<p className='text-gray-400 text-sm mt-2'>
									Your transaction has been completed and settled on
									the blockchain
								</p>
							</motion.div>
						</DialogHeader>

						<motion.div
							className='space-y-4 mt-6'
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
						>
							{/* Transaction Details Card */}
							<div className='bg-[#11121a] rounded-xl p-4 space-y-3 border border-gray-700/50'>
								<div className='flex justify-between items-center'>
									<span className='text-gray-400 text-sm'>
										Amount
									</span>
									<span className='text-white font-semibold'>
										{paymentData.amount} {paymentData.token}
									</span>
								</div>

								<div className='flex justify-between items-center'>
									<span className='text-gray-400 text-sm'>
										Network
									</span>
									<span className='text-white'>
										{formatNetwork(paymentData.network)}
									</span>
								</div>

								<div className='flex justify-between items-center'>
									<span className='text-gray-400 text-sm'>
										Completion Time
									</span>
									<motion.span
										className='text-green-400 font-semibold'
										initial={{ scale: 0.8 }}
										animate={{ scale: 1 }}
										transition={{ type: "spring", stiffness: 200 }}
									>
										⚡ {completionTime}
									</motion.span>
								</div>

								<div className='pt-3 border-t border-gray-700'>
									<div className='flex items-center justify-between mb-1'>
										<span className='text-gray-400 text-sm'>
											Transaction ID
										</span>
										<Button
											variant='ghost'
											size='sm'
											onClick={() =>
												copyToClipboard(paymentData.id, "txId")
											}
											className='text-blue-400 hover:text-blue-300 h-6 px-2'
										>
											{copied === "txId" ? (
												<CheckCircle2 className='w-3 h-3 text-green-400' />
											) : (
												<Copy className='w-3 h-3' />
											)}
										</Button>
									</div>
									<code className='text-xs text-gray-300 break-all block bg-[#0a0b0f] p-2 rounded'>
										{paymentData.id}
									</code>
								</div>
							</div>

							{/* Action Buttons */}
							<div className='flex gap-3'>
								<motion.div
									className='flex-1'
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									<Button
										onClick={shareOnX}
										className='w-full bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-semibold shadow-lg shadow-blue-500/20'
									>
										<ExternalLink className='w-4 h-4 mr-2' />
										Share on X
									</Button>
								</motion.div>

								<motion.div
									className='flex-1'
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									<Button
										onClick={() => setShowSuccessModal(false)}
										variant='outline'
										className='w-full border-gray-600 hover:bg-gray-800 text-white'
									>
										Close
									</Button>
								</motion.div>
							</div>
						</motion.div>
					</motion.div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
