"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/Authstore";
import { setCookie } from "@/lib/cookies";
import { Eye, EyeOff, Mail, Lock, User, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { ResponsiveModal } from "./responsive-modal";
import StepOne from "../steps/registrationStepOne";
import StepTwo from "../steps/registrationStepTwo";
import StepThree from "../steps/stepThree";

export function RegistrationModal() {
  const router = useRouter();
  const {
    isRegisterModalOpen,
    setRegisterModalOpen,
    setLoginModalOpen,
    setAuthStatus,
    setRegStatus,
    setToken,
  } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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
    // Simulate API call
    setTimeout(() => {
      setStep((prev) => prev + 1);
      setLoading(false);
    }, 1000);
  };

  const handlePreviousStep = () => setStep((prev) => prev - 1);

  const handleFinalRegistrationSuccess = (token: string) => {
    setLoading(true);

    setTimeout(() => {
      // Store token (24-hour expiry)
      setCookie("token", token, { expires: 1, path: "/" });
      setCookie("regstatus", "true", { expires: 365 * 10, path: "/" });

      setToken(token);
      setAuthStatus(true);
      setRegStatus(true);
      setRegisterModalOpen(false);
      setLoading(false);
      router.push("/dashboard");
    }, 1500);
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
          <StepTwo
            data={formData}
            onChange={handleFormChange}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
            loading={loading}
          />
        );
      case 3:
        return (
          <StepThree
            data={formData}
            onChange={handleFormChange}
            onNext={handleFinalRegistrationSuccess}
            onBack={handlePreviousStep}
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
      title={`Step ${step} of 3`}
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

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
