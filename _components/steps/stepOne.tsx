"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { useAuthStore } from "@/store/Authstore";
import { setCookie } from "@/lib/cookies";
import { Loader2, Mail, User } from "lucide-react";

export default function StepOne({ data, onNext, onChange }: any) {
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

      {/* Password */}
      {/* <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={localData.password}
            onChange={(e) => updateField("password", e.target.value)}
            className={`pl-10 pr-10 h-12 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
              errors.password ? "border-red-500 dark:border-red-400" : ""
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 dark:text-red-400 text-sm">
            {errors.password}
          </p>
        )}
      </div> */}

      {/* Confirm Password */}
      {/* <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`pl-10 h-12 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
              errors.confirmPassword ? "border-red-500 dark:border-red-400" : ""
            }`}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 dark:text-red-400 text-sm">
            {errors.confirmPassword}
          </p>
        )}
      </div> */}

      <Button
        onClick={handleNext}
        disabled={sending}
        className="w-full h-12 futuristic-button text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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

    // <div className="space-y-4">
    //   <h1 className="text-[1.2rem] font-semibold text-center py-5">
    //     Sign in to <span className="font-crimson italic text-[1.8rem]">Gidswap</span>
    //   </h1>
    //   <h2 className="text-lg font-bold mb-4">Your Info</h2>

    //   <div className="space-y-2">

    //     <Input
    //       id="fullName"
    //       type="text"
    //       placeholder="Full Name"
    //       value={data.fullName}
    //       onChange={(e) => onChange({ fullName: e.target.value })}
    //     />
    //     {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
    //   </div>

    //   <div className="space-y-2">

    //     <Input
    //       id="email"
    //       type="email"
    //       placeholder="Email"
    //       value={data.email}
    //       onChange={(e) => onChange({ email: e.target.value })}
    //     />
    //     {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
    //   </div>

    //   <Button onClick={handleNext} disabled={sending} className="futuristic-button w-full mt-4 dark:bg-blue-500/90 dark:text-blue-50">
    //     {sending ? "Sending OTP..." : "Next"}
    //   </Button>
    // </div>
  );
}
