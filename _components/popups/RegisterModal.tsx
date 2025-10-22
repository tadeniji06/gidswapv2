"use client";

import { useState, useEffect } from "react";
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

    useEffect(() => {
    console.log("Current step:", step);
  }, [step]);
  
  const handleFormChange = (newData: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };
  useEffect(() => {
    if (isRegisterModalOpen) setStep(1);
  }, [isRegisterModalOpen]);

  const handleNextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const handlePreviousStep = () => setStep((prev) => Math.max(prev - 1, 1));


  const handleFinalRegistrationSuccess = (token: string) => {
    // Store token (24-hour expiry)
    setCookie("token", token, { expires: 1, path: "/" });

    // Store regstatus (long expiry, e.g., 2 years)
    setCookie("regstatus", "true", { expires: 365 * 2, path: "/" });
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
