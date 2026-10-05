"use client";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useSwapStore } from "@/lib/swap-store";

export function QuoteCard() {
	const {
		swapData,
		walletAddress,
		isSwapping,
		error,
		setWalletAddress,
		initiateSwap,
		backToSwap,
		setError,
	} = useSwapStore();

	const [localWalletAddress, setLocalWalletAddress] =
		useState(walletAddress);
	const [validationError, setValidationError] = useState<
		string | null
	>(null);

	if (!swapData) return null;

	const validateWalletAddress = (address: string): boolean => {
		if (!address.trim()) {
			setValidationError("Wallet address is required");
			return false;
		}

		if (address.length < 10) {
			setValidationError("Invalid wallet address format");
			return false;
		}

		setValidationError(null);
		return true;
	};

	const handleProceed = async () => {
		setError(null);

		if (!validateWalletAddress(localWalletAddress)) {
			return;
		}

		setWalletAddress(localWalletAddress.trim());
		await initiateSwap();
	};

	return (
		<div className='w-full max-w-md mx-auto'>
			<div className='bg-card border border-border rounded-2xl shadow-sm p-6'>
				<div className='flex items-center gap-3 mb-6'>
					<Button
						variant='ghost'
						size='sm'
						onClick={backToSwap}
						className='text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded-lg'
					>
						<ArrowLeft className='w-5 h-5' />
					</Button>
					<h2 className='text-xl font-semibold text-foreground'>
						Confirm Swap
					</h2>
				</div>

				{/* Swap Summary */}
				<div className='bg-muted/30 border border-border rounded-xl p-4 mb-6'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-3'>
							<img
								src={
									swapData.sellCurrency?.logo || "/placeholder.svg"
								}
								alt={swapData.sellCurrency?.coin}
								className='w-8 h-8 rounded-full border border-border'
							/>
							<div>
								<div className='text-foreground font-semibold'>
									{swapData.amount} {swapData.sellCurrency?.coin}
								</div>
								<div className='text-muted-foreground text-sm'>
									{swapData.sellCurrency?.name}
								</div>
							</div>
						</div>
						<div className='text-muted-foreground'>→</div>
						<div className='flex items-center gap-3 text-right'>
							<div>
								<div className='text-foreground font-semibold'>
									{swapData.quote?.to.amount}{" "}
									{swapData.receiveCurrency?.coin}
								</div>
								<div className='text-muted-foreground text-sm'>
									{swapData.receiveCurrency?.name}
								</div>
							</div>
							<img
								src={
									swapData.receiveCurrency?.logo || "/placeholder.svg"
								}
								alt={swapData.receiveCurrency?.coin}
								className='w-8 h-8 rounded-full border border-border'
							/>
						</div>
					</div>
				</div>

				{/* Quote Details */}
				<div className='bg-background border border-border rounded-xl p-4 mb-6 text-sm space-y-3'>
					<div className='flex justify-between items-center'>
						<span className='text-muted-foreground'>Rate</span>
						<span className='text-foreground font-medium'>
							1 {swapData.quote?.from.coin} ≈{" "}
							{swapData.quote?.from.rate.toFixed(6)}{" "}
							{swapData.quote?.to.coin}
						</span>
					</div>
					<div className='flex justify-between items-center pt-3 border-t border-border'>
						<span className='text-muted-foreground'>Network</span>
						<span className='text-foreground font-medium'>
							{swapData.quote?.to.network}
						</span>
					</div>
				</div>

				{/* Wallet Address Input */}
				<div className='mb-6 space-y-2'>
					<label className='block text-muted-foreground text-sm font-medium'>
						Receive Address ({swapData.receiveCurrency?.coin})
					</label>
					<input
						type='text'
						value={localWalletAddress}
						onChange={(e) => {
							setLocalWalletAddress(e.target.value);
							if (validationError) setValidationError(null);
							if (error) setError(null);
						}}
						placeholder={`Enter your ${swapData.receiveCurrency?.coin} wallet address`}
						className={`w-full bg-background border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors ${
							validationError || error
								? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
								: "border-input hover:border-border focus:border-primary focus:ring-1 focus:ring-primary"
						}`}
					/>
					{(validationError || error) && (
						<p className='text-red-600 dark:text-red-400 text-xs font-medium'>
							{validationError || error}
						</p>
					)}
				</div>

				{/* FixedFloat Compliance Notice */}
				<div className='mb-6 text-xs text-muted-foreground text-center leading-relaxed bg-muted p-3 rounded-lg'>
					The exchange service is provided by FixedFloat. Creating an
					order confirms your agreement with the{" "}
					<a
						href='https://ff.io/terms-of-service'
						target='_blank'
						rel='noopener noreferrer'
						className='text-primary hover:underline'
					>
						FixedFloat rules
					</a>
				</div>

				<Button
					className='w-full fintech-button-primary py-6 text-base'
					onClick={handleProceed}
					disabled={!localWalletAddress.trim() || isSwapping}
				>
					{isSwapping ? "Creating Swap..." : "Confirm Swap"}
				</Button>
			</div>
		</div>
	);
}
