import { create } from "zustand";
import axios from "axios";
import Cookies from "js-cookie";

export interface OnrampState {
  // Input fields
  fromCurrency: string;
  fromNetwork: string;
  fromAmount: string;
  toStable: string;
  
  // Bank details
  walletAddress: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;

  // Rate/Quote
  isFetchingRate: boolean;
  rateData: any | null; // Data from /api/onramp/rate

  // Session state
  sessionId: string | null;
  status: string | null; // e.g. ff_awaiting, ff_converting, ff_done, pc_awaiting, completed
  sessionData: any | null; // Complete status response
  isInitiating: boolean;

  setField: (field: string, value: any) => void;
  fetchRate: () => Promise<void>;
  initiateOnramp: () => Promise<boolean>;
  pollStatus: () => Promise<void>;
  continueToFiat: () => Promise<boolean>;
  reset: () => void;
}

export const useOnrampStore = create<OnrampState>((set, get) => ({
  fromCurrency: "ETH",
  fromNetwork: "ETH",
  fromAmount: "",
  toStable: "USDTBSC",
  
  walletAddress: "",
  bankCode: "",
  accountNumber: "",
  accountName: "",

  isFetchingRate: false,
  rateData: null,

  sessionId: null,
  status: null,
  sessionData: null,
  isInitiating: false,

  setField: (field, value) => {
    set((state) => ({ ...state, [field]: value }));
  },

  fetchRate: async () => {
    const { fromCurrency, fromAmount, toStable } = get();
    if (!fromCurrency || !fromAmount || parseFloat(fromAmount) <= 0) return;

    set({ isFetchingRate: true });
    try {
      const api_url = process.env.NEXT_PUBLIC_PROD_API || "";
      // Public route
      const res = await axios.get(
        `${api_url}/api/onramp/rate?fromCurrency=${fromCurrency}&fromAmount=${fromAmount}&toStable=${toStable}`
      );
      if (res.data.success) {
        set({ rateData: res.data.data });
      } else {
        set({ rateData: null });
      }
    } catch (err) {
      console.error("Fetch rate error:", err);
      set({ rateData: null });
    } finally {
      set({ isFetchingRate: false });
    }
  },

  initiateOnramp: async () => {
    const { fromCurrency, fromNetwork, toStable, fromAmount, walletAddress, bankCode, accountNumber, accountName } = get();
    set({ isInitiating: true });
    try {
      const token = Cookies.get("token");
      const api_url = process.env.NEXT_PUBLIC_PROD_API || "";
      const res = await axios.post(
        `${api_url}/api/onramp/initiate`,
        {
          fromCurrency,
          fromNetwork,
          fromAmount: parseFloat(fromAmount),
          toStable,
          payoutDetails: {
            walletAddress,
            bankCode,
            accountNumber,
            accountName,
            currency: "NGN",
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success && res.data.data?.sessionId) {
        set({ 
          sessionId: res.data.data.sessionId,
          status: res.data.data.status,
          sessionData: res.data.data
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Initiate error:", err);
      return false;
    } finally {
      set({ isInitiating: false });
    }
  },

  pollStatus: async () => {
    const { sessionId } = get();
    if (!sessionId) return;
    
    try {
      const token = Cookies.get("token");
      const api_url = process.env.NEXT_PUBLIC_PROD_API || "";
      const res = await axios.get(`${api_url}/api/onramp/status/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success && res.data.data) {
        set({
          status: res.data.data.status,
          sessionData: res.data.data
        });
      }
    } catch (err) {
      console.error("Poll status error:", err);
    }
  },

  continueToFiat: async () => {
    const { sessionId } = get();
    if (!sessionId) return false;

    try {
      const token = Cookies.get("token");
      const api_url = process.env.NEXT_PUBLIC_PROD_API || "";
      const res = await axios.post(
        `${api_url}/api/onramp/continue-to-fiat`,
        { sessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        // Will be picked up by the next poll
        get().pollStatus();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Continue to fiat error:", err);
      return false;
    }
  },

  reset: () => {
    set({
      fromAmount: "",
      rateData: null,
      sessionId: null,
      status: null,
      sessionData: null,
      isInitiating: false
    });
  }
}));
