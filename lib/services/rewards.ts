import { apiClient } from "../client";

export interface RewardTransaction {
	_id: string;
	type: "earned" | "withdrawn";
	points: number;
	description: string;
	transaction?: {
		_id: string;
		amount: number;
		currency: string;
		status: string;
		createdAt: string;
		orderId?: string;
	};
	withdrawalDetails?: {
		amountInNaira: number;
		status: "pending" | "completed" | "failed";
		processedAt?: string;
		accountDetails?: {
			bankName: string;
			accountNumber: string;
			accountName: string;
		};
	};
	createdAt: string;
}

export interface RewardsSummary {
	currentBalance: number;
	totalEarned: number;
	totalWithdrawn: number;
	minimumWithdrawal: number;
	conversionRate: string;
	canWithdraw: boolean;
	recentActivity: RewardTransaction[];
}

export interface WithdrawalRequest {
	points: number;
	accountDetails: {
		accountNumber: string;
		bankName: string;
		accountName: string;
	};
}

export const rewardsService = {
	getSummary: async (): Promise<RewardsSummary> => {
		const response = await apiClient.get("/rewards/summary");
		return response.data.data;
	},

	getHistory: async (page = 1, limit = 10) => {
		const response = await apiClient.get(
			`/rewards/history?page=${page}&limit=${limit}`,
		);
		return response.data.data; // { rewards, pagination }
	},

	withdraw: async (data: WithdrawalRequest) => {
		const response = await apiClient.post("/rewards/withdraw", data);
		return response.data;
	},

	getWithdrawals: async () => {
		const response = await apiClient.get("/rewards/withdrawals");
		return response.data.data; // { withdrawals }
	},
};
