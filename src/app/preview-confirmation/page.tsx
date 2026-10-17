"use client";

import { useState, useRef } from "react";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { Check, X, MessageSquare, Send, FileDown, Share2 } from "lucide-react";
import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";

const PDFReceiptButton = dynamic(
	() =>
		import("@/_components/dashboard/receipt/PDFReceipt").then(
			(m) => m.PDFReceiptButton,
		),
	{ ssr: false },
);

export default function ConfirmationPreviewPage() {
	const [isOpen, setIsOpen] = useState(true);
	const [type, setType] = useState<"offramp" | "onramp">("offramp");
	const [isSharingImage, setIsSharingImage] = useState(false);
	const receiptCardRef = useRef<HTMLDivElement>(null);

	const sampleOfframp = {
		id: "ORD-94821",
		reference: "CFMVAXYWEOBPWU8832",
		amount: "3.00",
		token: "USDT",
		network: "Polygon",
		recipientAccount: "0123456789",
		recipientName: "Toluwani Adeniji",
		bankName: "Access Bank",
	};

	const sampleOnramp = {
		id: "ORD-11029",
		reference: "COD26599281734",
		amount: "2.19",
		token: "USDT",
		fiatAmount: "3015",
		network: "BNB Smart Chain",
	};

	const handleShareImage = async (platform: "whatsapp" | "telegram") => {
		if (!receiptCardRef.current) return;
		try {
			setIsSharingImage(true);
			const { toPng } = await import("html-to-image");
			const dataUrl = await toPng(receiptCardRef.current, {
				cacheBust: true,
				pixelRatio: 2,
				backgroundColor: "#070b14",
			});

			const blob = await (await fetch(dataUrl)).blob();
			const file = new File([blob], `gidswap-receipt.png`, { type: "image/png" });

			if (navigator.canShare && navigator.canShare({ files: [file] })) {
				await navigator.share({
					files: [file],
					title: "Gidswap Transaction Receipt",
					text: "Gidswap Transaction Receipt",
				});
				return;
			}

			// Download fallback
			const link = document.createElement("a");
			link.href = dataUrl;
			link.download = `gidswap-receipt.png`;
			link.click();

			if (platform === "whatsapp") {
				window.open("https://wa.me/?text=Gidswap%20Receipt%20Image%20downloaded%20to%20attach!", "_blank");
			} else {
				window.open("https://t.me/share/url?url=https://gidswap.com&text=Gidswap%20Receipt", "_blank");
			}
		} catch (e) {
			console.error(e);
		} finally {
			setIsSharingImage(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#07090e] p-6 flex flex-col items-center justify-center text-white">
			<div className="max-w-md w-full space-y-4 mb-6 text-center">
				<h1 className="text-2xl font-bold">Confirmation Modal Preview</h1>
				<p className="text-sm text-slate-400">
					Testing the updated minimalist blue &amp; white design.
				</p>
				<div className="flex justify-center gap-3">
					<Button
						variant={type === "offramp" ? "default" : "outline"}
						onClick={() => {
							setType("offramp");
							setIsOpen(true);
						}}
						className={type === "offramp" ? "bg-blue-600 text-white" : "border-slate-700 text-slate-300"}
					>
						Off-Ramp Modal
					</Button>
					<Button
						variant={type === "onramp" ? "default" : "outline"}
						onClick={() => {
							setType("onramp");
							setIsOpen(true);
						}}
						className={type === "onramp" ? "bg-blue-600 text-white" : "border-slate-700 text-slate-300"}
					>
						On-Ramp Modal
					</Button>
				</div>
			</div>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent
					showCloseButton={false}
					className="z-[100] w-[calc(100vw-1.5rem)] sm:max-w-md max-h-[92dvh] overflow-y-auto border border-blue-100 bg-white text-slate-900 p-0 shadow-2xl rounded-3xl"
				>
					<DialogTitle className="sr-only">
						Payment Confirmation
					</DialogTitle>
					<div className="relative overflow-hidden p-5 sm:p-7 space-y-5">
						{/* Top close/cancel button */}
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="absolute right-4 top-4 sm:right-5 sm:top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
							title="Close"
						>
							<X className="h-4 w-4" />
						</button>

						{/* Captured Receipt Card for Image Sharing */}
						<div ref={receiptCardRef} className="space-y-5 pt-1 pb-1 bg-white text-slate-900">
							{/* Minimalist Circular Check & Hero */}
							<div className="flex flex-col items-center text-center">
								<div className="mb-3 sm:mb-4 flex items-center justify-center text-blue-600">
									<Icon icon="f7:checkmark-seal-fill" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-sm" />
								</div>

								<h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
									{type === "offramp"
										? `${sampleOfframp.amount} ${sampleOfframp.token}`
										: `${sampleOnramp.amount} ${sampleOnramp.token}`}
								</h2>
								<p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
									Payment confirmed!
								</p>
							</div>

							{/* Clean Key-Value Card */}
							<div className="bg-slate-50/70 rounded-2xl border border-slate-200 divide-y divide-slate-100 p-1 text-xs sm:text-sm">
								<div className="flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5">
									<span className="text-slate-500 font-medium">Status</span>
									<span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
										Settled
									</span>
								</div>

								{type === "offramp" ? (
									<>
										<div className="flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5">
											<span className="text-slate-500 font-medium">Payout Amount</span>
											<span className="text-sm sm:text-base font-bold text-slate-950">
												₦4,095.00
											</span>
										</div>
										<div className="flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5">
											<span className="text-slate-500 font-medium">Recipient Account</span>
											<span className="font-semibold text-slate-900 truncate ml-2">
												{sampleOfframp.recipientAccount} ({sampleOfframp.bankName})
											</span>
										</div>
										<div className="flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5">
											<span className="text-slate-500 font-medium">Account Name</span>
											<span className="font-medium text-slate-800 truncate ml-2">
												{sampleOfframp.recipientName}
											</span>
										</div>
										<div className="flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5">
											<span className="text-slate-500 font-medium">Network</span>
											<span className="font-semibold text-slate-900">
												{sampleOfframp.network}
											</span>
										</div>
										<div className="flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5">
											<span className="text-slate-500 font-medium">Reference</span>
											<span className="font-mono text-[11px] sm:text-xs text-blue-600 font-medium truncate ml-2">
												{sampleOfframp.reference}
											</span>
										</div>
									</>
								) : (
									<>
										<div className="flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5">
											<span className="text-slate-500 font-medium">Amount Paid</span>
											<span className="font-semibold text-slate-900">
												₦{Number(sampleOnramp.fiatAmount).toLocaleString()}
											</span>
										</div>
										<div className="flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5">
											<span className="text-slate-500 font-medium">Crypto Delivered</span>
											<span className="font-semibold text-blue-600">
												{sampleOnramp.amount} {sampleOnramp.token}
											</span>
										</div>
										<div className="flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5">
											<span className="text-slate-500 font-medium">Reference</span>
											<span className="font-mono text-[11px] sm:text-xs text-blue-600 font-medium truncate ml-2">
												{sampleOnramp.reference}
											</span>
										</div>
									</>
								)}
							</div>

							{/* Minimalist Note Callout */}
							<div className="flex items-start gap-2.5 sm:gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 text-[11px] sm:text-xs text-slate-600 leading-relaxed">
								<div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
									i
								</div>
								<p>
									{type === "offramp"
										? "Payout has been settled to your bank account. Depending on interbank settlement speeds, funds reflect within moments."
										: "Crypto has been transferred directly to your destination wallet address. Blockchain confirmations typically finalize in moments."}
								</p>
							</div>
						</div>

						{/* Action Buttons: Minimalist Social Share (No wasted space) */}
						<div className="pt-1">
							<div className="grid grid-cols-2 gap-2 sm:gap-3">
								<button
									type="button"
									onClick={() => handleShareImage("whatsapp")}
									disabled={isSharingImage}
									className="flex items-center justify-center gap-2 py-3 px-3 sm:px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-60 cursor-pointer"
								>
									<Share2 className="w-4 h-4 shrink-0" />
									<span className="truncate">WhatsApp</span>
								</button>

								<button
									type="button"
									onClick={() => handleShareImage("telegram")}
									disabled={isSharingImage}
									className="flex items-center justify-center gap-2 py-3 px-3 sm:px-4 rounded-xl bg-blue-50 hover:bg-blue-100 active:scale-[0.98] text-blue-600 border border-blue-200 font-semibold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-60 cursor-pointer"
								>
									<Send className="w-4 h-4 shrink-0" />
									<span className="truncate">Telegram</span>
								</button>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
