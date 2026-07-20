import { api } from "../api";

export interface TfaStatus {
	isTwoFactorEnabled: boolean;
}

export interface TfaSetupResponse {
	secret: string;
	qrCodeUrl: string;
}

export const tfaService = {
	getStatus: async (): Promise<TfaStatus> => {
		const response = await api.get("/auth/2fa/status");
		return response.data;
	},

	setup: async (): Promise<TfaSetupResponse> => {
		const response = await api.post("/auth/2fa/setup");
		return response.data;
	},

	verify: async (token: string): Promise<void> => {
		await api.post("/auth/2fa/verify", { token });
	},

	disable: async (token: string): Promise<void> => {
		await api.post("/auth/2fa/disable", { token });
	},
};
