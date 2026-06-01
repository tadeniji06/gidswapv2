import { apiClient } from "../client";

export interface AffiliateStats {
	referralCode: string;
	totalReferrals: number;
	totalReferralVolume: number;
	referralRewardsBalance: number;
}

export const affiliateService = {
	getStats: async (): Promise<AffiliateStats> => {
		const response = await apiClient.get("/affiliate/stats");
		return response.data.data;
	},
};

