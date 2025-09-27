import { setCookie } from "@/lib/cookies";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useAuthStore } from "@/store/Authstore";
import axios from "axios";
import { Loader2, Mail, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function StepOne({ data, onChange, onNext }: any) {
  const [errors, setErrors] = useState({ fullName: "", email: "" });
  const [sending, setSending] = useState(false);
  const { setRegStatus } = useAuthStore();

  const validate = () => {
    const errs = {
      fullName: data.fullName ? "" : "Full name is required",
      email: /\S+@\S+\.\S+/.test(data.email) ? "" : "Valid email is required",
    };
    setErrors(errs);
    return !errs.fullName && !errs.email;
  };

  const handleNext = async () => {
    if (!validate()) return;

    setSending(true);
    try {
      //  Check if user exists
      const url = process.env.NEXT_PUBLIC_PROD_API;
      const checkRes = await axios.post(`${url}/api/auth/check-email`, {
        email: data.email,
      });
      if (checkRes.data.exists) {
        setCookie("regstatus", "true", { expires: 365 * 10, path: "/" });
        toast.error("User already exists. Reloading...");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return;
      }

      //Send OTP if user doesn't exist
      const otpRes = await axios.post("/api/send-otp", {
        email: data.email,
      });

      if (otpRes.data.success) {
        toast.success("OTP sent successfully!");
        onNext();
      } else {
        throw new Error(otpRes.data.error || "OTP send failed");
      }
    } catch (err: any) {
      toast.error(
        `Failed: ${
          err.message || err.response?.data?.message || "Unknown error"
        }`
      );
      console.error("Error in handleNext:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Your Account
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Join thousands of crypto traders
        </p>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            className={`pl-10 h-12 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
              errors.fullName ? "border-red-500 dark:border-red-400" : ""
            }`}
          />
        </div>
        {errors.fullName && (
          <p className="text-red-500 dark:text-red-400 text-sm">
            {errors.fullName}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            id="email"
            type="email"
            placeholder="me@example.com"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className={`pl-10 h-12 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
              errors.email ? "border-red-500 dark:border-red-400" : ""
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-red-500 dark:text-red-400 text-sm">
            {errors.email}
          </p>
        )}
      </div>

      <Button
        onClick={handleNext}
        disabled={sending}
        className="w-full h-12 futuristic-button bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {sending ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending OTP...
          </div>
        ) : (
          "Continue"
        )}
      </Button>
    </div>
  );
}
