"use client";

import { useEffect, useState } from "react";
import {
	ArrowLeft,
	ArrowRightLeft,
	ArrowDownToLine,
	ArrowUpFromLine,
	AlertTriangle,
	MessageSquare,
	AlertCircle
} from "lucide-react";
import { Icon } from "@iconify/react";
import { useSwapStore } from "@/lib/swap-store";
import { useUserStore } from "@/lib/user-store";
import { kycService } from "@/lib/services/kyc";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";

import { CryptoSwapFlow } from "@/_components/dashboard/services/crypto-swap-flow";
import CryptoFiatFlow from "@/_components/dashboard/services/crypto-fiat-flow";

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
			})
			.catch(() => {
				setKycStatus("unverified");
			});

		// Trigger avatar feature toast on login & check every 1 minute using cookies
		const checkAndShowAvatarToast = () => {
			const lastToastTime = Cookies.get("last_avatar_toast");
			const now = Date.now();
			const oneMinute = 60 * 1000;

			if (!lastToastTime || now - Number(lastToastTime) >= oneMinute) {
				toast("✨ Customize Your Profile Avatar!", {
					description: "Pick an avatar from your Account settings to stand out.",
					duration: 5000,
				});
				Cookies.set("last_avatar_toast", now.toString(), { expires: 7 });
			}
		};

		// Show immediately on login / page load
		checkAndShowAvatarToast();

		// Check every 1 minute
		const interval = setInterval(checkAndShowAvatarToast, 60 * 1000);
		return () => clearInterval(interval);
	}, [fetchCurrencies, fetchUser]);

	const renderServiceFlow = () => {
		switch (selectedService) {
			case "crypto-crypto": return <CryptoSwapFlow />;
			case "crypto-fiat": return <CryptoFiatFlow />;
			case "fiat-crypto": 
				return (
					<div className="w-full max-w-md mx-auto fintech-card p-6 sm:p-8 text-center space-y-5">
						<div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
							<AlertCircle className="w-7 h-7" />
						</div>
						<div className="space-y-2">
							<h3 className="text-xl font-bold text-foreground">
								Onramp Offers Unavailable
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Onramp offers are currently unavailable through the automated flow. You can process your onramp order directly with support via WhatsApp.
							</p>
						</div>

						<div className="pt-2">
							<a
								href="https://wa.me/2349038958941?text=Hello%20Gidswap,%20I%20would%20like%20to%20buy%20crypto%20(onramp)."
								target="_blank"
								rel="noopener noreferrer"
								className="w-full inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-5 rounded-xl transition-colors shadow-sm"
							>
								<MessageSquare className="w-5 h-5" />
								<span>Contact Support on WhatsApp</span>
							</a>
							<p className="text-xs text-muted-foreground mt-3">
								WhatsApp Number: <span className="font-mono text-foreground font-semibold">09038958941</span>
							</p>
						</div>
					</div>
				);
			default: return null;
		}
	};

	const renderServiceSelection = () => (
		<div className='w-full max-w-5xl mx-auto'>
      {/* Portfolio Overview */}
      <div className="mb-10 p-6 sm:p-8 fintech-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              gm, {user?.fullName?.split(" ")[0] || "Trader"} 👋
            </span>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground mt-3 flex items-center gap-2 font-medium">
            {slang}
          </p>
        </div>
        <div className="flex flex-col sm:items-end sm:flex opacity-25">
           {/* Decorative day/night watermark icon */}
           <Icon
             icon={isDayTime ? "emojione-monotone:sunrise" : "fluent-mdl2:clear-night"}
             className="w-24 h-24 text-foreground transition-all duration-500"
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
							onClick={() => setSelectedService(service.id)}
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
	);
}
