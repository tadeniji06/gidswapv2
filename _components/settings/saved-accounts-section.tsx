"use client";

import { useEffect, useState } from "react";
import { useSavedAccountsStore, SavedAccount } from "@/lib/saved-accounts-store";
import {
  BookUser,
  Star,
  StarOff,
  Trash2,
  Loader2,
  Building2,
  Hash,
  Wallet,
  Edit3,
  Check,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { toast } from "sonner";

export function SavedAccountsSection() {
  const {
    accounts,
    isLoading,
    isSaving,
    fetchAccounts,
    updateAccount,
    deleteAccount,
    setDefault,
  } = useSavedAccountsStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);


  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const startEdit = (account: SavedAccount) => {
    setEditingId(account._id);
    setEditLabel(account.label);
    setEditAddress(account.returnAddress || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel("");
    setEditAddress("");
  };

  const saveEdit = async (id: string) => {
    try {
      const ok = await updateAccount(id, {
        label: editLabel || "My Account",
        returnAddress: editAddress || undefined,
        tfaToken: "",
      });
      if (ok) {
        toast.success("Account updated");
        cancelEdit();
      } else {
        toast.error("Failed to update account");
      }
    } catch(e) {
      toast.error("Failed to update account");
    }
  };

  const handleDelete = async (id: string, label: string) => {
    try {
      setDeletingId(id);
      const ok = await deleteAccount(id, "");
      setDeletingId(null);
      if (ok) {
        toast.success(`"${label}" removed`);
      } else {
        toast.error("Failed to remove account");
      }
    } catch(e) {
      setDeletingId(null);
      toast.error("Failed to remove account");
    }
  };

  const handleSetDefault = async (id: string) => {
    const ok = await setDefault(id);
    if (ok) toast.success("Default account updated");
  };

  return (
    <div className="space-y-3">
      {accounts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookUser className="w-7 h-7 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            No saved accounts yet
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
            Save a bank account during your next transaction to pre-fill it automatically next time.
          </p>
        </div>
      ) : (
        accounts.map((account) => {
          const isEditing = editingId === account._id;
          const isDeleting = deletingId === account._id;

          return (
            <div
              key={account._id}
              className={`rounded-xl border transition-all ${
                account.isDefault
                  ? "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10"
                  : "border-gray-200 dark:border-gray-800 bg-card"
              }`}
            >
              {/* Account Header */}
              <div className="flex items-start justify-between p-4 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      account.isDefault
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <Building2
                      className={`w-5 h-5 ${
                        account.isDefault
                          ? "text-blue-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                  </div>

                  <div className="flex-1">
                    {isEditing ? (
                      <Input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="h-7 text-sm font-semibold bg-white dark:bg-gray-800 mb-0.5 max-w-[180px]"
                        placeholder="Account nickname"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {account.label}
                        </span>
                        {account.isDefault && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                            Default
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {account.bankName}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {!isEditing ? (
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      title={account.isDefault ? "Default account" : "Set as default"}
                      onClick={() => handleSetDefault(account._id)}
                      disabled={account.isDefault}
                      className="p-1.5 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-gray-400 hover:text-yellow-500 transition-colors disabled:opacity-40 disabled:cursor-default"
                    >
                      {account.isDefault
                        ? <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        : <StarOff className="w-4 h-4" />
                      }
                    </button>
                    <button
                      title="Edit"
                      onClick={() => startEdit(account)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      title="Remove"
                      onClick={() => handleDelete(account._id, account.label)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                    >
                      {isDeleting
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => saveEdit(account._id)}
                      disabled={isSaving}
                      className="p-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                      title="Save changes"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Account Details */}
              <div className="px-4 pb-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                      <Hash className="w-3 h-3" /> Account Number
                    </p>
                    <p className="text-sm font-mono text-gray-800 dark:text-gray-200 font-medium">
                      {account.accountNumber}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400 mb-0.5">Account Name</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate">
                      {account.accountName}
                    </p>
                  </div>
                </div>

                {/* Refund address */}
                {isEditing ? (
                  <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <Wallet className="w-3 h-3" /> Refund Wallet Address
                    </p>
                    <Input
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="0x… (optional)"
                      className="h-7 text-xs font-mono bg-white dark:bg-gray-800"
                    />
                  </div>
                ) : account.returnAddress ? (
                  <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                      <Wallet className="w-3 h-3" /> Refund Wallet
                    </p>
                    <p className="text-xs font-mono text-gray-600 dark:text-gray-300 break-all">
                      {account.returnAddress}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })
      )}

    </div>
  );
}
