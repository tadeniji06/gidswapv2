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
			<Card className='w-full max-w-md mx-auto bg-card border-border shadow-sm'>
				<CardContent className='p-6'>
					<p className='text-muted-foreground text-center font-medium'>
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
			<Card className='w-full max-w-lg mx-auto bg-card border border-border shadow-sm rounded-2xl'>
				<CardHeader className='pb-4'>
					<div className='flex items-center justify-between'>
						<Button
							variant='ghost'
							size='sm'
							onClick={backToSwap}
							className='text-muted-foreground hover:text-foreground p-0 hover:bg-transparent'
						>
							<ArrowLeft className='h-4 w-4 mr-1' />
							Back
						</Button>

						<div className='flex items-center gap-2 text-orange-600 dark:text-orange-500'>
							<Clock className='h-4 w-4' />
							<span className='text-sm font-semibold'>Pending</span>
						</div>
					</div>

					<CardTitle className='text-foreground text-xl mt-4 font-semibold'>
						Send {fromCurrency}
					</CardTitle>
					<p className='text-muted-foreground text-sm font-medium'>
						Send the exact amount to the address below to complete
						your swap
					</p>
				</CardHeader>

				<CardContent className='space-y-6'>
					{/* QR + Address Section */}
					<div className='flex flex-col md:flex-row md:items-start gap-6'>
						<div className='flex justify-center md:w-1/3'>
							<div className='bg-white p-3 rounded-xl border border-border shadow-sm'>
								<QRCodeCanvas
									value={depositAddress}
									size={isDesktop ? 140 : 120}
									bgColor='#ffffff'
									fgColor='#000000'
									includeMargin
								/>
							</div>
						</div>

						<div className='flex-1 space-y-4'>
							{/* Deposit Address */}
							<div className='space-y-2'>
								<label className='text-sm font-medium text-muted-foreground'>
									Deposit Address
								</label>
								<div className='flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border'>
									<code className='flex-1 text-sm text-foreground font-mono break-all'>
										{depositAddress}
									</code>
									<Button
										variant='ghost'
										size='sm'
										onClick={() =>
											copyToClipboard(depositAddress, "address")
										}
										className='text-muted-foreground hover:text-primary p-1 h-auto'
									>
										{copied === "address" ? (
											<CheckCircle className='h-4 w-4 text-emerald-600 dark:text-emerald-500' />
										) : (
											<Copy className='h-4 w-4' />
										)}
									</Button>
								</div>
								{copied === "address" && (
									<p className='text-emerald-600 dark:text-emerald-500 text-xs font-medium mt-1'>
										Address copied!
									</p>
								)}
							</div>

							{/* Amount */}
							<div className='space-y-2'>
								<label className='text-sm font-medium text-muted-foreground'>
									Amount to Send
								</label>
								<div className='flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border'>
									<span className='flex-1 text-lg font-semibold text-foreground'>
										{depositAmount} {fromCurrency}
									</span>
									<Button
										variant='ghost'
										size='sm'
										onClick={() =>
											copyToClipboard(depositAmount, "amount")
										}
										className='text-muted-foreground hover:text-primary p-1 h-auto'
									>
										{copied === "amount" ? (
											<CheckCircle className='h-4 w-4 text-emerald-600 dark:text-emerald-500' />
										) : (
											<Copy className='h-4 w-4' />
										)}
									</Button>
								</div>
								{copied === "amount" && (
									<p className='text-emerald-600 dark:text-emerald-500 text-xs font-medium mt-1'>
										Amount copied!
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Swap Info */}
					<div className='space-y-3 p-4 bg-muted/30 rounded-xl border border-border'>
						<div className='flex justify-between text-sm'>
							<span className='text-muted-foreground'>Swap ID</span>
							<span className='text-foreground font-medium'>{swapId}</span>
						</div>
						<div className='flex justify-between text-sm'>
							<span className='text-muted-foreground'>You will receive</span>
							<span className='text-foreground font-medium'>
								{swapData.data?.to?.amount || "Calculating..."}{" "}
								{toCurrency}
							</span>
						</div>
						<div className='flex justify-between text-sm'>
							<span className='text-muted-foreground'>Expires in</span>
							<span className='text-foreground font-medium'>
								{timeLeftMinutes} mins
							</span>
						</div>
					</div>

					<Button
						className='w-full fintech-button-primary py-6 text-base'
						onClick={() => setOpen(true)}
					>
						I have sent the coin
					</Button>

					<div className='p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl'>
						<p className='text-amber-800 dark:text-amber-200 text-sm font-medium leading-relaxed'>
							⚠️ Send only {fromCurrency} to this address. Sending any
							other currency will result in permanent loss.
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Popup Dialog */}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className='sm:max-w-md bg-card border border-border shadow-lg rounded-2xl'>
					<DialogHeader>
						<div className='flex justify-center p-3'>
							<div className='p-4 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center'>
								<Check size={28} className='text-emerald-600 dark:text-emerald-400' />
							</div>
						</div>
						<DialogTitle className='text-center text-xl font-semibold text-foreground'>
							Transaction Processed
						</DialogTitle>
					</DialogHeader>
					<div className='text-sm text-muted-foreground text-center space-y-2 py-2'>
						<p className='font-medium'>
							Your transaction has been marked as sent successfully.
						</p>
						<p>
							If there are any issues, please reach out to our support
							team.
						</p>
					</div>
					<DialogFooter className="sm:justify-center pt-2">
						<Button
							onClick={handleCloseDialog}
							className='w-full'
						>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
