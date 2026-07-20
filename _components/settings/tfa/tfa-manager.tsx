"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tfaService } from "@/lib/services/tfa";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Shield, ShieldAlert, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function TfaManager() {
	const queryClient = useQueryClient();
	const [setupOpen, setSetupOpen] = useState(false);
	const [disableOpen, setDisableOpen] = useState(false);
	const [token, setToken] = useState("");

	const { data: status, isLoading } = useQuery({
		queryKey: ["tfa-status"],
		queryFn: tfaService.getStatus,
	});

	const { data: setupData, mutate: startSetup, isPending: isSettingUp } = useMutation({
		mutationFn: tfaService.setup,
		onError: () => toast.error("Failed to initialize 2FA setup"),
	});

	const { mutate: verifySetup, isPending: isVerifying } = useMutation({
		mutationFn: tfaService.verify,
		onSuccess: () => {
			toast.success("2FA enabled successfully!");
			queryClient.invalidateQueries({ queryKey: ["tfa-status"] });
			setSetupOpen(false);
			setToken("");
		},
		onError: (err: any) => {
			toast.error(err.response?.data?.message || "Invalid code");
		},
	});

	const { mutate: disableTfa, isPending: isDisabling } = useMutation({
		mutationFn: tfaService.disable,
		onSuccess: () => {
			toast.success("2FA disabled successfully");
			queryClient.invalidateQueries({ queryKey: ["tfa-status"] });
			setDisableOpen(false);
			setToken("");
		},
		onError: (err: any) => {
			toast.error(err.response?.data?.message || "Invalid code");
		},
	});

	const handleSetupClick = () => {
		setSetupOpen(true);
		startSetup();
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

	const isEnabled = status?.isTwoFactorEnabled;

	return (
		<Card className='border-border bg-card shadow-sm'>
			<CardHeader className='flex flex-row items-center justify-between pb-2'>
				<CardTitle className='text-lg font-semibold flex items-center gap-2'>
					<Shield className='w-5 h-5 text-primary' />{" "}
					Two-Factor Authentication
				</CardTitle>
				<Badge
					variant={isEnabled ? "secondary" : "destructive"}
					className={cn(
						"uppercase text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
						isEnabled
							? "bg-green-500/10 text-green-500 border-green-500/20"
							: "bg-red-500/10 text-red-500 border-red-500/20",
					)}
				>
					{isEnabled && <CheckCircle className='w-3 h-3' />}
					{isEnabled ? "Enabled" : "Disabled"}
				</Badge>
			</CardHeader>

			<CardContent className='space-y-4'>
				<div className='text-sm text-muted-foreground'>
					{isEnabled ? (
						<div className="space-y-1">
							<p className="font-medium text-green-600 dark:text-green-400">
								Your account is secured with 2FA
							</p>
							<p>
								You will be required to enter a code from your authenticator app when editing refund addresses or placing trades.
							</p>
						</div>
					) : (
						<div className='flex items-start gap-2 text-red-400 bg-red-500/5 p-3 rounded-lg border border-red-500/10'>
							<ShieldAlert className='w-4 h-4 mt-0.5 shrink-0' />
							<div>
								<p className='font-medium'>2FA is required</p>
								<p className='text-xs opacity-80 mt-1'>
									You must enable Two-Factor Authentication to trade or add refund addresses.
								</p>
							</div>
						</div>
					)}
				</div>

				{!isEnabled ? (
					<>
						<Button onClick={handleSetupClick} className='bg-primary hover:bg-primary/90 text-primary-foreground'>
							Setup 2FA
						</Button>

						<Dialog open={setupOpen} onOpenChange={(open) => {
							if (!open) setToken("");
							setSetupOpen(open);
						}}>
							<DialogContent className='sm:max-w-md'>
								<DialogHeader>
									<DialogTitle>Setup Google Authenticator</DialogTitle>
								</DialogHeader>
								<div className="flex flex-col items-center space-y-4 py-4">
									{isSettingUp ? (
										<Loader2 className="w-8 h-8 animate-spin text-primary" />
									) : setupData ? (
										<>
											<p className="text-sm text-center text-muted-foreground">
												Scan the QR code below with your Google Authenticator app, then enter the 6-digit code.
											</p>
											<div className="bg-white p-2 rounded-lg">
												<Image
													src={setupData.qrCodeUrl}
													alt="2FA QR Code"
													width={200}
													height={200}
												/>
											</div>
											<div className="w-full space-y-2">
												<Input
													value={token}
													onChange={(e) => setToken(e.target.value)}
													placeholder="6-digit code"
													className="text-center tracking-widest text-lg"
													maxLength={6}
												/>
												<Button
													className="w-full bg-primary"
													onClick={() => verifySetup(token)}
													disabled={token.length !== 6 || isVerifying}
												>
													{isVerifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
													Verify & Enable
												</Button>
											</div>
										</>
									) : null}
								</div>
							</DialogContent>
						</Dialog>
					</>
				) : (
					<>
						<Button variant="destructive" onClick={() => setDisableOpen(true)}>
							Disable 2FA
						</Button>

						<Dialog open={disableOpen} onOpenChange={(open) => {
							if (!open) setToken("");
							setDisableOpen(open);
						}}>
							<DialogContent className='sm:max-w-md'>
								<DialogHeader>
									<DialogTitle>Disable 2FA</DialogTitle>
								</DialogHeader>
								<div className="flex flex-col space-y-4 py-4">
									<p className="text-sm text-muted-foreground">
										Enter the 6-digit code from your authenticator app to disable 2FA.
									</p>
									<Input
										value={token}
										onChange={(e) => setToken(e.target.value)}
										placeholder="6-digit code"
										className="tracking-widest"
										maxLength={6}
									/>
									<Button
										variant="destructive"
										className="w-full"
										onClick={() => disableTfa(token)}
										disabled={token.length !== 6 || isDisabling}
									>
										{isDisabling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
										Disable 2FA
									</Button>
								</div>
							</DialogContent>
						</Dialog>
					</>
				)}
			</CardContent>
		</Card>
	);
}
