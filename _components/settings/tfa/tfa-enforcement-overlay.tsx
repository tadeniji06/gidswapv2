"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tfaService } from "@/lib/services/tfa";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/src/components/ui/dialog";
import { ShieldAlert, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export function TfaEnforcementOverlay() {
	const queryClient = useQueryClient();
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
			setToken("");
		},
		onError: (err: any) => {
			toast.error(err.response?.data?.message || "Invalid code");
		},
	});

	// Automatically start setup if we know 2FA is disabled and we haven't started yet
	useEffect(() => {
		if (!isLoading && status && !status.isTwoFactorEnabled && !setupData && !isSettingUp) {
			startSetup();
		}
	}, [isLoading, status, setupData, isSettingUp, startSetup]);

	// Hide overlay if loading or if 2FA is already enabled
	if (isLoading || !status || status.isTwoFactorEnabled) {
		return null;
	}

	return (
		<Dialog open={true}>
			<DialogContent 
                className="sm:max-w-md [&>button]:hidden pointer-events-auto" 
                onInteractOutside={(e) => e.preventDefault()} 
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
				<DialogHeader>
					<div className="mx-auto bg-primary/10 p-3 rounded-full mb-2">
						<ShieldAlert className="w-8 h-8 text-primary" />
					</div>
					<DialogTitle className="text-center text-xl">Mandatory Security Setup</DialogTitle>
					<DialogDescription className="text-center">
						To protect your account and proceed with any transactions, you must enable Two-Factor Authentication (2FA).
					</DialogDescription>
				</DialogHeader>
				
				<div className="flex flex-col items-center space-y-4 py-4">
					{isSettingUp || !setupData ? (
						<div className="flex flex-col items-center space-y-2 py-8">
							<Loader2 className="w-8 h-8 animate-spin text-primary" />
							<p className="text-sm text-muted-foreground">Initializing secure setup...</p>
						</div>
					) : (
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
							<div className="w-full space-y-1">
								<p className="text-xs text-center text-muted-foreground font-medium">
									Can't scan? Enter this key manually:
								</p>
								<button
									type="button"
									onClick={() => {
										navigator.clipboard.writeText(setupData.secret);
										toast.success("Setup key copied!");
									}}
									className="w-full flex items-center justify-between gap-2 bg-muted hover:bg-muted/80 border border-border rounded-lg px-3 py-2 transition-colors group"
								>
									<span className="font-mono text-xs text-foreground tracking-widest break-all text-left">
										{setupData.secret}
									</span>
									<Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
								</button>
							</div>
							<div className="w-full space-y-2">
								<Input
									value={token}
									onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
									placeholder="Enter 6-digit code"
									className="text-center text-lg tracking-widest"
									maxLength={6}
								/>
								<Button
									onClick={() => verifySetup(token)}
									disabled={token.length !== 6 || isVerifying}
									className="w-full"
								>
									{isVerifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
									Verify & Enable
								</Button>
							</div>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
