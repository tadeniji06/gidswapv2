import axios from "axios";
import Cookies from "js-cookie";

const API_URL =
	process.env.NEXT_PUBLIC_PROD_API ||
	"https://gidswap-server.onrender.com"; // Adjust fallback as needed

const getAuthHeaders = () => {
	const token = Cookies.get("token");
	return {
		Authorization: `Bearer ${token}`,
	};
};

export interface KycStatus {
	status: "unverified" | "pending" | "verified" | "failed";
	tier: number;
	method?: "bvn" | "nin";
	bvn?: string;
	nin?: string;
	firstName?: string;
	lastName?: string;
	failureReason?: string;
}

export const kycService = {
	// Get current KYC status
	getStatus: async (): Promise<KycStatus> => {
		const response = await axios.get(`${API_URL}/api/kyc/status`, {
			headers: getAuthHeaders(),
			withCredentials: true,
		});
		return response.data.kyc;
	},

	// Verify Selfie with ID (BVN or NIN)
	verifySelfie: async (data: {
		bvn?: string;
		nin?: string;
		selfieImage: string; // Base64
	}): Promise<any> => {
		const response = await axios.post(
			`${API_URL}/api/kyc/selfie/verify`,
			data,
			{
				headers: getAuthHeaders(),
				withCredentials: true,
			},
		);
		return response.data;
	},
};
