import { Button } from "@/src/components/ui/button";
import axios from "axios";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function StepThree({ data, onNext, onBack, loading }: any) {
  const [submitting, setSubmitting] = useState(false);
  const [regstatus, setRegstatus] = useState(false);
  const url = "https://gidswap-server.onrender.com/api/auth/signup";

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const res = await axios.post(url, {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });

      const msg = res.data.message;
      const token = res.data.token;
      // const user = res.data.user;
      console.log(token);
      toast.success(`${msg}`);
      if (msg) {
        onNext(token);
      } else {
        toast.error(res.data.message || "Registration failed.");
      }
    } catch (err: any) {
      console.error("API error:", err);
      toast.error(
        `Something went wrong: ${
          err.response?.data?.message || "Unknown error"
        }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Almost There!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Complete your registration to start trading
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Account Summary
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Name:</span>
            <span className="text-gray-900 dark:text-white">
              {data.fullName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Email:</span>
            <span className="text-gray-900 dark:text-white">{data.email}</span>
          </div>
        </div>
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
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Completing...
            </div>
          ) : (
            "Complete Registration"
          )}
        </Button>
      </div>
    </div>
  );
}
