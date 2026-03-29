import { create } from "zustand";
import axios from "axios";
import Cookies from "js-cookie";

export interface SavedAccount {
  _id: string;
  label: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  returnAddress: string | null;
  isDefault: boolean;
  createdAt: string;
}

interface SavedAccountsState {
  accounts: SavedAccount[];
  defaultAccount: SavedAccount | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchAccounts: () => Promise<void>;
  fetchDefault: () => Promise<void>;
  saveAccount: (data: {
    label?: string;
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    returnAddress?: string;
    isDefault?: boolean;
  }) => Promise<SavedAccount | null>;
  updateAccount: (
    id: string,
    data: Partial<{ label: string; returnAddress: string; isDefault: boolean }>
  ) => Promise<boolean>;
  deleteAccount: (id: string) => Promise<boolean>;
  setDefault: (id: string) => Promise<boolean>;
}

const apiUrl = () => process.env.NEXT_PUBLIC_PROD_API || "";
const authHeaders = () => ({
  Authorization: `Bearer ${Cookies.get("token")}`,
  "Content-Type": "application/json",
});

export const useSavedAccountsStore = create<SavedAccountsState>((set, get) => ({
  accounts: [],
  defaultAccount: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(`${apiUrl()}/api/saved-accounts`, {
        headers: authHeaders(),
      });
      const accounts: SavedAccount[] = res.data?.data || [];
      const defaultAccount = accounts.find((a) => a.isDefault) || accounts[0] || null;
      set({ accounts, defaultAccount });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDefault: async () => {
    try {
      const res = await axios.get(`${apiUrl()}/api/saved-accounts/default`, {
        headers: authHeaders(),
      });
      set({ defaultAccount: res.data?.data || null });
    } catch {
      // silently fail
    }
  },

  saveAccount: async (data) => {
    set({ isSaving: true, error: null });
    try {
      const res = await axios.post(`${apiUrl()}/api/saved-accounts`, data, {
        headers: authHeaders(),
      });
      const newAccount: SavedAccount = res.data?.data;
      // Refresh the list
      await get().fetchAccounts();
      return newAccount;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      set({ error: msg });
      return null;
    } finally {
      set({ isSaving: false });
    }
  },

  updateAccount: async (id, data) => {
    try {
      await axios.patch(`${apiUrl()}/api/saved-accounts/${id}`, data, {
        headers: authHeaders(),
      });
      await get().fetchAccounts();
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message });
      return false;
    }
  },

  deleteAccount: async (id) => {
    try {
      await axios.delete(`${apiUrl()}/api/saved-accounts/${id}`, {
        headers: authHeaders(),
      });
      set((state) => ({
        accounts: state.accounts.filter((a) => a._id !== id),
        defaultAccount:
          state.defaultAccount?._id === id ? null : state.defaultAccount,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message });
      return false;
    }
  },

  setDefault: async (id) => {
    return get().updateAccount(id, { isDefault: true });
  },
}));
