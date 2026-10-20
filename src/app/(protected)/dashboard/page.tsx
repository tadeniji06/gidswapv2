"use client";

import { type FormEvent, useEffect, useState } from "react";
import axios from "axios";
import {
	ArrowLeft,
	ArrowRightLeft,
	ArrowDownToLine,
	ArrowUpFromLine,
	AlertTriangle,
	CalendarDays,
	ShieldCheck,
} from "lucide-react";
import { Icon } from "@iconify/react";
import { useSwapStore } from "@/lib/swap-store";
import { useUserStore } from "@/lib/user-store";
import { kycService } from "@/lib/services/kyc";
import { useRouter } from "next/navigation";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/src/components/ui/dialog";
import { toast } from "sonner";

import { CryptoSwapFlow } from "@/_components/dashboard/services/crypto-swap-flow";
import CryptoFiatFlow from "@/_components/dashboard/services/crypto-fiat-flow";
import { FiatCryptoFlow } from "@/_components/dashboard/services/fiat-crypto-flow";

type ServiceType =
	| "crypto-crypto"
	| "crypto-fiat"
	| "fiat-crypto"
	| null;

const services = [
	{
		id: "fiat-crypto" as ServiceType,
		title: "Buy Crypto",
		description: "Purchase digital assets instantly using your Naira bank account.",
		icon: ArrowDownToLine,
		color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-500/10"
	},
	{
		id: "crypto-fiat" as ServiceType,
		title: "Sell Crypto",
		description: "Cash out your cryptocurrency directly to your local bank.",
		icon: ArrowUpFromLine,
		color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-500/10"
	},
	{
		id: "crypto-crypto" as ServiceType,
		title: "Swap Tokens",
		description: "Exchange between supported cryptocurrencies at the best rates.",
		icon: ArrowRightLeft,
		color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-500/10"
	},
];

const cryptoSlangs = [
  "gm, crypto paddy. Another day to make it.",
  "Few understand this.",
  "We're all gonna make it.",
  "Probably nothing.",
  "Still early, still building.",
  "Another day in the trenches.",
  "Down bad but still bullish.",
  "The bull run is coming.",
  "Trust me bro.",
  "When in doubt, zoom out.",
  "Buy high, sell low.",
  "The dip keeps dipping.",
  "Wagmi until proven otherwise.",
  "I bought the top again.",
  "Touch grass, check charts.",
  "Stay humble, stack sats.",
  "This time is different.",
  "One more trade and I'm done.",
  "We are so early.",
  "It's not a loss until you sell.",
  "Built different, chart dependent.",
  "Less noise, more execution.",
  "The trenches made us.",
  "Keep building, keep believing.",
  "Hype fades, products remain.",
  "Make moves, not excuses.",
  "No panic, just patience.",
  "Stack knowledge like sats.",
  "Real ones keep building.",
  "Fast swap. No wahala.",
];

export default function Dashboard() {
	const { fetchCurrencies } = useSwapStore();
	const { user, fetchUser } = useUserStore();
	const router = useRouter();
	const [selectedService, setSelectedService] = useState<ServiceType>(null);
	const [kycStatus, setKycStatus] = useState<string | null>(null);
	const [hasKycDateOfBirth, setHasKycDateOfBirth] = useState(false);
	const [isOnrampCheckLoading, setIsOnrampCheckLoading] = useState(false);
	const [isComplianceDialogOpen, setIsComplianceDialogOpen] = useState(false);
	const [dateOfBirth, setDateOfBirth] = useState("");
	const [confirmedDateOfBirth, setConfirmedDateOfBirth] = useState(false);
	const [isSavingDateOfBirth, setIsSavingDateOfBirth] = useState(false);
	const [slang, setSlang] = useState(cryptoSlangs[0]);
	const [isDayTime, setIsDayTime] = useState(true);

	useEffect(() => {
		const hour = new Date().getHours();
		// Daytime roughly 6:00 AM (6) to 6:00 PM (18)
		setIsDayTime(hour >= 6 && hour < 18);
		fetchCurrencies();
		fetchUser();
		setSlang(cryptoSlangs[Math.floor(Math.random() * cryptoSlangs.length)]);
		kycService
			.getStatus()
			.then((status) => {
				setKycStatus(status.status);
				setHasKycDateOfBirth(Boolean(status.hasDateOfBirth));
			})
			.catch(() => {
				setKycStatus("unverified");
			});

	}, [fetchCurrencies, fetchUser]);

	const handleServiceSelect = async (service: ServiceType) => {
		if (service !== "fiat-crypto") {
			setSelectedService(service);
			return;
		}

		setIsOnrampCheckLoading(true);
		try {
			const status = await kycService.getStatus();
			setKycStatus(status.status);
			const hasDateOfBirth = Boolean(status.hasDateOfBirth);
			setHasKycDateOfBirth(hasDateOfBirth);
			if (status.status === "verified" && hasDateOfBirth) {
				setSelectedService("fiat-crypto");
				return;
			}
			setIsComplianceDialogOpen(true);
		} catch {
			setKycStatus("unverified");
			setHasKycDateOfBirth(false);
			setIsComplianceDialogOpen(true);
		} finally {
			setIsOnrampCheckLoading(false);
		}
	};

	const handleSaveDateOfBirth = async (
		event: FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		if (!confirmedDateOfBirth) {
			toast.error("Confirm that your date of birth matches your identity document.");
			return;
		}

		setIsSavingDateOfBirth(true);
		try {
			await kycService.saveDateOfBirth(dateOfBirth, confirmedDateOfBirth);
			setHasKycDateOfBirth(true);
			setIsComplianceDialogOpen(false);
			setSelectedService("fiat-crypto");
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.message
				: undefined;
			toast.error(message || "Could not save your date of birth. Please try again.");
		} finally {
			setIsSavingDateOfBirth(false);
		}
	};

	const renderServiceFlow = () => {
		switch (selectedService) {
			case "crypto-crypto": return <CryptoSwapFlow />;
			case "crypto-fiat": return <CryptoFiatFlow />;
			case "fiat-crypto": return <FiatCryptoFlow />;
			default: return null;
		}
	};

	const renderServiceSelection = () => (
		<div className='w-full max-w-5xl mx-auto'>
      {/* Portfolio / User Greeting Card */}
      <div className="mb-6 sm:mb-10 p-4 sm:p-8 fintech-card grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-4 overflow-hidden relative">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[clamp(1.25rem,6vw,2.25rem)] md:text-5xl font-bold leading-tight tracking-tight text-foreground truncate">
              gm, {user?.fullName?.split(" ")[0] || "Trader"} 👋
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mt-1.5 sm:mt-2.5 font-medium line-clamp-2">
            {slang}
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-center opacity-30 dark:opacity-20">
           {/* Decorative day/night watermark icon */}
           <Icon
             icon={isDayTime ? "emojione-monotone:sunrise" : "fluent-mdl2:clear-night"}
             className="w-12 h-12 sm:w-20 sm:h-20 text-foreground transition-all duration-500"
           />
        </div>
      </div>

			{/* KYC ALERT */}
			{kycStatus === "unverified" && (
				<Alert className='mb-8 border-orange-200 bg-orange-50 dark:bg-orange-500/10 dark:border-orange-500/20 rounded-xl'>
					<AlertTriangle className='h-5 w-5 text-orange-600 dark:text-orange-400' />
					<div className='flex flex-col sm:flex-row sm:items-center justify-between w-full ml-2 gap-4'>
						<div>
							<AlertTitle className='text-orange-800 dark:text-orange-400 font-semibold text-base'>
								Identity Verification Required
							</AlertTitle>
							<AlertDescription className='text-orange-700 dark:text-orange-400/80 mt-1 text-sm'>
								Please complete KYC verification to unlock full trading capabilities.
							</AlertDescription>
						</div>
						<Button
							className='bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-5 shadow-none'
							onClick={() => router.push("/dashboard/account")}
						>
							Verify Identity
						</Button>
					</div>
				</Alert>
			)}

      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>

			{/* SERVICES GRID */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
				{services.map((service) => {
					const Icon = service.icon;
					return (
						<button
							key={service.id}
							onClick={() => handleServiceSelect(service.id)}
							disabled={service.id === "fiat-crypto" && isOnrampCheckLoading}
							className='group flex flex-col text-left p-6 fintech-card hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
						>
              <div className={`p-3 rounded-xl ${service.bgColor} w-fit mb-5 transition-transform group-hover:scale-105`}>
                <Icon className={`w-6 h-6 ${service.color}`} />
              </div>
              <h4 className='text-xl font-semibold text-foreground tracking-tight mb-2'>
                {service.title}
              </h4>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                {service.description}
              </p>
						</button>
					);
				})}
			</div>
		</div>
	);

	return (
		<>
			<Dialog
				open={isComplianceDialogOpen}
				onOpenChange={setIsComplianceDialogOpen}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<ShieldCheck className="h-5 w-5 text-primary" />
							Complete on-ramp requirements
						</DialogTitle>
						<DialogDescription>
							Paycrest requires verified identity details to create an on-ramp order.
						</DialogDescription>
					</DialogHeader>
					{kycStatus !== "verified" ? (
						<div className="space-y-4">
							<p className="text-sm text-muted-foreground">
								Complete identity verification before buying crypto with NGN.
							</p>
							<Button
								className="w-full"
								onClick={() => {
									setIsComplianceDialogOpen(false);
									router.push("/dashboard/account");
								}}
							>
								Complete KYC
							</Button>
						</div>
					) : !hasKycDateOfBirth ? (
						<form onSubmit={handleSaveDateOfBirth} className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="onramp-date-of-birth" className="text-sm font-medium">
									Date of birth
								</label>
								<Input
									id="onramp-date-of-birth"
									type="date"
									required
									value={dateOfBirth}
									onChange={(event) => setDateOfBirth(event.target.value)}
									disabled={isSavingDateOfBirth}
								/>
							</div>
							<label className="flex items-start gap-2 text-sm text-muted-foreground">
								<input
									type="checkbox"
									checked={confirmedDateOfBirth}
									onChange={(event) => setConfirmedDateOfBirth(event.target.checked)}
									disabled={isSavingDateOfBirth}
									className="mt-1"
								/>
								<span>
									I confirm this is my real date of birth and it matches my BVN/NIN record.
								</span>
							</label>
							<p className="text-xs text-muted-foreground">
								You must be at least 18. Paycrest may validate these details against your identity document. Contact support if a saved date needs correction.
							</p>
							<Button
								type="submit"
								className="w-full"
								disabled={isSavingDateOfBirth || !dateOfBirth || !confirmedDateOfBirth}
							>
								<CalendarDays className="mr-2 h-4 w-4" />
								{isSavingDateOfBirth ? "Saving..." : "Save and continue"}
							</Button>
						</form>
					) : null}
				</DialogContent>
			</Dialog>
			<main className='flex-1 px-4 sm:px-6 md:px-8 py-8 min-h-screen bg-background'>
				{selectedService ? (
					<div className='max-w-2xl mx-auto w-full flex flex-col items-center'>
					{/* BACK BUTTON */}
					<div className="w-full mb-6">
						<button
							onClick={() => setSelectedService(null)}
							className='flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-medium w-fit'
						>
							<ArrowLeft className='w-4 h-4 mr-2' />
							Back to Dashboard
						</button>
					</div>

					{/* FLOW Container */}
					<div className="w-full flex justify-center">
						{renderServiceFlow()}
					</div>
				</div>
				) : (
					renderServiceSelection()
				)}
			</main>
		</>
	);
}
