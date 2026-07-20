import axios from "axios";
import Cookies from "js-cookie";

export interface TfaStatus {
	isTwoFactorEnabled: boolean;
}

export interface TfaSetupResponse {
	secret: string;
	qrCodeUrl: string;
}

const apiUrl = () => process.env.NEXT_PUBLIC_PROD_API || "";
const authHeaders = () => ({
	Authorization: `Bearer ${Cookies.get("token")}`,
	"Content-Type": "application/json",
});

export const tfaService = {
	getStatus: async (): Promise<TfaStatus> => {
		const response = await axios.get(`${apiUrl()}/api/auth/2fa/status`, { headers: authHeaders() });
		return response.data;
	},

	setup: async (): Promise<TfaSetupResponse> => {
		const response = await axios.post(`${apiUrl()}/api/auth/2fa/setup`, {}, { headers: authHeaders() });
		return response.data;
	},

	verify: async (token: string): Promise<void> => {
		await axios.post(`${apiUrl()}/api/auth/2fa/verify`, { token }, { headers: authHeaders() });
	},

	disable: async (token: string): Promise<void> => {
		await axios.post(`${apiUrl()}/api/auth/2fa/disable`, { token }, { headers: authHeaders() });
	},
};
