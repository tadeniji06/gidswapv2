"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/src/components/ui/button";

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

interface TokenTableProps {
  tokens: Token[];
  formatPrice: (price: number) => string;
}

export default function TokenTable({ tokens, formatPrice }: TokenTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // tokens per page

  const totalPages = Math.ceil(tokens.length / pageSize);

  const currentTokens = tokens.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const formatChange = (change?: number) => {
    if (change === undefined || change === null) return <span>-</span>;
    const isPositive = change > 0;
    return (
      <span
        className={`flex items-center justify-end gap-1 ${
          isPositive
            ? "text-green-500 dark:text-green-400"
            : "text-red-500 dark:text-red-400"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        {Math.abs(change).toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="text-gray-600 dark:text-gray-400 text-sm font-medium border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left p-4">#</th>
              <th className="text-left p-4">Token</th>
              <th className="text-right p-4">Price</th>
              <th className="text-right p-4">1H</th>
              <th className="text-right p-4">24H</th>
              <th className="text-right p-4">FDV</th>
            </tr>
          </thead>
          <tbody>
            {currentTokens.map((token, index) => (
              <tr
                key={token.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <td className="p-4 text-gray-500 dark:text-gray-400">
                  {(currentPage - 1) * pageSize + index + 1}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={token.image}
                      alt={token.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white truncate max-w-[80px] sm:max-w-none">
                        {token.symbol.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[100px] sm:max-w-none">
                        {token.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right font-medium text-gray-900 dark:text-white">
                  {formatPrice(token.current_price)}
                </td>
                <td className="p-4 text-right">
                  {formatChange(token.price_change_percentage_1h_in_currency)}
                </td>
                <td className="p-4 text-right">
                  {formatChange(token.price_change_percentage_24h)}
                </td>
                <td className="p-4 text-right text-gray-500 dark:text-gray-400">
                  {token.fully_diluted_valuation
                    ? formatPrice(token.fully_diluted_valuation)
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
