"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Search,
	BarChart3,
	TrendingUp,
	TrendingDown,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

interface Token {
	id: string;
	name: string;
	symbol: string;
	image: string;
	current_price: number;
	price_change_percentage_1h_in_currency?: number;
	price_change_percentage_24h?: number;
	fully_diluted_valuation?: number;
}

export default function MarketsPage() {
	const [activeCurrency, setActiveCurrency] = useState<"USD" | "NGN">(
		"USD"
	);
	const [searchQuery, setSearchQuery] = useState("");

	const { data: tokens = [], isLoading } = useQuery<Token[]>({
		queryKey: ["markets", activeCurrency],
		queryFn: async () => {
			const res = await fetch(
				`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${activeCurrency.toLowerCase()}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h,24h`
			);
			return res.json();
		},
		refetchInterval: 120000, // refresh every 2 min
	});

	const filteredTokens = tokens.filter((token) =>
		`${token.name} ${token.symbol}`
			.toLowerCase()
			.includes(searchQuery.toLowerCase())
	);

	const formatPrice = (price: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: activeCurrency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 6,
		}).format(price);

	const formatPercentage = (value?: number) => {
		if (value === undefined || value === null) return "N/A";
		const formatted = Math.abs(value).toFixed(2);
		return `${value >= 0 ? "+" : "-"}${formatted}%`;
	};

	return (
		<main className='p-4 md:p-6 w-full pb-10 max-w-6xl mx-auto'>
			{/* Header */}
			<div className='mb-6'>
				<h1 className='text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6'>
					Markets
				</h1>

				{/* Filters + Search */}
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
					{/* Currency Selector */}
					<div className='flex gap-2 flex-wrap'>
						{["USD", "NGN"].map((currency) => (
							<Button
								key={currency}
								onClick={() =>
									setActiveCurrency(currency as "USD" | "NGN")
								}
								aria-pressed={activeCurrency === currency}
								className={`text-sm px-4 py-2 rounded-full transition-colors ${
									activeCurrency === currency
										? "bg-white text-black hover:bg-gray-200 dark:bg-gray-700 dark:text-white"
										: "bg-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
								}`}
							>
								{currency}
							</Button>
						))}
					</div>

					{/* Search */}
					<div className='relative w-full sm:w-64'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
						<Input
							placeholder='Search tokens...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg w-full'
						/>
					</div>
				</div>
			</div>

			{/* Content */}
			{!isLoading && filteredTokens.length > 0 ? (
				<>
					{/* Mobile View - Simplified */}
					<div className='block md:hidden space-y-3'>
						{filteredTokens.map((token) => {
							const change1h =
								token.price_change_percentage_1h_in_currency || 0;
							const isPositive = change1h >= 0;

							return (
								<div
									key={token.id}
									className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm'
								>
									<div className='flex items-center justify-between'>
										{/* Token Info */}
										<div className='flex items-center gap-3 flex-1 min-w-0'>
											<img
												src={token.image}
												alt={token.name}
												className='w-10 h-10 rounded-full'
											/>
											<div className='flex-1 min-w-0'>
												<h3 className='font-semibold text-gray-900 dark:text-white truncate'>
													{token.name}
												</h3>
												<p className='text-sm text-gray-500 dark:text-gray-400 uppercase'>
													{token.symbol}
												</p>
											</div>
										</div>

										{/* Price & 1h Change */}
										<div className='text-right ml-3'>
											<p className='font-semibold text-gray-900 dark:text-white whitespace-nowrap'>
												{formatPrice(token.current_price)}
											</p>
											<div className='flex items-center justify-end gap-1 mt-1'>
												{isPositive ? (
													<TrendingUp className='w-3 h-3 text-green-500' />
												) : (
													<TrendingDown className='w-3 h-3 text-red-500' />
												)}
												<span
													className={`text-sm font-medium ${
														isPositive
															? "text-green-500"
															: "text-red-500"
													}`}
												>
													{formatPercentage(change1h)}
												</span>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>

					{/* Desktop View - Full Table */}
					<div className='hidden md:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden'>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead className='bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'>
									<tr>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
											Token
										</th>
										<th className='px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
											Price
										</th>
										<th className='px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
											1h %
										</th>
										<th className='px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
											24h %
										</th>
										<th className='px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
											Market Cap
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
									{filteredTokens.map((token) => {
										const change1h =
											token.price_change_percentage_1h_in_currency ||
											0;
										const change24h =
											token.price_change_percentage_24h || 0;
										const isPositive1h = change1h >= 0;
										const isPositive24h = change24h >= 0;

										return (
											<tr
												key={token.id}
												className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
											>
												<td className='px-6 py-4 whitespace-nowrap'>
													<div className='flex items-center gap-3'>
														<img
															src={token.image}
															alt={token.name}
															className='w-8 h-8 rounded-full'
														/>
														<div>
															<div className='font-medium text-gray-900 dark:text-white'>
																{token.name}
															</div>
															<div className='text-sm text-gray-500 dark:text-gray-400 uppercase'>
																{token.symbol}
															</div>
														</div>
													</div>
												</td>
												<td className='px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900 dark:text-white'>
													{formatPrice(token.current_price)}
												</td>
												<td className='px-6 py-4 whitespace-nowrap text-right'>
													<div className='flex items-center justify-end gap-1'>
														{isPositive1h ? (
															<TrendingUp className='w-4 h-4 text-green-500' />
														) : (
															<TrendingDown className='w-4 h-4 text-red-500' />
														)}
														<span
															className={`font-medium ${
																isPositive1h
																	? "text-green-500"
																	: "text-red-500"
															}`}
														>
															{formatPercentage(change1h)}
														</span>
													</div>
												</td>
												<td className='px-6 py-4 whitespace-nowrap text-right'>
													<span
														className={`font-medium ${
															isPositive24h
																? "text-green-500"
																: "text-red-500"
														}`}
													>
														{formatPercentage(change24h)}
													</span>
												</td>
												<td className='px-6 py-4 whitespace-nowrap text-right text-gray-900 dark:text-white'>
													{token.fully_diluted_valuation
														? formatPrice(
																token.fully_diluted_valuation
														  )
														: "N/A"}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
				</>
			) : (
				<div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center shadow-sm'>
					<div className='w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4'>
						<BarChart3 className='w-8 h-8 text-gray-400 dark:text-gray-500' />
					</div>
					<h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
						{searchQuery
							? `No tokens match "${searchQuery}"`
							: "No tokens found"}
					</h3>
					<p className='text-gray-500 dark:text-gray-400 mb-6'>
						{searchQuery
							? "Try a different token name or symbol"
							: "Market data is currently unavailable"}
					</p>
				</div>
			)}
		</main>
	);
}
