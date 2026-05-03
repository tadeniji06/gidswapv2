import { apiClient } from "../client";

export interface OnboardingPayload {
	bankName: string;
	bankCode: string;
	accountNumber: string;
	accountName: string;
	returnAddress?: string;
}

export const userService = {
	getProfile: async () => {
		const response = await apiClient.get("/user/profile");
		return response.data;
	},
	completeOnboarding: async (data: OnboardingPayload) => {
		const response = await apiClient.post("/user/onboarding", data);
		return response.data;
	},
	verifyBankAccount: async (account_number: string, bank_code: string) => {
		const response = await apiClient.post("/payCrest/trade/verifyAccount", {
			AccountIdentifier: account_number,
			Institution: bank_code,
		});
		return response.data;
	},
};
