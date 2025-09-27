"use client";

import { useState, useEffect } from "react";
import { usePasswordResetStore } from "@/lib/forgot-password";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  ArrowLeft,
  Mail,
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordFlow() {
  const {
    currentStep,
    email,
    otp,
    newPassword,
    confirmPassword,
    isLoading,
    error,
    emailSent,
    otpVerified,
    passwordReset,
    setEmail,
    setOtp,
    setNewPassword,
    setConfirmPassword,
    sendOtp,
    verifyOtp,
    resetPassword,
    previousStep,
    resetState,
    setError,
  } = usePasswordResetStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto-focus OTP input and handle paste
  useEffect(() => {
    if (currentStep === "otp") {
      const otpInput = document.getElementById("otp-input");
      if (otpInput) {
        otpInput.focus();
      }
    }
  }, [currentStep]);

  
  const handleOtpChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 6);
    setOtp(numericValue);

    // Auto-submit when 6 digits are entered
    if (numericValue.length === 6) {
      setTimeout(() => verifyOtp(), 500);
    }
  };
  const router = useRouter();
  const handleStartOver = () => {
    router.push("/");
  };

  if (passwordReset) {
    return (
      <div className="w-full max-w-md mx-auto p-6 ">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">
              Password Reset Successfully
            </h1>
            <p className="text-gray-400">
              Your password has been updated. You can now sign in with your new
              password.
            </p>
          </div>

          <Button
            onClick={handleStartOver}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 py-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        {currentStep !== "email" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={previousStep}
            className="text-gray-400 hover:text-white p-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-semibold">Reset Password</h1>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === "email"
                ? "bg-blue-600 text-white"
                : emailSent
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-400"
            }`}
          >
            <Mail className="w-4 h-4" />
          </div>
          <div
            className={`w-12 h-0.5 ${
              emailSent ? "bg-green-600" : "bg-gray-700"
            }`}
          />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === "otp"
                ? "bg-blue-600 text-white"
                : otpVerified
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-400"
            }`}
          >
            <Shield className="w-4 h-4" />
          </div>
          <div
            className={`w-12 h-0.5 ${
              otpVerified ? "bg-green-600" : "bg-gray-700"
            }`}
          />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === "password"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-400"
            }`}
          >
            <Lock className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === "email" && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-medium">Enter Your Email</h2>
              <p className="text-sm text-gray-400">
                We'll send you a verification code to reset your password
              </p>
            </div>

            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-gray-700 placeholder-gray-500 focus:border-blue-500"
                disabled={isLoading}
              />

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <Button
                onClick={sendOtp}
                disabled={isLoading || !email}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Button>
            </div>
          </div>
        )}

        {currentStep === "otp" && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-medium text-white">
                Enter Verification Code
              </h2>
              <p className="text-sm text-gray-400">
                We sent a 6-digit code to{" "}
                <span className="text-white">{email}</span>
              </p>
            </div>

            <div className="space-y-4">
              <Input
                id="otp-input"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => handleOtpChange(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 text-center text-2xl tracking-widest"
                maxLength={6}
                disabled={isLoading}
              />

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <Button
                onClick={verifyOtp}
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>

              <Button
                variant="ghost"
                onClick={sendOtp}
                disabled={isLoading}
                className="w-full text-gray-400 hover:text-white"
              >
                Resend Code
              </Button>
            </div>
          </div>
        )}

        {currentStep === "password" && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-medium text-white">
                Set New Password
              </h2>
              <p className="text-sm text-gray-400">
                Choose a strong password for your account
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {newPassword && (
                <div className="text-xs text-gray-400 space-y-1">
                  <p
                    className={
                      newPassword.length >= 8
                        ? "text-green-400"
                        : "text-gray-400"
                    }
                  >
                    • At least 8 characters
                  </p>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <Button
                onClick={resetPassword}
                disabled={isLoading || !newPassword || !confirmPassword}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
