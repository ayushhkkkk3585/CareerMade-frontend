"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function OAuthHandler() {
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

      // Debug: log tokens so we can confirm they're present after redirect
      // and to help identify races where other code may clear storage.
      // Remove these logs once the issue is resolved.
      // eslint-disable-next-line no-console
      console.log("OAuth redirect tokens:", { accessToken, refreshToken, role });

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Small defensive delay before navigating so localStorage writes
      // are visible to other client components that mount immediately.
      const navigateTo = () => {
        if (role === "jobseeker") {
          router.replace("/dashboard/jobseeker");
        } else if (role === "employer") {
          router.replace("/dashboard/employee/jobs");
        } else {
          router.replace("/dashboard");
        }
      };

      setTimeout(navigateTo, 80);
    } catch (e) {
      toast.error("Failed to process OAuth response.");
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
      <a href="/login" className="text-[#8F59ED] underline">
        Go to login
      </a>
    </div>
  );
}

export default function OAuthSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-700">Processing OAuth response…</p>
        </div>
      }
    >
      <OAuthHandler />
    </Suspense>
  );
}
