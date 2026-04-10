import { create } from "zustand";
import axios from "axios";
import Cookies from "js-cookie";
import { Token, FiatCurrency, Quote } from "./crypto-fiat-store";

// We can reuse the Token and FiatCurrency interfaces from crypto-fiat-store

export interface OnrampPaymentOrder {
	id: string;
	reference: string;
	amount: string;
	token: string;
	network: string;
	status: string;
	isCompleted: boolean;
	validUntil: string;
	providerAccount?: {
		institution: string;
		accountIdentifier: string;
		accountName: string;
		amountToTransfer: string;
		currency: string;
		validUntil: string;
	};
}

export interface FiatCryptoState {
	// Step 1: Amounts and Currency/Token Selection
	fiatAmount: string;
	tokenAmount: string;
	selectedToken: Token | null;
	selectedCurrency: FiatCurrency | null;
	
	// Step 2: Destination Crypto Wallet
	destinationAddress: string;

	// Quote and Available Lists
	tokens: Token[];
	currencies: FiatCurrency[];
	quote: Quote | null;
	quoteError: string | null;
	
	// App State Flags
	isLoadingTokens: boolean;
	isLoadingCurrencies: boolean;
	isLoadingQuote: boolean;
	isInitializingOrder: boolean;

	// Transaction Result
	paymentOrder: OnrampPaymentOrder | null;

	// Actions
	setFiatAmount: (amount: string) => void;
	setDestinationAddress: (address: string) => void;
	setSelectedToken: (token: Token) => void;
	setSelectedCurrency: (currency: FiatCurrency) => void;
	
	fetchTokens: () => Promise<void>;
	fetchCurrencies: () => Promise<void>;
	fetchQuote: (network: string, tokenSymbol: string, amount: string, fiatCode: string) => Promise<void>;
	
	initializeOrder: (refundBankData: any) => Promise<boolean>;
	pollPaymentStatus: (orderId: string) => Promise<boolean>;
	resetService: () => void;
}

export const useFiatCryptoStore = create<FiatCryptoState>((set, get) => ({
	fiatAmount: "",
	tokenAmount: "",
	selectedToken: null,
	selectedCurrency: null,
	destinationAddress: "",

	tokens: [],
	currencies: [],
	quote: null,
	quoteError: null,

	isLoadingTokens: false,
	isLoadingCurrencies: false,
	isLoadingQuote: false,
	isInitializingOrder: false,

	paymentOrder: null,

	setFiatAmount: (amount) => {
		set({ fiatAmount: amount });
		const { selectedToken, selectedCurrency } = get();
		if (selectedToken && selectedCurrency && amount && Number.parseFloat(amount) > 0) {
			// Debounce manually or just trigger quote fetch
			get().fetchQuote(
				selectedToken.network,
				selectedToken.symbol,
				amount,
				selectedCurrency.code
			);
		} else {
			set({ quote: null, tokenAmount: "" });
		}
	},

	setDestinationAddress: (address) => set({ destinationAddress: address }),

	setSelectedToken: (token) => {
		set({ selectedToken: token });
		const { selectedCurrency, fiatAmount } = get();
		if (token && selectedCurrency && fiatAmount) {
			get().fetchQuote(
				token.network,
				token.symbol,
				fiatAmount,
				selectedCurrency.code
			);
		}
	},

	setSelectedCurrency: (currency) => {
		set({ selectedCurrency: currency });
		const { selectedToken, fiatAmount } = get();
		if (selectedToken && currency && fiatAmount) {
			get().fetchQuote(
				selectedToken.network,
				selectedToken.symbol,
				fiatAmount,
				currency.code
			);
		}
	},

	fetchTokens: async () => {
		set({ isLoadingTokens: true });
		try {
			const authToken = Cookies.get("token");
			const api_url = process.env.NEXT_PUBLIC_PROD_API || "";
			const response = await axios.get(
				`${api_url}/api/payCrest/trade/getSupportedTokens`,
				{ headers: { Authorization: `Bearer ${authToken}` } }
			);

			const filteredTokens = response.data.data.filter((token: any) =>
				["USDT", "USDC", "USDS", "PYUSD"].includes(token.symbol.toUpperCase())
			);

			const tokensWithLogos = filteredTokens.map((token: any) => ({
				symbol: token.symbol,
				contractAddress: token.contractAddress,
				decimals: token.decimals,
				baseCurrency: token.baseCurrency,
				network: token.network,
				logo: `https://api.elbstream.com/logos/crypto/${token.symbol.toLowerCase()}`,
			}));

			set({ tokens: tokensWithLogos });
		} catch (error) {
			console.error("Failed to fetch tokens:", error);
		} finally {
			set({ isLoadingTokens: false });
		}
	},

	fetchCurrencies: async () => {
		set({ isLoadingCurrencies: true });
		try {
			const authToken = Cookies.get("token");
			const api_url = process.env.NEXT_PUBLIC_PROD_API || "";
			const response = await axios.get(
				`${api_url}/api/payCrest/trade/getSupportedCies`,
				{ headers: { Authorization: `Bearer ${authToken}` } }
			);

			const currenciesData = response.data.data || [];
			const currencies = currenciesData
				.filter((currency: any) => currency.code === "NGN")
				.map((currency: any) => ({
					name: currency.name,
					code: currency.code,
					symbol: currency.symbol,
					shortName: currency.shortName,
					decimals: currency.decimals,
					marketRate: Number.parseFloat(currency.marketRate),
				}));

			set({ currencies });
		} catch (error) {
			console.error("Failed to fetch currencies:", error);
		} finally {
			set({ isLoadingCurrencies: false });
		}
	},

	fetchQuote: async (network: string, tokenSymbol: string, amount: string, fiatCode: string) => {
		if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
			set({ quoteError: null });
			return;
		}
		
		set({ isLoadingQuote: true, quoteError: null });
		try {
			const authToken = Cookies.get("token");
			const api_url = process.env.NEXT_PUBLIC_PROD_API || "";
			// Use the v2 rates endpoint to specify network
			const safeNetwork = network.toLowerCase().replace(/\s+/g, '-');
			
			// We query the rate for exactly 1 Crypto (USDC/USDT) to get the base exchange rate
			// This prevents hitting 'no provider' issues for large total fiat amounts in the rates path
			const url = `${api_url}/api/payCrest/trade/tokenRates/${safeNetwork}/${tokenSymbol}/1/${fiatCode}?side=buy`;
			
			const response = await axios.get(url, {
				headers: { Authorization: `Bearer ${authToken}` },
			});

			// Onramp => user buys crypto with fiat. Use buy rate.
			// The response struct might have `data.buy.rate` or `data.rate` depending on whether it mapped it directly
			const payload = response.data.data;
			
			let rate = 0;
			let totalTokenEstimate = 0;

			// If payload has buy, use buy
			if (payload && payload.buy) {
				rate = Number.parseFloat(payload.buy.rate);
				totalTokenEstimate = Number.parseFloat(amount) / rate;
			} else if (payload && payload.rate) {
				rate = Number.parseFloat(payload.rate);
				totalTokenEstimate = Number.parseFloat(amount) / rate;
			}

			if (rate > 0) {
				const quoteData = {
					rate,
					total: totalTokenEstimate,
					tokenSymbol,
					currencyCode: fiatCode,
				};
				set({ quote: quoteData, tokenAmount: totalTokenEstimate.toFixed(6), quoteError: null });
			} else {
				set({ quote: null, tokenAmount: "", quoteError: "Could not calculate valid rate" });
			}
		} catch (error: any) {
			console.error("Failed to fetch quote:", error);
			// Display the actual error message from PayCrest if available
			const errorMessage = error.response?.data?.message || error.message || "Failed to fetch rate. Please try another pair or amount.";
			set({ quote: null, tokenAmount: "", quoteError: errorMessage });
		} finally {
			set({ isLoadingQuote: false });
		}
	},

	initializeOrder: async (bankData: any) => {
		const { selectedToken, selectedCurrency, fiatAmount, destinationAddress } = get();
		
		if (!selectedToken || !selectedCurrency || !fiatAmount || !destinationAddress || !bankData) {
			console.error("Missing required data for Onramp order initialization");
			return false;
		}
		
		set({ isInitializingOrder: true });
		try {
			const reference = `GS-OR-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
			
			const payload = {
				amount: fiatAmount,
				amountIn: "fiat",
				source: {
					type: "fiat",
					currency: selectedCurrency.code,
					refundAccount: {
						institution: bankData.bankCode || bankData.institution,
						accountIdentifier: bankData.accountNumber || bankData.accountIdentifier,
						accountName: bankData.accountName
					}
				},
				destination: {
					type: "crypto",
					currency: selectedToken.symbol,
					recipient: {
						address: destinationAddress,
						network: selectedToken.network.toLowerCase().replace(/\s+/g, '-')
					}
				},
				reference
			};

			const authToken = Cookies.get("token");
			const api_url = process.env.NEXT_PUBLIC_PROD_API || "";
			
			const response = await axios.post(
				`${api_url}/api/payCrest/trade/init-onramp`,
				payload,
				{ headers: { Authorization: `Bearer ${authToken}` } }
			);

			if (response.data.success) {
				const txn = response.data.transaction;
				set({ 
					paymentOrder: {
						id: txn.orderId || txn.id,
						reference: txn.reference,
						amount: txn.amount || fiatAmount,
						token: txn.currency || selectedToken.symbol,
						network: txn.network || selectedToken.network,
						status: txn.status || "pending",
						validUntil: txn.validUntil,
						isCompleted: false,
						fiatAmount: fiatAmount, // Store the original NGN amount paid
						providerAccount: txn.paycrestData?.providerAccount || response.data.paycrestResponse?.providerAccount
					} 
				});
				return true;
			}

			return false;
		} catch (error) {
			console.error("Initialize onramp error:", error);
			return false;
		} finally {
			set({ isInitializingOrder: false });
		}
	},

	pollPaymentStatus: async (orderId: string) => {
		if (!orderId) return true;
		
		try {
			const authToken = Cookies.get("token");
			const api_url = process.env.NEXT_PUBLIC_PROD_API || "";
			const response = await axios.get(
				`${api_url}/api/payCrest/trade/status/${orderId}`,
				{ headers: { Authorization: `Bearer ${authToken}` } }
			);

			if (response.data) {
				set({ paymentOrder: response.data });
				return response.data.isCompleted;
			}
			return false;
		} catch (error) {
			console.error("Poll status error:", error);
			return false;
		}
	},

	resetService: () => {
		set({
			fiatAmount: "",
			tokenAmount: "",
			destinationAddress: "",
			quote: null,
			quoteError: null,
			paymentOrder: null,
		});
	},
}));
