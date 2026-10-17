"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Pre-configured avatars uploaded to Cloudinary account: aetmy2rh
export const PRESET_AVATARS = [
	"https://res.cloudinary.com/aetmy2rh/image/upload/v1792245151/np1.jpg",
	"https://res.cloudinary.com/aetmy2rh/image/upload/v1792245146/np2.jpg",
	"https://res.cloudinary.com/aetmy2rh/image/upload/v1792245146/np3.jpg",
	"https://res.cloudinary.com/aetmy2rh/image/upload/v1792245149/np4.jpg",
	"https://res.cloudinary.com/aetmy2rh/image/upload/v1792245153/np5.jpg",
	"https://res.cloudinary.com/aetmy2rh/image/upload/v1792245146/np6.jpg",
	"https://res.cloudinary.com/aetmy2rh/image/upload/v1792245152/np7.jpg",
	"https://res.cloudinary.com/aetmy2rh/image/upload/v1792245151/np8.jpg",
	"https://res.cloudinary.com/aetmy2rh/image/upload/v1792245149/np9.jpg",
	"https://res.cloudinary.com/aetmy2rh/image/upload/v1792245459/np10.png",
];

interface AvatarSelectModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentAvatar?: string | null;
	onSelectAvatar: (avatarUrl: string) => Promise<void>;
}

export function AvatarSelectModal({
	isOpen,
	onClose,
	currentAvatar,
	onSelectAvatar,
}: AvatarSelectModalProps) {
	const [selected, setSelected] = useState<string | null>(currentAvatar || null);
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		if (!selected) {
			toast.error("Please choose an avatar first");
			return;
		}
		try {
			setIsSaving(true);
			await onSelectAvatar(selected);
			onClose();
		} catch (error) {
			console.error("Save avatar error:", error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-lg p-6 bg-card border-border rounded-2xl sm:rounded-3xl shadow-2xl">
				<DialogHeader className="space-y-1">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
							<Sparkles className="w-4 h-4" />
						</div>
						<DialogTitle className="text-xl font-bold tracking-tight text-foreground">
							Choose Your Web3 Avatar
						</DialogTitle>
					</div>
					<DialogDescription className="text-sm text-muted-foreground">
						Select an avatar from our curated collection to represent your identity on Gidswap.
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-5 gap-3 py-4 max-h-[360px] overflow-y-auto custom-scrollbar">
					{PRESET_AVATARS.map((url, idx) => {
						const isSelected = selected === url;
						return (
							<button
								key={idx}
								type="button"
								onClick={() => setSelected(url)}
								className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 focus:outline-none ${
									isSelected
										? "border-primary ring-2 ring-primary/40 scale-105 shadow-lg"
										: "border-border/60 hover:border-primary/50 hover:scale-102"
								}`}
							>
								<img
									src={url}
									alt={`Avatar ${idx + 1}`}
									className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
								/>
								{isSelected && (
									<div className="absolute inset-0 bg-primary/25 backdrop-blur-[1px] flex items-center justify-center">
										<div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
											<Check className="w-3.5 h-3.5 stroke-[3]" />
										</div>
									</div>
								)}
							</button>
						);
					})}
				</div>

				<div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						disabled={isSaving}
						className="rounded-xl border-border"
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleSave}
						disabled={isSaving || !selected || selected === currentAvatar}
						className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
					>
						{isSaving ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Saving...
							</>
						) : (
							"Apply Avatar"
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
