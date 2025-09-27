"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";

export default function StepTwo({ data, onNext, onBack, onChange }: any) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isValid, setIsValid] = useState<null | boolean>(null);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    const verifyCode = async () => {
      if (data.code.length === 6) {
        setVerifying(true);
        try {
          const res = await axios.post("/api/verify-otp", {
            email: data.email,
            code: data.code,
          });
          setIsValid(res.data.valid);
          if (res.data.valid) setTimeout(() => onNext(), 300);
        } catch (err) {
          toast.success(`verification failed: ${err}`);
          console.error("Verification error:", err);
          setIsValid(false);
        } finally {
          setVerifying(false);
        }
      }
    };
    verifyCode();
  }, [data.code]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const codeArray = data.code.split("").slice(0, 6);
    codeArray[index] = value;
    const newCode = codeArray.join("");
    onChange({ code: newCode });
    setIsValid(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !data.code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    try {
      setIsSending(true);
      await axios.post("/api/send-otp", { email: data.email });
      setResendTimer(60);
    } catch (err) {
      console.error("Failed to resend OTP:", err);
      alert("Failed to resend OTP. Try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Verify Email</h2>
      <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
        A verification code was sent to <br />
        <span className="font-medium text-gray-900 dark:text-white">
          {data.email}
        </span>
      </p>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Verification Code
        </label>

        <div className="flex justify-around gap-1 mb-4">
          {[...Array(6)].map((_, index) => (
            <input
              aria-label="inputs"
              key={index}
              type="text"
              maxLength={1}
              inputMode="numeric"
              pattern="[0-9]*"
              value={data.code[index] || ""}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              ref={(el) => {
                inputRefs.current[index] = el as HTMLInputElement | null;
              }}
              className={`w-12 h-12 text-center text-xl border rounded-[8px] focus-visible:outline-blue-500
              ${isValid === true ? "border-green-500" : ""}
              ${isValid === false ? "border-red-500 animate-shake" : ""}
              dark:bg-neutral-800 dark:border-neutral-700 dark:text-white`}
            />
          ))}
        </div>
      </div>

      <div className="mb-3 text-sm text-center">
        {resendTimer > 0 ? (
          <span className="text-gray-500">Resend in {resendTimer}s</span>
        ) : (
          <button
            onClick={handleResend}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Resend Code"}
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={data.code.length < 6 || verifying || isValid !== true}
          className="futuristic-button flex-1 h-12 bg-blue-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl"
        >
          {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
        </Button>
      </div>
    </div>
  );
}
