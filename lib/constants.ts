import { Currency } from "./types";
import { ArrowUpDown, BarChart3, History, Home } from "lucide-react";



export const currencies: Currency[] = [
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    logo: "/images/bitcoin.png",
    type: "crypto",
    coingeckoId: "bitcoin",
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    logo: "/images/ethereum.png",
    type: "crypto",
    coingeckoId: "ethereum", 
  },
  {
    id: "usdt",
    name: "Tether",
    symbol: "USDT",
    logo: "/images/usdt.png",
    type: "crypto",
    coingeckoId: "tether", 
  },
  {
    id: "usd",
    name: "US Dollar",
    symbol: "USD",
    logo: "/images/usdt.png",
    type: "fiat",
    coingeckoId: "usd",
  },
  {
    id: "eur",
    name: "Euro",
    symbol: "EUR",
    logo: "/logos/eur.svg",
    type: "fiat",
    coingeckoId: "eur", 
  },
  {
  id: "ngn",
  name: "Nigerian Naira",
  symbol: "NGN",
  logo: "/logos/ngn.svg", 
  type: "fiat",
  coingeckoId: "ngn",
}
];


export const useCaseNoExp = [
  {
    icon: "/images/transfer-stable-coin.svg",
    text: "Transfer stablecoins to cash in any bank account",
  },
  {
    icon: "/images/turn-defi-to-cash.svg",
    text: "Turn your DEFI yields into cash easily",
  },
  {
    icon: "/images/escape-p2p.svg",
    text: "Escape P2P and liquidate your cash in no time",
  },
  {
    icon: "/images/no-issue-dex.svg",
    text: "No issues of losses or security concerns like DEXes",
  },
];

export const useWeb3Dengen = [];

export // FAQ data
const faqs = [
  {
    question: "What is Gidswap?",
    answer:
      "Gidswap is a decentralized platform that allows you to convert stablecoins to local currency quickly and securely.",
  },
  {
    question: "Who is Gidswap for?",
    answer:
      "Gidswap is for anyone who needs to convert stablecoins to local currency, including traders, businesses, and individual users.",
  },
  {
    question: "How does Gidswap work?",
    answer:
      "Gidswap connects users with liquidity providers through smart contracts to facilitate fast and secure currency exchanges.",
  },
  {
  question: "How does Stablecoin refunds work?",
  answer: "For example, if you create an order at 1,500 and the rate suddenly drops to 1,480, the transaction may fall outside the allowed slippage of the provider. In that case, instead of completing the trade at the unfavorable rate, the system issues a stablecoin refund to you."
}

];

export const navLinks = [
  {
    name: "Swap",
    icon: ArrowUpDown,
    href: "/dashboard/",
  },
  {
    name: "Account",
    icon: Home,
    href: "/dashboard/account",
  },
  {
    name: "History",
    icon: History,
    href: "/dashboard/history",
  },
  {
    name: "Markets",
    icon: BarChart3,
    href: "/dashboard/markets",
  },
];
// Mock data
export const portfolioValue = 12847.32;
export const portfolioChange = 5.67;
export const recentTransactions = [
  {
    id: 1,
    type: "buy",
    amount: "0.5 BTC",
    value: "$22,500",
    status: "completed",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "sell",
    amount: "100 USDC",
    value: "$100",
    status: "pending",
    time: "5 hours ago",
  },
  {
    id: 3,
    type: "swap",
    amount: "2 ETH → 5000 USDC",
    value: "$5,000",
    status: "completed",
    time: "1 day ago",
  },
];

export const cryptoHoldings = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    amount: "0.5",
    value: "$22,500",
    change: "+2.5%",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    amount: "3.2",
    value: "$8,960",
    change: "-1.2%",
  },
  {
    name: "USDC",
    symbol: "USDC",
    amount: "1,500",
    value: "$1,500",
    change: "0%",
  },
];
