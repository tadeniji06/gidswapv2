// Updated Dashboard Page with Lucide Icons + Improved UX
// (Place in your component file)

"use client";

import { useEffect, useState } from "react";
import {
	ArrowLeft,
	ArrowUpDown,
	Wallet,
	Banknote,
	Shuffle,
} from "lucide-react";
import { useSwapStore } from "@/lib/swap-store";

import { CryptoSwapFlow } from "@/_components/dashboard/services/crypto-swap-flow";
import CryptoFiatFlow from "@/_components/dashboard/services/crypto-fiat-flow";
import CexTransferFlow from "@/_components/dashboard/services/cex-transfer-flow";
import { FiatCryptoFlow } from "@/_components/dashboard/services/fiat-crypto-flow";

// SERVICE TYPE

type ServiceType =
	| "crypto-crypto"
	| "crypto-fiat"
	| "fiat-crypto"
	| "cex-transfer"
	// | "color"
	| null;

// SERVICE DEFINITIONS
const services = [
	{
		id: "crypto-crypto" as ServiceType,
		title: "Crypto to Crypto",
		description:
			"Swap between any cryptocurrencies instantly with real-time rates.",
		icon: ArrowUpDown,
		style: "hover:bg-gray-100 dark:hover:bg-gray-700",
	},
	{
		id: "crypto-fiat" as ServiceType,
		title: "Crypto to Cash",
		description:
			"Convert your crypto to cash seamlessly and withdraw to your bank.",
		icon: Banknote,
		style: "hover:bg-gray-100 dark:hover:bg-gray-700",
	},
	{
		id: "cex-transfer" as ServiceType,
		title: "Exchange Transfer",
		description:
			"Move funds between exchanges with a smooth, secure flow.",
		icon: Shuffle,
		style: "hover:bg-gray-100 dark:hover:bg-gray-700",
	},
];

export default function Dashboard() {
	const { fetchCurrencies } = useSwapStore();
	const [selectedService, setSelectedService] =
		useState<ServiceType>(null);

	useEffect(() => {
		fetchCurrencies();
	}, [fetchCurrencies]);

	// Render service flow UI
	const renderServiceFlow = () => {
		switch (selectedService) {
			case "crypto-crypto":
				return <CryptoSwapFlow />;
			case "crypto-fiat":
				return <CryptoFiatFlow />;
			case "fiat-crypto":
				return <FiatCryptoFlow />;
			case "cex-transfer":
				return <CexTransferFlow />;
			default:
				return null;
		}
	};

	// Render service selection page
	const renderServiceSelection = () => (
		<div className='w-full max-w-6xl mx-auto px-4'>
			{/* HEADER */}
			<div className='text-center mb-12'>
				<h1 className='text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3'>
					Flip, Swap & Send
				</h1>
				<p className='text-gray-600 dark:text-gray-400 text-lg'>
					Your entire crypto workflow — simplified.
				</p>
			</div>

			{/* SERVICES GRID */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				{services.map((service) => {
					const Icon = service.icon;

					return (
						<button
							key={service.id}
							onClick={() => setSelectedService(service.id)}
							className='group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.015] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500/30 p-8 text-left motion-safe:animate-fadeIn'
						>
							<div
								className={`absolute inset-0 bg-gradient-to-br opacity-[0.07] group-hover:opacity-10 transition-opacity duration-300`}
							/>

							<div className='relative flex items-start gap-4'>
								<div className='p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'>
									<Icon className='w-7 h-7' />
								</div>

								<div>
									<h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-1'>
										{service.title}
									</h3>
									<p className='text-gray-600 dark:text-gray-400 leading-relaxed'>
										{service.description}
									</p>
								</div>
							</div>

							<div className='mt-6 flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm'>
								Start now
								<ArrowLeft className='w-3 h-3 ml-1 rotate-180' />
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);

	return (
		<main className='flex-1 px-4 pb-10'>
			{selectedService ? (
				<div className='max-w-md mx-auto w-full'>
					{/* BACK BUTTON */}
					<button
						onClick={() => setSelectedService(null)}
						className='flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors'
					>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Home
					</button>

					{/* FLOW */}
					{renderServiceFlow()}
				</div>
			) : (
				renderServiceSelection()
			)}
		</main>
	);
}
