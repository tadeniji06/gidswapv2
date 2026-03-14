import { useEffect } from "react";
import { useOnrampStore } from "@/lib/onramp-store";
import { Button } from "@/src/components/ui/button";
import { Loader2, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

interface StatusCardProps {
  onReset: () => void;
}

export function OnrampStatusCard({ onReset }: StatusCardProps) {
  const { status, sessionData, pollStatus, continueToFiat } = useOnrampStore();

  useEffect(() => {
    // Poll every 5 seconds while active
    const interval = setInterval(() => {
      if (status !== "completed" && status !== "failed" && status !== "expired") {
        pollStatus();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [status, pollStatus]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const PipelineStep = () => {
    switch (status) {
      case "ff_pending":
      case "ff_awaiting":
        return (
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Step 1: Send Crypto</h3>
            <p className="text-sm text-gray-500 mb-6">Send exactly <strong>{sessionData?.cryptoLeg?.amount} {sessionData?.cryptoLeg?.currency} ({sessionData?.cryptoLeg?.network})</strong> to the address below.</p>
            
            <div className="flex justify-center mb-6">
              <div className="bg-white p-2 rounded-lg inline-block shadow-sm">
                <QRCodeSVG
                  value={sessionData?.cryptoLeg?.depositAddress || ""}
                  size={160}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
              <label className="text-xs text-gray-400 mb-1 block text-left">Deposit Address</label>
              <div className="flex items-center justify-between">
                <p className="text-sm font-mono truncate mr-2 dark:text-white">{sessionData?.cryptoLeg?.depositAddress}</p>
                <button onClick={() => copyToClipboard(sessionData?.cryptoLeg?.depositAddress)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-blue-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Waiting for deposit...
            </div>
          </div>
        );

      case "ff_converting":
        return (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Converting Crypto</h3>
            <p className="text-sm text-gray-500">We have received your deposit! Your crypto is currently being converted to Stablecoins.</p>
          </div>
        );

      case "ff_done":
        return (
          <div className="text-center py-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Stables Received!</h3>
            <p className="text-sm text-gray-500 mb-6">
              Your {sessionData?.cryptoLeg?.expectedStableAmount} {sessionData?.cryptoLeg?.convertingTo} has been sent to your wallet.
              Please confirm receipt to continue to the fiat payout phase.
            </p>
            <Button onClick={() => continueToFiat()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl">
              I have received the Stables (Continue)
            </Button>
          </div>
        );

      case "pc_pending":
      case "pc_awaiting":
        return (
          <div className="text-center">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Step 2: Send Stables for Fiat</h3>
             <p className="text-sm text-gray-500 mb-6">Send EXACTLY <strong>{sessionData?.fiatLeg?.amountToSend} {sessionData?.fiatLeg?.token} ({sessionData?.fiatLeg?.network})</strong> to the address below to receive your Naira.</p>
             
             <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
              <label className="text-xs text-gray-400 mb-1 block text-left">PayCrest Deposit Address</label>
              <div className="flex items-center justify-between">
                <p className="text-sm font-mono truncate mr-2 dark:text-white">{sessionData?.fiatLeg?.payCrestDepositAddress}</p>
                <button onClick={() => copyToClipboard(sessionData?.fiatLeg?.payCrestDepositAddress)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-blue-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Waiting for Stables deposit...
            </div>
          </div>
        );

      case "pc_processing":
        return (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sending Fiat...</h3>
            <p className="text-sm text-gray-500">Naira is being transferred to your bank account ({sessionData?.estimatedNGN ? `₦${sessionData.estimatedNGN.toLocaleString()}` : "estimating..."}).</p>
          </div>
        );

      case "completed":
        return (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Transaction Complete!</h3>
            <p className="text-sm text-gray-500 mb-6">Your NGN payout has successfully landed in your bank account.</p>
            <Button onClick={onReset} variant="outline" className="w-full rounded-xl">Start Another Transfer</Button>
          </div>
        );

      case "failed":
      case "expired":
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">X</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Transaction Failed</h3>
            <p className="text-sm text-gray-500 mb-6">{sessionData?.error?.message || "An error occurred."}</p>
            <Button onClick={onReset} variant="outline" className="w-full rounded-xl">Back to Home</Button>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500 text-sm">Loading Order State...</div>
        );
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white dark:bg-[#1f222e] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
        {/* Status display header */}
        <div className="text-center mb-6">
          <span className="text-xs font-semibold px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded">
            {sessionData?.statusLabel || "Loading..."}
          </span>
        </div>

        <PipelineStep />

        <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-4 text-xs text-gray-400 text-center">
          Session ID: {sessionData?.sessionId}
        </div>
      </div>
    </div>
  );
}
