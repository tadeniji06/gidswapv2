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
		<div className='max-w-7xl mx-auto p-4 md:p-8'>
			<Card className='shadow-sm border-border bg-card'>
				<CardHeader className="pb-4">
					<CardTitle className='text-2xl font-bold text-foreground'>
						Transactions
					</CardTitle>
				</CardHeader>
				<CardContent>
					{/* Search Bar */}
					<div className='flex items-center justify-between mb-6'>
						<Input
							placeholder='Search by Order ID...'
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(1);
							}}
							className='w-full max-w-md transition-colors focus:ring-1 focus:ring-primary border-input bg-background text-foreground placeholder:text-muted-foreground'
						/>
					</div>

					{/* Table & Mobile Cards */}
					<div className='rounded-xl border border-border overflow-hidden'>
						{/* Desktop Table */}
						<table className='w-full text-sm text-left border-collapse hidden sm:table'>
							<thead className='bg-muted/50 text-muted-foreground sticky top-0 border-b border-border'>
								<tr>
									<th className='px-6 py-4 font-semibold uppercase tracking-wider text-xs'>
										Order ID
									</th>
									<th className='px-6 py-4 font-semibold uppercase tracking-wider text-xs'>
										Amount
									</th>
									<th className='px-6 py-4 font-semibold uppercase tracking-wider text-xs'>
										Status
									</th>
									<th className='px-6 py-4 font-semibold uppercase tracking-wider text-xs'>
										Date & Time
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								<AnimatePresence>
									{isLoading && (
										<motion.tr
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
										>
											<td colSpan={4} className='text-center py-8 text-muted-foreground'>
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
												className='text-center py-8 text-destructive font-medium'
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
													className='text-center py-12 text-muted-foreground'
												>
													No transactions found
												</td>
											</motion.tr>
										)}

									{!isLoading &&
										paginatedTransactions.map((tx) => {
											const formattedDate = new Date(
												tx.createdAt
											).toLocaleString();

											return (
												<motion.tr
													key={tx._id}
													className="bg-card hover:bg-muted/30 transition-colors"
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -10 }}
													layout
												>
													<td className='px-6 py-4 flex items-center gap-2 font-mono text-foreground'>
														<span>{tx.orderId.slice(0, 8)}...</span>
														<Copy
															size={16}
															className='cursor-pointer text-muted-foreground hover:text-primary transition-colors'
															onClick={() => handleCopy(tx.orderId)}
														/>
													</td>
													<td className='px-6 py-4 font-semibold text-foreground'>
														${tx.amount.toFixed(2)}
													</td>
													<td className='px-6 py-4'>
														<Badge
															className={cn(
																"font-semibold px-2.5 py-1 text-xs rounded-md shadow-none",
																tx.status === "settled" &&
																	"bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 border",
																tx.status === "pending" &&
																	"bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 border",
																tx.status === "failed" &&
																	"bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 border"
															)}
														>
															{tx.status.charAt(0).toUpperCase() +
																tx.status.slice(1)}
														</Badge>
													</td>
													<td className='px-6 py-4 text-muted-foreground'>
														{formattedDate}
													</td>
												</motion.tr>
											);
										})}
								</AnimatePresence>
							</tbody>
						</table>

						{/* Mobile Cards */}
						<div className='flex flex-col sm:hidden divide-y divide-border bg-card'>
							{paginatedTransactions.map((tx) => (
								<div
									key={tx._id}
									className='p-4 hover:bg-muted/30 transition-colors'
								>
									<div className='flex justify-between items-center mb-3'>
										<span className='font-mono text-sm text-foreground'>
											{tx.orderId.slice(0, 10)}...
										</span>
										<Copy
											size={16}
											className='cursor-pointer text-muted-foreground hover:text-primary transition-colors'
											onClick={() => handleCopy(tx.orderId)}
										/>
									</div>
									<div className='flex justify-between items-center mb-2'>
										<span className='text-muted-foreground text-xs font-medium uppercase tracking-wider'>
											Amount:
										</span>
										<span className='font-semibold text-foreground'>
											${tx.amount.toFixed(2)}
										</span>
									</div>
									<div className='flex justify-between items-center mb-2'>
										<span className='text-muted-foreground text-xs font-medium uppercase tracking-wider'>
											Status:
										</span>
										<Badge
											className={cn(
												"font-semibold px-2 py-0.5 text-xs rounded-md shadow-none",
												tx.status === "settled" &&
													"bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 border",
												tx.status === "pending" &&
													"bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 border",
												tx.status === "failed" &&
													"bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 border"
											)}
										>
											{tx.status.charAt(0).toUpperCase() +
												tx.status.slice(1)}
										</Badge>
									</div>
									<div className='flex justify-between items-center'>
										<span className='text-muted-foreground text-xs font-medium uppercase tracking-wider'>
											Date:
										</span>
										<span className='text-sm text-muted-foreground'>
											{new Date(tx.createdAt).toLocaleDateString()}
										</span>
									</div>
								</div>
							))}
							{paginatedTransactions.length === 0 && !isLoading && !isError && (
								<div className="p-8 text-center text-muted-foreground">
									No transactions found
								</div>
							)}
						</div>
					</div>

					{/* Pagination */}
					<div className='flex flex-col sm:flex-row justify-between items-center gap-4 mt-6'>
						<div className='text-sm text-muted-foreground font-medium'>
							Showing {(page - 1) * limit + 1}–
							{Math.min(page * limit, filteredTransactions.length)} of{" "}
							{filteredTransactions.length} results
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								onClick={() => setPage((p) => Math.max(p - 1, 1))}
								disabled={page === 1}
								className='transition-colors'
							>
								Previous
							</Button>
							<Button
								variant="outline"
								onClick={() =>
									setPage((p) => Math.min(p + 1, totalPages))
								}
								disabled={page === totalPages || totalPages === 0}
								className='transition-colors'
							>
								Next
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
