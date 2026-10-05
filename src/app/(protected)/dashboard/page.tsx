"use client";

import { useEffect, useState } from "react";
import {
	ArrowLeft,
	ArrowRightLeft,
	ArrowDownToLine,
	ArrowUpFromLine,
	AlertTriangle,
  Wallet
} from "lucide-react";
import { useSwapStore } from "@/lib/swap-store";
import { kycService } from "@/lib/services/kyc";
import { useRouter } from "next/navigation";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";

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

export default function Dashboard() {
	const { fetchCurrencies } = useSwapStore();
	const router = useRouter();
	const [selectedService, setSelectedService] = useState<ServiceType>(null);
	const [kycStatus, setKycStatus] = useState<string | null>(null);

	useEffect(() => {
		fetchCurrencies();
		kycService
			.getStatus()
			.then((status) => {
				setKycStatus(status.status);
			})
			.catch(() => {
				setKycStatus("unverified");
			});
	}, [fetchCurrencies]);

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
      {/* Portfolio Overview */}
      <div className="mb-10 p-6 sm:p-8 fintech-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Balance</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">$0.00</span>
            <span className="text-lg text-muted-foreground font-medium">USD</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
            <Wallet className="w-4 h-4" /> 0.00 BTC • 0.00 ETH • 0.00 USDT
          </p>
        </div>
        <div className="flex flex-col sm:items-end">
           <span className="text-sm font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full mb-2">
            +0.00% Today
           </span>
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
