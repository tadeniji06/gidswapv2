"use client";

import { useEffect, useState } from "react";
import {
	useQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { kycService, KycStatus } from "@/lib/services/kyc";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/src/components/ui/card";
import {
	ShieldCheck,
	AlertTriangle,
	CheckCircle,
	RefreshCw,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from "@/src/components/ui/dialog";
import { KycFlow } from "./kyc-flow";
import { cn } from "@/lib/utils"; // Assuming utils exists, or just use tailwind

export function KycManager() {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);

	// Fetch KYC Data
	const {
		data: kyc,
		isLoading,
		error,
	} = useQuery<KycStatus>({
		queryKey: ["kyc-status"],
		queryFn: kycService.getStatus,
	});

	// Handle successful verification from modal
	const handleVerifySuccess = () => {
		queryClient.invalidateQueries({ queryKey: ["kyc-status"] });
		setOpen(false);
	};

	if (isLoading) {
		return (
			<Card className='border-border bg-card/50'>
				<CardContent className='p-6 flex items-center gap-4'>
					<div className='w-10 h-10 bg-muted animate-pulse rounded-full' />
					<div className='space-y-2'>
						<div className='h-4 w-32 bg-muted animate-pulse rounded' />
						<div className='h-3 w-48 bg-muted animate-pulse rounded' />
					</div>
				</CardContent>
			</Card>
		);
	}

	// Determine status display
	const status = kyc?.status || "unverified";
	const isVerified = status === "verified";
	const isFailed = status === "failed";

	return (
		<Card className='border-border bg-card shadow-sm'>
			<CardHeader className='flex flex-row items-center justify-between pb-2'>
				<CardTitle className='text-lg font-semibold flex items-center gap-2'>
					<ShieldCheck className='w-5 h-5 text-primary' />{" "}
					Verification Status
				</CardTitle>
				<Badge
					variant={isVerified ? "secondary" : "destructive"}
					className={cn(
						"uppercase text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
						isVerified
							? "bg-green-500/10 text-green-500 border-green-500/20"
							: isFailed
								? "bg-red-500/10 text-red-500 border-red-500/20"
								: "bg-orange-500/10 text-orange-500 border-orange-500/20",
					)}
				>
					{isVerified && <CheckCircle className='w-3 h-3' />}
					{status}
				</Badge>
			</CardHeader>

			<CardContent className='space-y-4'>
				{/* Status Text */}
				<div className='text-sm text-muted-foreground'>
					{isVerified ? (
						<p>
							Your identity has been verified. You have full access to
							trading features.
						</p>
					) : isFailed ? (
						<div className='flex items-start gap-2 text-red-400 bg-red-500/5 p-3 rounded-lg border border-red-500/10'>
							<AlertTriangle className='w-4 h-4 mt-0.5 shrink-0' />
							<div>
								<p className='font-medium'>Verification Failed</p>
								<p className='text-xs opacity-80 mt-1'>
									{kyc?.failureReason || "Reason unknown"}
								</p>
							</div>
						</div>
					) : (
						<p className='text-orange-400'>
							Complete verification to unlock trading limits and
							secure your account.
						</p>
					)}
				</div>

				{/* Action Button */}
				{!isVerified && (
					<Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger asChild>
							<Button className='w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90'>
								{isFailed
									? "Retry Verification"
									: "Start Verification"}
							</Button>
						</DialogTrigger>
						<DialogContent className='sm:max-w-md p-0 overflow-hidden bg-transparent border-none shadow-none'>
							<KycFlow
								onCancel={() => setOpen(false)}
								onComplete={handleVerifySuccess}
							/>
						</DialogContent>
					</Dialog>
				)}

				{/* Verification Details (if user has attempted) */}
				{(kyc?.bvn || kyc?.nin) && (
					<div className='pt-4 border-t border-border grid grid-cols-2 gap-4 text-xs'>
						{kyc.bvn && (
							<div>
								<span className='text-muted-foreground block mb-1'>
									BVN
								</span>
								<span className='font-mono bg-muted px-2 py-1 rounded text-foreground'>
									{kyc.bvn.replace(/(\d{3})\d+(\d{3})/, "$1*****$2")}
								</span>
							</div>
						)}
						{kyc.nin && (
							<div>
								<span className='text-muted-foreground block mb-1'>
									NIN
								</span>
								<span className='font-mono bg-muted px-2 py-1 rounded text-foreground'>
									{kyc.nin.replace(/(\d{3})\d+(\d{3})/, "$1*****$2")}
								</span>
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
