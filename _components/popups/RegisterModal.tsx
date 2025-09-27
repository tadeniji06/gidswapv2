"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/Authstore";
import { setCookie } from "@/lib/cookies";
import ResuablePop from "./resuablepop";
import StepOne from "../steps/stepOne";
import StepTwo from "../steps/stepTwo";
import StepThree from "../steps/stepThree";

export function RegistrationModal() {
  const router = useRouter();
  const {
    isRegisterModalOpen,
    setRegisterModalOpen,
    setAuthStatus,
    setRegStatus,
    setToken,
  } = useAuthStore();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    code: "",
    password: "",
  });

  const handleFormChange = (newData: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleNextStep = () => setStep((prev) => prev + 1);
  const handlePreviousStep = () => setStep((prev) => prev - 1);

  const handleFinalRegistrationSuccess = (token: string) => {
    // Store token (24-hour expiry)
    setCookie("token", token, { expires: 1, path: "/" });

    // Store regstatus (long expiry, e.g., 10 years)
    setCookie("regstatus", "true", { expires: 365 * 10, path: "/" });
    setToken(token);
    setAuthStatus(true);
    setRegStatus(true);
    setRegisterModalOpen(false);
    router.push("/dashboard");
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <StepOne
            data={formData}
            onChange={handleFormChange}
            onNext={handleNextStep}
          />
        );
      case 2:
        return (
          <StepTwo
            data={formData}
            onChange={handleFormChange}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
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
    <ResuablePop
      open={isRegisterModalOpen}
      onClose={() => setRegisterModalOpen(false)}
    >
      {renderStepContent()}
    </ResuablePop>
  );
}
