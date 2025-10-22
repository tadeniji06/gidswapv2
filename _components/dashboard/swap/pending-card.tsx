"use client";

import { useState, useEffect } from "react";
import {
	Copy,
	CheckCircle,
	Clock,
	ArrowLeft,
	Check,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/src/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/src/components/ui/dialog";
import { useSwapStore } from "@/lib/swap-store";
import { QRCodeCanvas } from "qrcode.react";

interface PendingDepositCardProps {
	swapData?: any;
}

export function PendingDepositCard({
	swapData: propSwapData,
}: PendingDepositCardProps) {
	const { swapData: storeSwapData, backToSwap } = useSwapStore();
	const [copied, setCopied] = useState<string>("");
	const [open, setOpen] = useState(false);
	const [isDesktop, setIsDesktop] = useState(false);

	const swapData = propSwapData || storeSwapData;

	useEffect(() => {
		const mobileRegex =
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
		setIsDesktop(!mobileRegex.test(navigator.userAgent));
	}, []);

	if (!swapData || swapData.code !== 0) {
		return (
			<Card className='w-full max-w-md mx-auto bg-gray-900 border-gray-800'>
				<CardContent className='p-6'>
					<p className='text-gray-400 text-center'>
						No valid swap data available
					</p>
				</CardContent>
			</Card>
		);
	}

	const copyToClipboard = (text: string, type: string) => {
		navigator.clipboard.writeText(text);
		setCopied(type);
		setTimeout(() => setCopied(""), 2000);
	};

	const handleCloseDialog = () => {
		setOpen(false);
		backToSwap();
	};

	const depositAddress =
		swapData.data?.from?.address || "Address not available";
	const depositAmount = swapData.data?.from?.amount || "0";
	const fromCurrency = swapData.data?.from?.coin || "BTC";
	const toCurrency = swapData.data?.to?.coin || "ETH";
	const swapId = swapData.data?.id || "N/A";
	const timeLeft = swapData.data?.time?.left || 1800; // seconds
	const timeLeftMinutes = Math.floor(timeLeft / 60);

	return (
		<>
			<Card className='w-full max-w-lg mx-auto bg-gray-900 border border-gray-800 shadow-lg rounded-2xl'>
				<CardHeader className='pb-4'>
					<div className='flex items-center justify-between'>
						<Button
							variant='ghost'
							size='sm'
							onClick={backToSwap}
							className='text-gray-400 hover:text-white p-0'
						>
							<ArrowLeft className='h-4 w-4 mr-1' />
							Back
						</Button>

						<div className='flex items-center gap-2 text-orange-500'>
							<Clock className='h-4 w-4' />
							<span className='text-sm font-medium'>Pending</span>
						</div>
					</div>

					<CardTitle className='text-white text-xl mt-3'>
						Send {fromCurrency}
					</CardTitle>
					<p className='text-gray-400 text-sm'>
						Send the exact amount to the address below to complete
						your swap
					</p>
				</CardHeader>

				<CardContent className='space-y-6'>
					{/* QR + Address Section */}
					<div className='flex flex-col md:flex-row md:items-start gap-6'>
						<div className='flex justify-center md:w-1/3'>
							<div className='bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm'>
								<QRCodeCanvas
									value={depositAddress}
									size={isDesktop ? 140 : 120}
									bgColor='#1f2937'
									fgColor='#ffffff'
									includeMargin
								/>
							</div>
						</div>

						<div className='flex-1 space-y-4'>
							{/* Deposit Address */}
							<div className='space-y-2'>
								<label className='text-sm font-medium text-gray-300'>
									Deposit Address
								</label>
								<div className='flex items-center gap-2 p-3 bg-gray-800 rounded-lg border border-gray-700'>
									<code className='flex-1 text-sm text-white font-mono break-all'>
										{depositAddress}
									</code>
									<Button
										variant='ghost'
										size='sm'
										onClick={() =>
											copyToClipboard(depositAddress, "address")
										}
										className='text-gray-400 hover:text-white p-1'
									>
										{copied === "address" ? (
											<CheckCircle className='h-4 w-4 text-green-500' />
										) : (
											<Copy className='h-4 w-4' />
										)}
									</Button>
								</div>
								{copied === "address" && (
									<p className='text-green-400 text-xs mt-1'>
										Address copied!
									</p>
								)}
							</div>

							{/* Amount */}
							<div className='space-y-2'>
								<label className='text-sm font-medium text-gray-300'>
									Amount to Send
								</label>
								<div className='flex items-center gap-2 p-3 bg-gray-800 rounded-lg border border-gray-700'>
									<span className='flex-1 text-lg font-semibold text-white'>
										{depositAmount} {fromCurrency}
									</span>
									<Button
										variant='ghost'
										size='sm'
										onClick={() =>
											copyToClipboard(depositAmount, "amount")
										}
										className='text-gray-400 hover:text-white p-1'
									>
										{copied === "amount" ? (
											<CheckCircle className='h-4 w-4 text-green-500' />
										) : (
											<Copy className='h-4 w-4' />
										)}
									</Button>
								</div>
								{copied === "amount" && (
									<p className='text-green-400 text-xs mt-1'>
										Amount copied!
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Swap Info */}
					<div className='space-y-3 p-4 bg-gray-800 rounded-lg border border-gray-700'>
						<div className='flex justify-between text-sm'>
							<span className='text-gray-400'>Swap ID</span>
							<span className='text-white font-medium'>{swapId}</span>
						</div>
						<div className='flex justify-between text-sm'>
							<span className='text-gray-400'>You will receive</span>
							<span className='text-white font-medium'>
								{swapData.data?.to?.amount || "Calculating..."}{" "}
								{toCurrency}
							</span>
						</div>
						<div className='flex justify-between text-sm'>
							<span className='text-gray-400'>Expires in</span>
							<span className='text-white'>
								{timeLeftMinutes} mins
							</span>
						</div>
					</div>

					<Button
						className='bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl w-full'
						onClick={() => setOpen(true)}
					>
						I have sent the coin
					</Button>

					<div className='p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg'>
						<p className='text-yellow-200 text-xs'>
							⚠️ Send only {fromCurrency} to this address. Sending any
							other currency will result in permanent loss.
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Popup Dialog */}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className='sm:max-w-md bg-gray-900 border border-gray-800 text-white rounded-xl'>
					<DialogHeader>
						<div className='flex justify-center p-3'>
							<div className='p-3 bg-green-100 rounded-full flex items-center justify-center shadow-inner'>
								<Check size={22} className='text-green-600' />
							</div>
						</div>
						<DialogTitle className='text-center text-lg font-semibold text-white'>
							Transaction Processed
						</DialogTitle>
					</DialogHeader>
					<div className='text-sm text-gray-300 text-center space-y-2'>
						<p>
							Your transaction has been marked as sent successfully.
						</p>
						<p>
							If there are any issues, please reach out to our support
							team.
						</p>
					</div>
					<DialogFooter>
						<Button
							onClick={handleCloseDialog}
							className='bg-blue-600 hover:bg-blue-700 text-white w-full'
						>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
