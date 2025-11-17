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
import GradientLoader from "@/app/components/GradientLoader";

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
        const user = localStorage.getItem("user");

        // 🧱 Redirect if no login
        if (!token || !user) {
          toast.error("Please log in to continue.");
          router.push("/login");
          return;
        }

        const parsedUser = JSON.parse(user);

        // 🚫 Restrict access if not employer
        if (parsedUser.role !== "employer") {
          toast.error("Access denied. Employers only.");
          router.push("/login");
          return;
        }

        // ✅ Proceed to fetch application details
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
  }, [id, apiBase, router]);


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
      <div className="h-screen flex items-center justify-center bg-white">
        <GradientLoader />
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
  
  const coverLetterObj = app.coverLetter;
  const coverLetterHref = typeof coverLetterObj === "string" ? coverLetterObj : coverLetterObj?.url;
  const coverLetterFilename = coverLetterObj?.filename || "Cover Letter";
  const coverLetterText = !coverLetterHref ? (toText(app.coverLetter) || "No cover letter provided") : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

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
                  <div className="shrink-0">
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
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-linear-to-r from-[#00A3FF] to-[#00E0FF] hover:opacity-90 transition-all"
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
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#00A3FF]" />
                Cover Letter
              </h3>

              {coverLetterHref ? (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">{coverLetterFilename}</p>
                    <div className="flex gap-2">
                      {/* View Cover Letter */}
                      <a
                        href={coverLetterHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-linear-to-r from-[#00A3FF] to-[#00E0FF] hover:opacity-90 transition-all"
                      >
                        <FileText className="h-4 w-4 text-white" />
                        View Cover Letter
                      </a>

                      {/* Download Cover Letter */}
                      <a
                        href={coverLetterHref}
                        download={coverLetterFilename}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#00A3FF] text-[#00A3FF] bg-white text-sm font-medium rounded-md shadow-md hover:bg-blue-50 transition-all"
                      >
                        <FileText className="h-4 w-4 text-[#00A3FF]" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ) : coverLetterText ? (
                <div className="space-y-4">
                  <div className="prose max-w-none text-gray-600 bg-gray-50 p-4 rounded-lg line-clamp-3">
                    {coverLetterText.split("\n").map((paragraph, i) => (
                      <p key={i} className="mb-2 last:mb-0 text-sm leading-relaxed">
                        {paragraph || <br />}
                      </p>
                    ))}
                  </div>
                  <button
                    onClick={() => copyToClipboard(coverLetterText)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#00A3FF] text-[#00A3FF] bg-white text-sm font-medium rounded-md shadow-md hover:bg-blue-50 transition-all"
                  >
                    Copy Text
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No cover letter provided</p>
              )}
            </div>

            {/* Professional summary */}
            {(app.summary || app.professionalSummary || app.jobSeeker?.summary || app.jobSeeker?.professionalSummary) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Professional summary</h3>
                <div className="text-sm text-gray-600 prose max-w-none">
                  {(app.summary || app.professionalSummary || app.jobSeeker?.summary || app.jobSeeker?.professionalSummary)
                    .toString()
                    .split("\n")
                    .map((p: string, i: number) => (
                      <p key={i} className="mb-2 last:mb-0">
                        {p}
                      </p>
                    ))}
                </div>
              </div>
            )}

            {/* Skills & expertise */}
            {((app.skills && app.skills.length) || (app.jobSeeker?.skills && app.jobSeeker.skills.length)) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Skills & expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {(app.skills || app.jobSeeker?.skills || []).map((s: any, i: number) => (
                    <span key={i} className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      {typeof s === "string" ? s : s.name || JSON.stringify(s)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Work experience */}
            {(app.workExperience || app.jobSeeker?.workExperience) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Work experience</h3>
                <div className="space-y-4">
                  {(app.workExperience || app.jobSeeker?.workExperience || []).map((we: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{we.title || we.position || we.role || we.designation}</p>
                          <p className="text-sm text-gray-500">{we.company || we.organization || we.employer}</p>
                        </div>
                        <p className="text-sm text-gray-500">{we.duration || `${we.from || ''} ${we.to ? ' - ' + we.to : ''}`}</p>
                      </div>
                      {we.description && <p className="text-sm text-gray-600 mt-2">{we.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {(app.education || app.jobSeeker?.education) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Education</h3>
                <div className="space-y-3">
                  {(app.education || app.jobSeeker?.education || []).map((ed: any, ii: number) => (
                    <div key={ii}>
                      <p className="text-sm font-medium text-gray-900">{ed.degree || ed.course || ed.title}</p>
                      <p className="text-sm text-gray-500">{ed.institution || ed.school}</p>
                      {ed.description && <p className="text-sm text-gray-600">{ed.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ===== Right Column ===== */}
          <div className="space-y-6">
            {/* Quick actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick actions</h3>
              <div className="flex flex-col space-y-3">
                <a
                  href={resumeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-linear-to-r from-[#00A3FF] to-[#00E0FF] hover:opacity-90 transition-all"
                >
                  <FileText className="h-4 w-4 text-white" />
                  View resume
                </a>

                <a
                  href={resumeHref}
                  download={resumeFilename}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#00A3FF] text-[#00A3FF] bg-white text-sm font-medium rounded-md shadow-md hover:bg-blue-50 transition-all"
                >
                  <FileText className="h-4 w-4 text-[#00A3FF]" />
                  Download resume
                </a>

                {u.email && (
                  <a
                    href={`mailto:${u.email}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 bg-white text-sm font-medium rounded-md shadow-sm hover:bg-gray-50 transition-all"
                  >
                    <Mail className="h-4 w-4 text-gray-500" />
                    Send email
                  </a>
                )}
                {u.phone && (
                  <a
                    href={`tel:${u.phone}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 bg-white text-sm font-medium rounded-md shadow-sm hover:bg-gray-50 transition-all"
                  >
                    <Phone className="h-4 w-4 text-gray-500" />
                    Call candidate
                  </a>
                )}
              </div>
            </div>

            {/* Update status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update status</h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => saveStatus("Under Review")}
                    disabled={isSaving}
                    className="w-full text-left px-4 py-2 rounded-md border bg-white text-[#155DFC] font-medium hover:bg-blue-50"
                  >
                    Move to review
                  </button>

                  <button
                    onClick={() => saveStatus("Interview")}
                    disabled={isSaving}
                    className="w-full text-left px-4 py-2 rounded-md border bg-[#F3F8FF] text-[#155DFC] font-medium hover:bg-blue-50"
                  >
                    Shortlist candidate
                  </button>

                  <button
                    onClick={() => saveStatus("Offered")}
                    disabled={isSaving}
                    className="w-full text-left px-4 py-2 rounded-md border bg-[#ECFDF5] text-[#065F46] font-medium hover:bg-green-50"
                  >
                    Accept candidate
                  </button>

                  <button
                    onClick={() => saveStatus("Rejected")}
                    disabled={isSaving}
                    className="w-full text-left px-4 py-2 rounded-md border bg-[#FFF1F2] text-[#9F1239] font-medium hover:bg-red-50"
                  >
                    Reject application
                  </button>
                </div>
              </div>
            </div>

            {/* Rating Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rate candidate</h3>
              <div className="space-y-4">
                <StarRating rating={rating} setRating={(newRating) => saveRating(newRating)} readOnly={isSaving} />
                <p className="text-sm text-gray-500">{rating ? `Current rating: ${rating} star${rating > 1 ? "s" : ""}` : "Not yet rated"}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom action buttons similar to design */}
        <div className="max-w-7xl mx-auto p-6 mt-4">
          <div className="flex justify-end gap-3">
            <button
              onClick={async () => {
                await saveStatus("Interview");
                router.back();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-[#00A3FF] to-[#00E0FF] text-white rounded-md shadow-md hover:opacity-95"
            >
              Shortlist & Close
            </button>

            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md bg-white text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
