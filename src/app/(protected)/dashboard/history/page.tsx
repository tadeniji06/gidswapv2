"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { cn } from "@/lib/utils"
import Cookies from "js-cookie"
import { toast } from "sonner"
import { Copy } from "lucide-react"

// Types
interface Transaction {
  _id: string
  orderId: string
  status: "settled" | "pending" | "failed"
  amount: number
  createdAt: string
}

interface ApiResponse {
  success: boolean
  transactions: Transaction[]
}

const API_URL = process.env.NEXT_PUBLIC_PROD_API

const fetchTransactions = async (token: any): Promise<ApiResponse> => {
  const res = await fetch(`${API_URL}/api/transactions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error("Failed to fetch transactions")
  return res.json()
}

export default function TransactionHistoryPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const limit = 5
  const authtoken = Cookies.get("token")

  const { data, isLoading, isError } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => fetchTransactions(authtoken),
  })

  const transactions = data?.transactions ?? []

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) =>
      tx.orderId.toLowerCase().includes(search.toLowerCase())
    )
  }, [transactions, search])

  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * limit
    const end = start + limit
    return filteredTransactions.slice(start, end)
  }, [filteredTransactions, page, limit])

  const totalPages = Math.ceil(filteredTransactions.length / limit)

  const handleCopy = (orderId: string) => {
    navigator.clipboard.writeText(orderId)
    toast.success("Order ID copied!")
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card className="dark:bg-transparent dark:border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex items-center justify-between mb-4">
            <Input
              placeholder="Search by Order ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2">Order ID</th>
                  <th className="px-4 py-2">Amount (token)</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-red-500">
                      Failed to load data
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  paginatedTransactions.map((tx) => {
                    const formattedDate = new Date(tx.createdAt).toLocaleString()
                    return (
                      <tr key={tx._id} className="border-b">
                        {/* Order ID with copy icon */}
                        <td className="px-4 py-2 flex items-center gap-2">
                          <span>{tx.orderId.slice(0, 4)}...</span>
                          <Copy
                            size={14}
                            className="cursor-pointer text-gray-500 hover:text-blue-600"
                            onClick={() => handleCopy(tx.orderId)}
                          />
                        </td>

                        <td className="px-4 py-2">{tx.amount.toFixed(2)}</td>

                        {/* Status with distinct colors */}
                        <td className="px-4 py-2">
                          <Badge
                            className={cn(
                              "font-semibold px-2 py-1 text-xs rounded-md",
                              tx.status === "settled" &&
                                "bg-green-100 text-green-700 border border-green-300",
                              tx.status === "pending" &&
                                "bg-yellow-100 text-yellow-700 border border-yellow-300",
                              tx.status === "failed" &&
                                "bg-red-100 text-red-700 border border-red-300"
                            )}
                          >
                            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                          </Badge>
                        </td>

                        {/* Date and time */}
                        <td className="px-4 py-2">{formattedDate}</td>
                      </tr>
                    )
                  })}
                {!isLoading && paginatedTransactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={page === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-500 mt-2">
            Showing {(page - 1) * limit + 1}–
            {Math.min(page * limit, filteredTransactions.length)} of{" "}
            {filteredTransactions.length} results
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
