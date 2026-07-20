"use client";

import { useState } from "react";
import { ResponsiveModal } from "@/_components/popups/responsive-modal";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";

interface TfaVerificationModalProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	onVerify: (token: string) => Promise<void>;
	isVerifying: boolean;
	title?: string;
	description?: string;
}

export function TfaVerificationModal({
	isOpen,
	setIsOpen,
	onVerify,
	isVerifying,
	title = "2FA Verification Required",
	description = "Please enter the 6-digit code from your authenticator app to proceed.",
}: TfaVerificationModalProps) {
	const [token, setToken] = useState("");

	const handleVerify = async () => {
		if (token.length !== 6) return;
		try {
			await onVerify(token);
			// Only clear if successful, so user can retry if it fails
			setToken("");
		} catch (err) {
			// error handling should be done by parent
		}
	};

	return (
		<ResponsiveModal
			isOpen={isOpen}
			setIsOpen={(open) => {
				if (!open) setToken("");
				setIsOpen(open);
			}}
			title={title}
			className="max-w-md"
		>
			<div className="flex flex-col space-y-6 pt-4 pb-2 px-1">
				<div className="flex flex-col items-center justify-center space-y-2 text-center">
					<div className="bg-primary/10 p-3 rounded-full mb-2">
						<ShieldCheck className="w-8 h-8 text-primary" />
					</div>
					<p className="text-sm text-muted-foreground px-4">
						{description}
					</p>
				</div>
				
				<div className="space-y-4">
					<Input
						value={token}
						onChange={(e) => setToken(e.target.value)}
						placeholder="Enter 6-digit code"
						className="text-center tracking-[0.5em] text-lg font-mono py-6"
						maxLength={6}
						autoFocus
					/>
					
					<div className="flex gap-3 pt-2">
						<Button
							variant="outline"
							className="flex-1"
							onClick={() => setIsOpen(false)}
							disabled={isVerifying}
						>
							Cancel
						</Button>
						<Button
							className="flex-1 bg-primary"
							onClick={handleVerify}
							disabled={token.length !== 6 || isVerifying}
						>
							{isVerifying ? (
								<Loader2 className="w-4 h-4 animate-spin mr-2" />
							) : null}
							Verify
						</Button>
					</div>
				</div>
			</div>
		</ResponsiveModal>
	);
}
