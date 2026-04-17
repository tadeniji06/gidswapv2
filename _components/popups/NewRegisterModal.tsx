"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/Authstore";
import { setCookie } from "@/lib/cookies";
import {FcGoogle} from "react-icons/fc"
import { motion, AnimatePresence } from "framer-motion";
// import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { ResponsiveModal } from "./responsive-modal";
import StepOne from "../steps/registrationStepOne";
import StepTwo from "../steps/registrationStepTwo";
import StepThree from "../steps/stepThree";
import OtpVerificationStep from "../steps/OtpVerificationStep";
import axios from "axios";
import { toast } from "sonner";

export function RegistrationModal() {
  const router = useRouter();
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_PROD_API}/api/auth/google`;
  };
  const {
    isRegisterModalOpen,
    setRegisterModalOpen,
    setLoginModalOpen,
    setAuthStatus,
    setRegStatus,
    setToken,
    tempEmail,
    setTempEmail,
  } = useAuthStore();
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isRegisterModalOpen && tempEmail) {
      setFormData(prev => ({ ...prev, email: tempEmail }));
      setStep(3); // Corrected from 4 to 3 (OTP Step)
      setTempEmail("");
    }
  }, [isRegisterModalOpen, tempEmail, setTempEmail]);
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    code: "",
    password: "",
  });

  const handleFormChange = (newData: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleNextStep = () => {
    setLoading(true);
    setTimeout(() => {
      setStep((prev) => Math.min(prev + 1, 3)); 
      setLoading(false);
    }, 500);
  };

  const handleResendOtp = async () => {
    try {
      const api_url = process.env.NEXT_PUBLIC_PROD_API;
      await axios.post(`${api_url}/api/auth/request-otp`, { email: formData.email });
      toast.success("A new OTP has been sent to your email.");
    } catch (err: any) {
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  const handlePreviousStep = () => setStep((prev) => prev - 1);

  const handleVerifyOtp = async (otp: string) => {
    setIsVerifying(true);
    try {
      const api_url = process.env.NEXT_PUBLIC_PROD_API;
      const res = await axios.post(`${api_url}/api/auth/verify-email`, {
        email: formData.email,
        otp
      });

      if (res.data.success) {
        toast.success("Email verified successfully!");
        handleFinalRegistrationSuccess(res.data.token);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFinalRegistrationSuccess = (token: string) => {
    setCookie("token", token, { expires: 1, path: "/" });
    setCookie("regstatus", "true", { expires: 365, path: "/" });

    setToken(token);
    setAuthStatus(true);
    setRegStatus(true);
    setRegisterModalOpen(false);
    router.push("/dashboard");
  };

  const switchToLogin = () => {
    setRegisterModalOpen(false);
    setLoginModalOpen(true);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <StepOne
            data={formData}
            onChange={handleFormChange}
            onNext={handleNextStep}
            loading={loading}
          />
        );
      case 2:
        return (
          <StepThree
            data={formData}
            onChange={handleFormChange}
            onNext={() => setStep(3)}
            onBack={handlePreviousStep}
          />
        );
      case 3:
        return (
          <OtpVerificationStep
            email={formData.email}
            onVerify={handleVerifyOtp}
            onResend={handleResendOtp}
            loading={isVerifying}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ResponsiveModal
      open={isRegisterModalOpen}
      onClose={() => setRegisterModalOpen(false)}
      title={step < 3 ? `Step ${step} of 2` : "Final Verification"}
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        {step < 3 && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 2) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Switch to Login */}
        {step === 1 && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Already have an account?
                </span>
              </div>
            </div>
                    <Button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="w-full h-12 flex text-gray-800 dark:text-gray-50 items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl"
                    >
                      <FcGoogle className="w-5 h-5" />
                      Continue with Google
                    </Button>
            <Button
              type="button"
              variant="outline"
              onClick={switchToLogin}
              className="w-full h-12 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-xl bg-transparent"
            >
              Sign In Instead
            </Button>
          </>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Secured by{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400 font-crimson italic">
              Gidswap
            </span>
          </p>
        </div>
      </div>
    </ResponsiveModal>
  );
}
