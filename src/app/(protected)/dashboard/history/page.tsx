"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface Transaction {
	_id: string;
	orderId: string;
	status: "settled" | "pending" | "failed";
	amount: number;
	createdAt: string;
}

interface ApiResponse {
	success: boolean;
	transactions: Transaction[];
}

const API_URL = process.env.NEXT_PUBLIC_PROD_API;

const fetchTransactions = async (
	token: string | undefined
): Promise<ApiResponse> => {
	const res = await fetch(`${API_URL}/api/transactions`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	if (!res.ok) throw new Error("Failed to fetch transactions");
	return res.json();
};

export default function TransactionHistoryPage() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const limit = 5;
	const authtoken = Cookies.get("token");

	const { data, isLoading, isError } = useQuery({
		queryKey: ["transactions"],
		queryFn: () => fetchTransactions(authtoken),
		staleTime: 1000 * 60 * 2, // 2 minutes cache
	});

	const transactions = data?.transactions ?? [];

	const filteredTransactions = useMemo(() => {
		return transactions.filter((tx) =>
			tx.orderId.toLowerCase().includes(search.toLowerCase())
		);
	}, [transactions, search]);

	const paginatedTransactions = useMemo(() => {
		const start = (page - 1) * limit;
		return filteredTransactions.slice(start, start + limit);
	}, [filteredTransactions, page, limit]);

	const totalPages = Math.ceil(filteredTransactions.length / limit);

	const handleCopy = (orderId: string) => {
		try {
			if (typeof navigator !== "undefined" && navigator.clipboard) {
				navigator.clipboard.writeText(orderId);
				toast.success("Order ID copied!");
			} else {
				const textarea = document.createElement("textarea");
				textarea.value = orderId;
				textarea.setAttribute("readonly", "");
				textarea.style.position = "absolute";
				textarea.style.left = "-9999px";
				document.body.appendChild(textarea);
				textarea.select();
				const successful = document.execCommand("copy");
				document.body.removeChild(textarea);

				if (successful) toast.success("Order ID copied!");
				else throw new Error("Fallback copy failed");
			}
		} catch (err) {
			console.error("Copy failed:", err);
			toast.error("Failed to copy Order ID");
		}
	};

	return (
		<div className='max-w-7xl mx-auto p-4'>
			<Card className='shadow-md'>
				<CardHeader>
					<CardTitle className='text-2xl font-bold'>
						Transactions
					</CardTitle>
				</CardHeader>
				<CardContent>
					{/* Search Bar */}
					<div className='flex items-center justify-between mb-4'>
						<Input
							placeholder='Search by Order ID...'
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(1);
							}}
							className='w-full transition-all duration-300 focus:ring-2 focus:ring-indigo-500 border border-gray-300 dark:border-gray-600'
						/>
					</div>

					{/* Table & Mobile Cards */}
					<div className='rounded-lg border border-gray-200 dark:border-gray-700'>
						{/* Desktop Table */}
						<table className='w-full text-sm text-left border-collapse hidden sm:table'>
							<thead className='bg-gray-50 dark:bg-gray-800 sticky top-0'>
								<tr>
									<th className='px-6 py-3 text-gray-700 dark:text-gray-200 font-medium uppercase tracking-wider'>
										Order ID
									</th>
									<th className='px-6 py-3 text-gray-700 dark:text-gray-200 font-medium uppercase tracking-wider'>
										Amount
									</th>
									<th className='px-6 py-3 text-gray-700 dark:text-gray-200 font-medium uppercase tracking-wider'>
										Status
									</th>
									<th className='px-6 py-3 text-gray-700 dark:text-gray-200 font-medium uppercase tracking-wider'>
										Date & Time
									</th>
								</tr>
							</thead>
							<tbody>
								<AnimatePresence>
									{isLoading && (
										<motion.tr
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
										>
											<td colSpan={4} className='text-center py-6'>
												Loading...
											</td>
										</motion.tr>
									)}

									{isError && (
										<motion.tr
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
										>
											<td
												colSpan={4}
												className='text-center py-6 text-red-500'
											>
												Failed to load transactions
											</td>
										</motion.tr>
									)}

									{!isLoading &&
										paginatedTransactions.length === 0 && (
											<motion.tr
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
											>
												<td
													colSpan={4}
													className='text-center py-6 text-gray-500'
												>
													No transactions found
												</td>
											</motion.tr>
										)}

									{!isLoading &&
										paginatedTransactions.map((tx, idx) => {
											const formattedDate = new Date(
												tx.createdAt
											).toLocaleString();
											const rowBg =
												idx % 2 === 0
													? "bg-white dark:bg-gray-900"
													: "bg-gray-50 dark:bg-gray-800";

											return (
												<motion.tr
													key={tx._id}
													className={cn(
														rowBg,
														"border-b hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
													)}
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -10 }}
													layout
												>
													<td className='px-6 py-3 flex items-center gap-2 font-mono'>
														<span>{tx.orderId.slice(0, 6)}...</span>
														<Copy
															size={16}
															className='cursor-pointer text-gray-400 hover:text-indigo-600 transition-colors'
															onClick={() => handleCopy(tx.orderId)}
														/>
													</td>
													<td className='px-6 py-3 font-medium'>
														${tx.amount.toFixed(2)}
													</td>
													<td className='px-6 py-3'>
														<Badge
															className={cn(
																"font-semibold px-2 py-1 text-xs rounded-md transition-colors duration-200",
																tx.status === "settled" &&
																	"bg-green-100 text-green-700 border border-green-300",
																tx.status === "pending" &&
																	"bg-yellow-100 text-yellow-700 border border-yellow-300",
																tx.status === "failed" &&
																	"bg-red-100 text-red-700 border border-red-300"
															)}
														>
															{tx.status.charAt(0).toUpperCase() +
																tx.status.slice(1)}
														</Badge>
													</td>
													<td className='px-6 py-3'>
														{formattedDate}
													</td>
												</motion.tr>
											);
										})}
								</AnimatePresence>
							</tbody>
						</table>

						{/* Mobile Cards */}
						<div className='flex flex-col sm:hidden'>
							{paginatedTransactions.map((tx) => (
								<div
									key={tx._id}
									className='border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 rounded-lg mb-2 shadow-sm'
								>
									<div className='flex justify-between items-center mb-2'>
										<span className='font-mono text-sm'>
											{tx.orderId}
										</span>
										<Copy
											size={16}
											className='cursor-pointer text-gray-400 hover:text-indigo-600 transition-colors'
											onClick={() => handleCopy(tx.orderId)}
										/>
									</div>
									<div className='flex justify-between items-center mb-1'>
										<span className='text-gray-500 text-xs'>
											Amount:
										</span>
										<span className='font-medium'>
											${tx.amount.toFixed(2)}
										</span>
									</div>
									<div className='flex justify-between items-center mb-1'>
										<span className='text-gray-500 text-xs'>
											Status:
										</span>
										<Badge
											className={cn(
												"font-semibold px-2 py-1 text-xs rounded-md transition-colors duration-200",
												tx.status === "settled" &&
													"bg-green-100 text-green-700 border border-green-300",
												tx.status === "pending" &&
													"bg-yellow-100 text-yellow-700 border border-yellow-300",
												tx.status === "failed" &&
													"bg-red-100 text-red-700 border border-red-300"
											)}
										>
											{tx.status.charAt(0).toUpperCase() +
												tx.status.slice(1)}
										</Badge>
									</div>
									<div className='flex justify-between items-center'>
										<span className='text-gray-500 text-xs'>
											Date:
										</span>
										<span className='text-sm'>
											{new Date(tx.createdAt).toLocaleString()}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Pagination */}
					<div className='flex justify-between items-center mt-6'>
						<Button
							onClick={() => setPage((p) => Math.max(p - 1, 1))}
							disabled={page === 1}
							className='bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
						>
							Previous
						</Button>
						<Button
							onClick={() =>
								setPage((p) => Math.min(p + 1, totalPages))
							}
							disabled={page === totalPages || totalPages === 0}
							className='bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
						>
							Next
						</Button>
					</div>

					{/* Results count */}
					<div className='text-sm text-gray-500 mt-2'>
						Showing {(page - 1) * limit + 1}–
						{Math.min(page * limit, filteredTransactions.length)} of{" "}
						{filteredTransactions.length} results
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
