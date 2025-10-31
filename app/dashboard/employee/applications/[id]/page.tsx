"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft, Star, FileText, Mail, Phone, ChevronDown, XCircle, CheckCircle } from "lucide-react";
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

const StarRating = ({ rating, setRating, readOnly = false }: { rating: number; setRating?: (rating: number) => void; readOnly?: boolean }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && setRating && setRating(star)}
          className={`${!readOnly ? 'cursor-pointer' : 'cursor-default'} ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          <Star className={`w-5 h-5 ${star <= rating ? 'fill-current' : ''}`} />
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
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", []);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${apiBase}/api/applications/${id}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to load application");
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

  const saveStatus = async (newStatus: string) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${apiBase}/api/applications/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update status");
      setStatus(newStatus);
      setApp({...app, status: newStatus});
      toast.success("Status updated successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    } finally {
      setIsSaving(false);
    }
  };

  const saveRating = async (newRating: number) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${apiBase}/api/applications/${id}/rating`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
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

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">Loading…</div>
    </div>
  );
  
  if (error || !app) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 text-red-600">
        {error || "Application not found"}
      </div>
    </div>
  );

  const u: User = app?.jobSeeker?.user || {};
  const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ") || "Applicant";

  const toText = (v: any): string => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
    if (Array.isArray(v)) return v.map(toText).join(" ");
    if (typeof v === "object") {
      if (typeof v.text === "string") return v.text;
      if (Array.isArray(v.blocks)) return v.blocks.map(toText).join(" ");
      try { return JSON.stringify(v); } catch { return ""; }
    }
    return String(v);
  };

  const resumeHref = typeof app.resume === "string" ? app.resume : app.resume?.url;
  const coverLetterText = toText(app.coverLetter) || "No cover letter provided";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#8F59ED] hover:text-[#7c4dd4] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Applications
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
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
                    <h2 className="text-xl font-semibold text-gray-900">{fullName}</h2>
                    <div className="mt-1 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{u.email || 'No email provided'}</span>
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

            {resumeHref && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-[#8F59ED]" />
                  Resume
                </h3>
                <a
                  href={resumeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#8F59ED] hover:bg-[#7c4dd4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8F59ED]"
                >
                  View Resume
                </a>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cover Letter</h3>
              <div className="prose max-w-none text-gray-600">
                {coverLetterText.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4 last:mb-0">
                    {paragraph || <br />}
                  </p>
                ))}
              </div>
            </div>

            {Array.isArray(app.answers) && app.answers.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Screening Questions</h3>
                <div className="space-y-6">
                  {app.answers.map((ans: any, i: number) => (
                    <div key={i} className="border-l-4 border-[#8F59ED] pl-4 py-1">
                      <h4 className="font-medium text-gray-900">{toText(ans.question)}</h4>
                      <p className="mt-1 text-gray-600">{toText(ans.answer)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(app.history) && app.history.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Activity History</h3>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {app.history.map((h: any, i: number) => (
                      <li key={i}>
                        <div className="relative pb-8">
                          {i !== app.history.length - 1 ? (
                            <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span
                                className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                  h.status === 'Rejected' ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'
                                }`}
                              >
                                {h.status === 'Rejected' ? (
                                  <XCircle className="h-5 w-5" />
                                ) : (
                                  <CheckCircle className="h-5 w-5" />
                                )}
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div>
                                <p className="text-sm text-gray-500">
                                  Status changed to <span className="font-medium text-gray-900">{h.status}</span>
                                </p>
                              </div>
                              <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                <time dateTime={new Date(h.at).toISOString()}>
                                  {new Date(h.at).toLocaleString()}
                                </time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
              <div className="space-y-4">
                <div className="relative group">
                  <button 
                    className={`inline-flex items-center justify-between w-full px-4 py-2 rounded-md border ${
                      statusColors[status] || statusColors.default
                    }`}
                  >
                    <span>{status}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
                    <div className="py-1">
                      {Object.entries(statusColors).map(([statusValue, statusClass]) => (
                        <button
                          key={statusValue}
                          onClick={() => saveStatus(statusValue)}
                          disabled={isSaving}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            status === statusValue 
                              ? 'bg-gray-100 text-gray-900' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {statusValue}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rate Candidate</h3>
              <div className="space-y-4">
                <StarRating 
                  rating={rating} 
                  setRating={(newRating) => saveRating(newRating)}
                  readOnly={isSaving}
                />
                <p className="text-sm text-gray-500">
                  {rating ? `Rated ${rating} star${rating > 1 ? 's' : ''}` : "Not yet rated"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}