import { useEffect, useState } from "react";
import { ChevronDown, Check, Loader2, Search, ArrowLeft } from "lucide-react";
import { useBankVerificationStore } from "@/lib/bank-verification-store";
import { useOnrampStore } from "@/lib/onramp-store";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

interface DetailsCardProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function OnrampDetailsCard({ onBack, onSuccess }: DetailsCardProps) {
  const {
    banks,
    selectedBank,
    accountNumber,
    accountName,
    isLoadingBanks,
    isVerifying,
    isVerified,
    error: bankError,
    fetchBanks,
    setSelectedBank,
    setAccountNumber,
  } = useBankVerificationStore();

  const { walletAddress, setField, initiateOnramp, isInitiating } = useOnrampStore();

  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!isVerified || !walletAddress || !selectedBank) {
      toast.error("Please fill in all required fields");
      return;
    }

    setField("bankCode", selectedBank.code);
    setField("accountNumber", accountNumber);
    setField("accountName", accountName || "");

    const success = await initiateOnramp();
    if (success) {
      toast.success("Order Created!");
      onSuccess();
    } else {
      toast.error("Failed to initialize onramp order");
    }
  };

  const isFormValid = isVerified && walletAddress && walletAddress.length > 10;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="text-gray-400 hover:text-white p-0">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="bg-white dark:bg-[#1f222e] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payout Details</h2>
          <p className="text-sm text-gray-500 mt-1">
            Where should we send your Stables and Fiat?
          </p>
        </div>

        {/* Wallet Address Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Wallet Address (To Receive Stables)
          </label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setField("walletAddress", e.target.value)}
            placeholder="0x..."
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Stables will be sent here first before you forward them.</p>
        </div>

        <hr className="border-gray-200 dark:border-gray-700 mb-6" />

        <div className="mb-4 font-medium text-gray-700 dark:text-gray-200 text-sm">
          Naira Bank Details (Leg 2 Payout)
        </div>

        {/* Bank Selection */}
        <div className="mb-4">
          <div className="relative">
            <button
              onClick={() => setShowBankDropdown(!showBankDropdown)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
              disabled={isLoadingBanks}
            >
              <span className="truncate">
                {isLoadingBanks ? "Loading banks..." : selectedBank ? selectedBank.name : "Select your bank"}
              </span>
              {isLoadingBanks ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              ) : (
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showBankDropdown ? "rotate-180" : ""}`} />
              )}
            </button>

            {showBankDropdown && !isLoadingBanks && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                <div className="p-2 sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search bank..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none text-sm text-white"
                    />
                  </div>
                </div>
                {filteredBanks.map((bank) => (
                  <button
                    key={bank.code}
                    onClick={() => { setSelectedBank(bank); setShowBankDropdown(false); }}
                    className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 border-b border-gray-700 last:border-0"
                  >
                    {bank.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Account Number */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="10-digit account number"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={10}
              disabled={!selectedBank}
            />
            {isVerifying && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              </div>
            )}
            {isVerified && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Check className="h-4 w-4 text-green-500" />
              </div>
            )}
          </div>
        </div>

        {/* Verification Status */}
        {accountName && (
          <div className="mb-6 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-xl">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600 dark:text-green-500" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">Verified</span>
            </div>
            <div className="text-gray-900 dark:text-white font-medium mt-1 text-sm">{accountName}</div>
          </div>
        )}
        
        {bankError && (
          <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-xl text-sm text-red-500">
            {bankError}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isInitiating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {isInitiating ? (
            <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin"/> Processing...</span>
          ) : (
            "Proceed to Deposit"
          )}
        </Button>
      </div>
    </div>
  );
}
