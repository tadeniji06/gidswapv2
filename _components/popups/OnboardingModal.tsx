"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, OnboardingPayload } from "@/lib/services/user";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/src/components/ui/dialog";
import { useAuthStore } from "@/store/Authstore";
import { Building2, Wallet, ArrowRight, Loader2, Search, Check } from "lucide-react";
import { toast } from "sonner";
import { setCookie } from "@/lib/cookies";
import { apiClient } from "@/lib/client";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/src/components/ui/select";
import { cn } from "@/lib/utils";

export function OnboardingModal() {
	const queryClient = useQueryClient();
	const { user, setUser } = useAuthStore();
	const [isOpen, setIsOpen] = useState(false);
	const [step, setStep] = useState<1 | 2>(1);

	// Form State
	const [bankName, setBankName] = useState("");
	const [bankCode, setBankCode] = useState("");
	const [accountNumber, setAccountNumber] = useState("");
	const [accountName, setAccountName] = useState("");
	const [returnAddress, setReturnAddress] = useState("");
	const [isResolving, setIsResolving] = useState(false);
	const [bankSearchOpen, setBankSearchOpen] = useState(false);

	// Fetch fresh profile to check onboarding status
	const { data: profile, isLoading } = useQuery({
		queryKey: ["user-profile"],
		queryFn: userService.getProfile,
	});

	// Fetch supported banks
	const { data: banksData } = useQuery({
		queryKey: ["supported-banks", "NGN"],
		queryFn: async () => {
			const res = await apiClient.get("/payCrest/trade/supportedBanks/NGN");
			return res.data?.data || [];
		},
	});

	useEffect(() => {
		if (profile && !profile.user.onboardingCompleted) {
			setIsOpen(true);
		} else if (profile && profile.user.onboardingCompleted) {
			setIsOpen(false);
		}
	}, [profile]);

	const mutation = useMutation({
		mutationFn: userService.completeOnboarding,
		onSuccess: () => {
			toast.success("Welcome aboard! Your details have been saved.");
			setIsOpen(false);
			
			// Update local auth store so user object reflects completion
			if (user) {
				const updatedUser = { ...user, onboardingCompleted: true };
				setUser(updatedUser);
				setCookie("user", JSON.stringify(updatedUser));
			}
			
			queryClient.invalidateQueries({ queryKey: ["user-profile"] });
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to complete setup.");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!bankName || !bankCode || !accountNumber || !accountName) {
			toast.error("Please fill in all bank details.");
			return;
		}
		
		mutation.mutate({
			bankName,
			bankCode,
			accountNumber,
			accountName,
			returnAddress,
		});
	};

	// Real account resolution using PayCrest API
	const resolveAccountName = async (accNum: string, code: string) => {
		if (accNum.length === 10 && code) {
			setIsResolving(true);
			setAccountName(""); // clear previous
			try {
				const data = await userService.verifyBankAccount(accNum, code);
				const accountNameResult = typeof data.data === "string" ? data.data : (data?.data?.account_name || data?.data?.accountName || data?.account_name);
				
				if ((data.success || data.status === "success" || data.status === true || accountNameResult) && accountNameResult) {
					setAccountName(accountNameResult);
					toast.success("Account name verified successfully!");
				} else {
					toast.error(data.message || "Could not verify account name. Please check details.");
				}
			} catch (err: any) {
				toast.error(err.response?.data?.message || err.response?.data?.error || "Account verification failed");
			} finally {
				setIsResolving(false);
			}
		}
	};

	// Auto-trigger when inputs are ready
	useEffect(() => {
		if (accountNumber.length === 10 && bankCode) {
			resolveAccountName(accountNumber, bankCode);
		} else {
			setAccountName("");
		}
	}, [accountNumber, bankCode]);

	// Prevent closing
	const onOpenChange = (open: boolean) => {
		// Only allow closing if onboarding is actually completed
		if (profile?.user?.onboardingCompleted) {
			setIsOpen(open);
		}
	};

	if (isLoading) return null; // Don't show anything while checking status

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md p-6 outline-none bg-card border-border shadow-2xl rounded-2xl">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold flex items-center gap-2">
						Complete Your Profile
					</DialogTitle>
					<p className="text-sm text-muted-foreground mt-1">
						Set up your default accounts to enable seamless deposits and withdrawals.
					</p>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="mt-4 space-y-6">
					{step === 1 && (
						<div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
							<div className="flex items-center gap-2 mb-2 text-primary">
								<Building2 className="w-5 h-5" />
								<h3 className="font-semibold">Fiat Bank Account</h3>
							</div>
							
							<div className="space-y-4">
								<div className="space-y-1">
									<Label>Select Bank</Label>
									<Select
										value={bankCode}
										onValueChange={(val) => {
											setBankCode(val);
											const bank = banksData?.find((b: any) => b.code === val);
											if (bank) setBankName(bank.name);
										}}
									>
										<SelectTrigger className="w-full h-12 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
											<SelectValue placeholder="Select a bank..." />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{banksData?.map((bank: any) => (
													<SelectItem key={bank.code} value={bank.code}>
														{bank.name}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
								</div>
								
								<div className="space-y-1">
									<Label>Bank Code</Label>
									<Input 
										placeholder="e.g. 044" 
										value={bankCode}
										readOnly
										className="bg-muted/50 h-12"
									/>
								</div>

								<div className="space-y-1">
									<Label>Account Number</Label>
									<Input 
										placeholder="10-digit account number" 
										value={accountNumber}
										onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
										maxLength={10}
										required
										className="h-12 text-base font-mono tracking-widest"
										disabled={isResolving}
									/>
								</div>

								<div className="space-y-1 relative">
									<Label>Account Name</Label>
									<div className="relative">
										<Input 
											placeholder={isResolving ? "Verifying..." : "Auto-resolved account name"} 
											value={accountName}
											readOnly
											className={cn("h-12 font-medium transition-colors", accountName ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800" : "bg-muted/50")}
											required
										/>
										{isResolving && (
											<Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-blue-500" />
										)}
									</div>
								</div>
							</div>

							<Button 
								type="button" 
								className="w-full mt-4" 
								onClick={() => setStep(2)}
								disabled={!bankName || !bankCode || !accountNumber || !accountName}
							>
								Next Step <ArrowRight className="w-4 h-4 ml-2" />
							</Button>
						</div>
					)}

					{step === 2 && (
						<div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
							<div className="flex items-center gap-2 mb-2 text-primary">
								<Wallet className="w-5 h-5" />
								<h3 className="font-semibold">Crypto Return Address</h3>
							</div>
							<p className="text-xs text-muted-foreground mb-4">
								Where should we send your crypto if a swap fails? This will be set as your default return address.
							</p>

							<div className="space-y-1">
								<Label>USDT EVM Address (Optional)</Label>
								<Input 
									placeholder="T..." 
									value={returnAddress}
									onChange={(e) => setReturnAddress(e.target.value)}
								/>
							</div>

							<div className="flex gap-3 mt-6">
								<Button 
									type="button" 
									variant="outline" 
									className="flex-1" 
									onClick={() => setStep(1)}
									disabled={mutation.isPending}
								>
									Back
								</Button>
								<Button 
									type="submit" 
									className="flex-1"
									disabled={mutation.isPending}
								>
									{mutation.isPending ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										"Complete Setup"
									)}
								</Button>
							</div>
						</div>
					)}
				</form>
			</DialogContent>
		</Dialog>
	);
}
