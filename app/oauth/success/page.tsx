"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthSuccess() {
  const router = useRouter();
  const params = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const accessToken = params.get("accessToken");
      const refreshToken = params.get("refreshToken");
      const role = (params.get("role") || "").toLowerCase();

      if (!accessToken || !refreshToken) {
        setError("Missing tokens in callback.");
        setProcessing(false);
        return;
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      if (role === "jobseeker") {
        router.replace("/dashboard/jobseeker");
      } else if (role === "employer") {
        router.replace("/dashboard/employee");
      } else {
        router.replace("/dashboard");
      }
    } catch (e) {
      setError("Failed to process OAuth response.");
      setProcessing(false);
    }
  }, [params, router]);

  if (processing && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">Signing you in…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-red-600">{error || "Something went wrong."}</p>
      <a href="/login" className="text-[#8F59ED] underline">Go to login</a>
    </div>
  );
}
