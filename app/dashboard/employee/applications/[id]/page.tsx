"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Star,
  FileText,
  Mail,
  Phone,
  ChevronDown,
  XCircle,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";

type User = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  role?: string;
};

const statusColors: Record<string, string> = {
  Applied: "bg-blue-100 text-blue-800",
  "Under Review": "bg-amber-100 text-amber-800",
  Interview: "bg-purple-100 text-purple-800",
  Offered: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  default: "bg-gray-100 text-gray-800",
};

// ⭐ Star Rating Component
const StarRating = ({
  rating,
  setRating,
  readOnly = false,
}: {
  rating: number;
  setRating?: (rating: number) => void;
  readOnly?: boolean;
}) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && setRating && setRating(star)}
          className={`${!readOnly ? "cursor-pointer" : "cursor-default"} ${star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
        >
          <Star
            className={`w-5 h-5 ${star <= rating ? "fill-current" : ""}`}
          />
        </button>
      ))}
    </div>
  );
};

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const apiBase = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    []
  );

  // 🟦 Fetch application details
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${apiBase}/api/applications/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const json = await res.json();
        if (!res.ok)
          throw new Error(json.message || "Failed to load application");

        const application = json.data?.application || json.data || json;
        setApp(application);
        setStatus(application.status || "Applied");
        setRating(application.rating || 0);
      } catch (e: any) {
        setError(e.message || "Failed to load application");
        toast.error(e.message || "Failed to load application");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id, apiBase]);

  // 🟨 Save status change
  const saveStatus = async (newStatus: string) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${apiBase}/api/applications/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update status");

      setStatus(newStatus);
      setApp({ ...app, status: newStatus });
      toast.success("Status updated successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    } finally {
      setIsSaving(false);
    }
  };

  // ⭐ Save rating
  const saveRating = async (newRating: number) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${apiBase}/api/applications/${id}/rating`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: newRating }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save rating");

      setRating(newRating);
      toast.success("Rating saved successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to save rating");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto p-6">Loading…</div>
      </div>
    );

  if (error || !app)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto p-6 text-red-600">
          {error || "Application not found"}
        </div>
      </div>
    );

  const u: User = app?.jobSeeker?.user || {};
  const fullName =
    [u.firstName, u.lastName].filter(Boolean).join(" ") || "Applicant";

  const toText = (v: any): string => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
    if (Array.isArray(v)) return v.map(toText).join(" ");
    if (typeof v === "object") {
      if (typeof v.text === "string") return v.text;
      if (Array.isArray(v.blocks)) return v.blocks.map(toText).join(" ");
      try {
        return JSON.stringify(v);
      } catch {
        return "";
      }
    }
    return String(v);
  };

  const resumeObj = app.jobSeeker?.resume;
  const resumeHref = typeof resumeObj === "string" ? resumeObj : resumeObj?.url;
  const resumeFilename = resumeObj?.filename || "Resume";
  const coverLetterText = toText(app.coverLetter) || "No cover letter provided";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#00A3FF] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Applications
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Application Details
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* ===== Left Column ===== */}
          <div className="md:col-span-2 space-y-6">
            {/* Applicant Info */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {u.profileImage ? (
                      <img
                        className="h-16 w-16 rounded-full object-cover"
                        src={u.profileImage}
                        alt={fullName}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                        {fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {fullName}
                    </h2>
                    <div className="mt-1 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{u.email || "No email provided"}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center mt-1">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Section */}
            {resumeHref && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-[#00A3FF]" />
                  Resume
                </h3>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">{resumeFilename}</p>
                    <div className="flex gap-2">
                      {/* View Resume */}
                      <a
                        href={resumeHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-gradient-to-r from-[#00A3FF] to-[#00E0FF] hover:opacity-90 transition-all"
                      >
                        <FileText className="h-4 w-4 text-white" />
                        View Resume
                      </a>

                      {/* Download Resume */}
                      <a
                        href={resumeHref}
                        download={resumeFilename}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#00A3FF] text-[#00A3FF] bg-white text-sm font-medium rounded-md shadow-md hover:bg-blue-50 transition-all"
                      >
                        <FileText className="h-4 w-4 text-[#00A3FF]" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Cover Letter */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Cover Letter
              </h3>
              <div className="prose max-w-none text-gray-600">
                {coverLetterText.split("\n").map((paragraph, i) => (
                  <p key={i} className="mb-4 last:mb-0">
                    {paragraph || <br />}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* ===== Right Column ===== */}
          <div className="space-y-6">
            {/* Status Dropdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
              <div className="space-y-4">
                <div className="relative group">
                  <button
                    className={`inline-flex items-center justify-between w-full px-4 py-2 rounded-md border ${statusColors[status] || statusColors.default
                      }`}
                  >
                    <span>{status}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                    <div className="py-1">
                      {Object.entries(statusColors).map(
                        ([statusValue]) =>
                          statusValue !== "default" && (
                            <button
                              key={statusValue}
                              onClick={() => saveStatus(statusValue)}
                              disabled={isSaving}
                              className={`block w-full text-left px-4 py-2 text-sm ${status === statusValue
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                              {statusValue}
                            </button>
                          )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Rate Candidate
              </h3>
              <div className="space-y-4">
                <StarRating
                  rating={rating}
                  setRating={(newRating) => saveRating(newRating)}
                  readOnly={isSaving}
                />
                <p className="text-sm text-gray-500">
                  {rating
                    ? `Rated ${rating} star${rating > 1 ? "s" : ""}`
                    : "Not yet rated"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
