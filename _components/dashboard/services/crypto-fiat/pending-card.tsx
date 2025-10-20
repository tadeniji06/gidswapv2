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

	// Always poll every 60 seconds
	const { data: statusData } = useQuery<PendingPaymentData>({
		queryKey: ["payment-status", paymentData.id],
		queryFn: async () => {
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
			return res.json();
		},
		refetchInterval: 60000,
		initialData: paymentData,
	});

	const currentStatus = statusData?.status ?? paymentData.status;

	// Status map
	const statusMap: Record<
		string,
		{ label: string; icon: JSX.Element; color: string }
	> = {
		pending: {
			label: "Order created, waiting for deposit",
			icon: <Loader2 className='w-5 h-5 text-yellow-400' />,
			color: "text-yellow-400",
		},
		processing: {
			label: "Provider assigned, processing payment",
			icon: <RefreshCw className='w-5 h-5 text-blue-400' />,
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

	// Timer logic
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
		}, 60000);

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

							{/* Show QR trigger (for mobile users) */}
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
							<p className='text-blue-400 text-xs mt-1'>
								Address copied!
							</p>
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
							<p className='text-blue-400 text-xs mt-1'>
								Reference copied!
							</p>
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
		</div>
	);
}
