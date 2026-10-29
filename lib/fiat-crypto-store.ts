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
	fiatAmount?: string;
	txHash?: string;
	failureReason?: string | null;
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
	initializationError: string | null;

	// Transaction Result
	paymentOrder: OnrampPaymentOrder | null;

	// Actions
	setFiatAmount: (amount: string) => void;
	setTokenAmount: (amount: string) => void;
	setDestinationAddress: (address: string) => void;
	setSelectedToken: (token: Token | null) => void;
	setSelectedCurrency: (currency: FiatCurrency | null) => void;
	
	fetchTokens: () => Promise<void>;
	fetchCurrencies: () => Promise<void>;
	fetchQuote: (network: string, tokenSymbol: string, amount: string, fiatCode: string) => Promise<void>;
	fetchQuoteFromCrypto: (network: string, tokenSymbol: string, cryptoAmount: string, fiatCode: string) => Promise<void>;
	
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
	initializationError: null,

	paymentOrder: null,

	setFiatAmount: (amount) => {
		set({ fiatAmount: amount });
		const { selectedToken, selectedCurrency } = get();
		if (selectedToken && selectedCurrency && amount && Number.parseFloat(amount) > 0) {
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

	setTokenAmount: (cryptoAmount) => {
		set({ tokenAmount: cryptoAmount });
		const { selectedToken, selectedCurrency } = get();
		if (selectedToken && selectedCurrency && cryptoAmount && Number.parseFloat(cryptoAmount) > 0) {
			get().fetchQuoteFromCrypto(
				selectedToken.network,
				selectedToken.symbol,
				cryptoAmount,
				selectedCurrency.code
			);
		} else {
			set({ quote: null, fiatAmount: "" });
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

			const tokensData = response.data.data || [];

			// Allowed symbol + network pairs: USDC active first, USDT disabled
			const allowedTokens = [
				{ symbol: "USDC", network: "bnb-smart-chain", disabled: false },
				{ symbol: "USDC", network: "polygon", disabled: false },
				{ symbol: "USDC", network: "base", disabled: false },
				{ symbol: "USDC", network: "ethereum", disabled: false },
				{ symbol: "USDT", network: "bnb-smart-chain", disabled: true, disabledReason: "USDT is temporarily unavailable on on-ramp" },
				{ symbol: "USDT", network: "polygon", disabled: true, disabledReason: "USDT is temporarily unavailable on on-ramp" },
				{ symbol: "USDT", network: "arbitrum-one", disabled: true, disabledReason: "USDT is temporarily unavailable on on-ramp" },
				{ symbol: "USDT", network: "ethereum", disabled: true, disabledReason: "USDT is temporarily unavailable on on-ramp" },
				{ symbol: "USDT", network: "base", disabled: true, disabledReason: "USDT is temporarily unavailable on on-ramp" },
			];

			// Filter only allowed tokens
			const filteredTokens = tokensData.filter((token: any) =>
				allowedTokens.some(
					(allowed) =>
						token.symbol.toUpperCase() === allowed.symbol &&
						token.network.toLowerCase() ===
							allowed.network.toLowerCase(),
				),
			);

			// Sort according to allowedTokens order
			const sortedTokens = allowedTokens
				.map((allowed) => {
					const found = filteredTokens.find(
						(token: { symbol: string; network: string }) =>
							token.symbol.toUpperCase() === allowed.symbol &&
							token.network.toLowerCase() ===
								allowed.network.toLowerCase(),
					);
					if (!found) return null;
					return {
						...found,
						disabled: allowed.disabled,
						disabledReason: allowed.disabledReason,
					};
				})
				.filter(Boolean);

			const tokensWithLogos = sortedTokens.map((token: any) => ({
				symbol: token.symbol,
				contractAddress: token.contractAddress,
				decimals: token.decimals,
				baseCurrency: token.baseCurrency,
				network: token.network,
				disabled: Boolean(token.disabled),
				disabledReason: token.disabledReason || undefined,
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
			const safeNetwork = network.toLowerCase().replace(/\s+/g, '-');
			
			const selectedCurrency = get().currencies.find(c => c.code === fiatCode);
			const marketRate = selectedCurrency?.marketRate || 1500;
			const estimatedCryptoValue = Number(amount) / marketRate;
			
			const quoteAmount = Math.max(1, Math.round(estimatedCryptoValue * 100) / 100);

			const axiosConfig = {
				headers: { Authorization: `Bearer ${authToken}` },
				validateStatus: (status: number) => status < 500 // Prevent throwing on 404
			};

			let response;
			// level 1: Matched amount + Buy side
			const url = `${api_url}/api/payCrest/trade/tokenRates/${safeNetwork}/${tokenSymbol}/${quoteAmount}/${fiatCode}?side=buy`;
			response = await axios.get(url, axiosConfig);

			if (response.status === 404 || !response.data?.data) {
				// Level 2: Unit amount ($1) + Buy side
				console.warn(`No provider for matched amount ${quoteAmount}. Retrying with unit rate...`);
				const unitUrl = `${api_url}/api/payCrest/trade/tokenRates/${safeNetwork}/${tokenSymbol}/1/${fiatCode}?side=buy`;
				response = await axios.get(unitUrl, axiosConfig);

				if (response.status === 404 || !response.data?.data) {
					// Level 3: Unit amount ($1) WITHOUT Side
					console.warn(`No provider for unit rate with side=buy. Retrying without side filter...`);
					const simpleUrl = `${api_url}/api/payCrest/trade/tokenRates/${safeNetwork}/${tokenSymbol}/1/${fiatCode}`;
					response = await axios.get(simpleUrl, axiosConfig);
				}
			}

			if (response.status === 404 || !response.data?.data) {
				throw new Error(response.data?.message || "No liquidity provider found for this pair.");
			}

			const payload = response.data.data;
			let rate = 0;
			
			if (payload && payload.buy) {
				rate = Number.parseFloat(payload.buy.rate);
			} else if (payload && payload.sell && !payload.buy) {
				rate = Number.parseFloat(payload.sell.rate);
			} else if (payload && payload.rate) {
				rate = Number.parseFloat(payload.rate);
			}

			if (rate > 0) {
				const totalTokenEstimate = Number.parseFloat(amount) / rate;
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
			const errorMessage = error.response?.data?.message || error.message || "Failed to fetch rate. Please try another pair or amount.";
			set({ quote: null, tokenAmount: "", quoteError: errorMessage });
		} finally {
			set({ isLoadingQuote: false });
		}
	},

	fetchQuoteFromCrypto: async (network: string, tokenSymbol: string, cryptoAmount: string, fiatCode: string) => {
		if (!cryptoAmount || isNaN(Number(cryptoAmount)) || Number(cryptoAmount) <= 0) {
			set({ quoteError: null });
			return;
		}

		set({ isLoadingQuote: true, quoteError: null });
		try {
			const authToken = Cookies.get("token");
			const api_url = process.env.NEXT_PUBLIC_PROD_API || "";
			const safeNetwork = network.toLowerCase().replace(/\s+/g, '-');
			const quoteAmount = Math.max(1, Math.round(Number(cryptoAmount) * 100) / 100);

			const axiosConfig = {
				headers: { Authorization: `Bearer ${authToken}` },
				validateStatus: (status: number) => status < 500
			};

			let response;
			// Level 1: Matched crypto amount + Buy side
			const url = `${api_url}/api/payCrest/trade/tokenRates/${safeNetwork}/${tokenSymbol}/${quoteAmount}/${fiatCode}?side=buy`;
			response = await axios.get(url, axiosConfig);

			if (response.status === 404 || !response.data?.data) {
				// Level 2: Unit amount ($1) + Buy side
				const unitUrl = `${api_url}/api/payCrest/trade/tokenRates/${safeNetwork}/${tokenSymbol}/1/${fiatCode}?side=buy`;
				response = await axios.get(unitUrl, axiosConfig);

				if (response.status === 404 || !response.data?.data) {
					// Level 3: Unit amount ($1) WITHOUT Side
					const simpleUrl = `${api_url}/api/payCrest/trade/tokenRates/${safeNetwork}/${tokenSymbol}/1/${fiatCode}`;
					response = await axios.get(simpleUrl, axiosConfig);
				}
			}

			if (response.status === 404 || !response.data?.data) {
				throw new Error(response.data?.message || "No liquidity provider found for this pair.");
			}

			const payload = response.data.data;
			let rate = 0;

			if (payload && payload.buy) {
				rate = Number.parseFloat(payload.buy.rate);
			} else if (payload && payload.sell && !payload.buy) {
				rate = Number.parseFloat(payload.sell.rate);
			} else if (payload && payload.rate) {
				rate = Number.parseFloat(payload.rate);
			}

			if (rate > 0) {
				const calculatedFiat = Number.parseFloat(cryptoAmount) * rate;
				const quoteData = {
					rate,
					total: Number.parseFloat(cryptoAmount),
					tokenSymbol,
					currencyCode: fiatCode,
				};
				set({ quote: quoteData, fiatAmount: calculatedFiat.toFixed(2), quoteError: null });
			} else {
				set({ quote: null, fiatAmount: "", quoteError: "Could not calculate valid rate" });
			}
		} catch (error: any) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to fetch rate. Please try another pair or amount.";
			set({ quote: null, fiatAmount: "", quoteError: errorMessage });
		} finally {
			set({ isLoadingQuote: false });
		}
	},

	initializeOrder: async (bankData: any) => {
		const { selectedToken, selectedCurrency, fiatAmount, destinationAddress } = get();
		
		if (!selectedToken || !selectedCurrency || !fiatAmount || !destinationAddress || !bankData) {
			set({ initializationError: "Complete the order details before continuing." });
			return false;
		}
		
		set({ isInitializingOrder: true, initializationError: null });
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
				reference,
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
						network: (txn.network || selectedToken.network) as string,
						status: (txn.status || "pending") as string,
						validUntil: (txn.validUntil || "") as string,
						isCompleted: false,
						fiatAmount: fiatAmount, // Store the original NGN amount paid
						providerAccount:
							txn.paycrestData?.providerAccount ||
							response.data.paycrestResponse?.data?.providerAccount
					} 
				});
				return true;
			}

			set({
				initializationError:
					response.data.message || "Could not initialize the on-ramp order.",
			});
			return false;
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.message
				: error instanceof Error
					? error.message
					: undefined;
			set({
				initializationError:
					message || "Could not initialize the on-ramp order. Please try again.",
			});
			console.error("Initialize onramp error:", message || error);
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
				`${api_url}/api/payCrest/trade/status/${orderId}?_=${Date.now()}`,
				{
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Cache-Control": "no-cache",
					},
				},
			);

			const resData = response.data;
			const data = resData.data || resData;
			if (typeof data.status !== "string") return false;
			const currentOrder = get().paymentOrder;
			if (!currentOrder) return false;

			const updatedOrder: OnrampPaymentOrder = {
				...currentOrder,
				status: data.status,
				txHash: data.txHash || data.transactionHash,
				failureReason: data.failureReason || currentOrder.failureReason,
				isCompleted:
					Boolean(data.isCompleted) ||
					["settled", "fulfilled", "validated"].includes(data.status),
				providerAccount: data.providerAccount || currentOrder?.providerAccount,
			};

			set({ paymentOrder: updatedOrder });
			return updatedOrder.isCompleted;
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
			initializationError: null,
		});
	},
}));
