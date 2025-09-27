"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setCookie } from "@/lib/cookies";
import { useAuthStore } from "@/store/Authstore";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken, setAuthStatus } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user");

    if (token) {
      setCookie("token", token, { expires: 3 });
      setToken(token);
      if (user) {
        try {
          setCookie("user", user, { expires: 3 });
        } catch {
          console.error("Invalid user data in callback");
        }
      }

      router.push("/dashboard");
    } else {
      console.log("shit")
      router.push("/");
    }
  }, [searchParams, router, setAuthStatus, setToken]);

  return <p className="text-center mt-10">Finishing login...</p>;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<p className="text-center mt-10">Loading...</p>}>
      <CallbackHandler />
    </Suspense>
  );
}
