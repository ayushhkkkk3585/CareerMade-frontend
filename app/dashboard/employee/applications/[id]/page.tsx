"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type User = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  role?: string;
};

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<string>("");
  const [rating, setRating] = useState<number | "">("");
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", []);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${apiBase}/api/applications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to load application");
        const application = json.data?.application || json.data || json;
        setApp(application);
        setStatus(application.status || "Applied");
        setRating(typeof application.rating === "number" ? application.rating : "");
      } catch (e: any) {
        setError(e.message || "Failed to load application");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id, apiBase]);

  const saveStatus = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${apiBase}/api/applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update status");
      alert("Status updated");
    } catch (e: any) {
      alert(e.message || "Failed to update status");
    }
  };

  const saveRating = async () => {
    try {
      if (rating === "") return;
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${apiBase}/api/applications/${id}/rating`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ rating: Number(rating) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to set rating");
      alert("Rating saved");
    } catch (e: any) {
      alert(e.message || "Failed to set rating");
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!app) return <div className="p-6">Not found</div>;

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
  const coverLetterText = toText(app.coverLetter) || "No cover letter";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Application Details</h1>
        <button className="border px-3 py-2 rounded" onClick={() => router.back()}>Back</button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="border rounded-xl p-4">
            <div className="flex items-center gap-3">
              {u.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u.profileImage} alt={fullName} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200" />
              )}
              <div>
                <div className="font-medium">{fullName}</div>
                <div className="text-sm text-gray-600">{u.email}</div>
                <div className="text-sm text-gray-600">{u.phone}</div>
              </div>
            </div>
          </div>

          <div className="border rounded-xl p-4">
            <div className="font-medium mb-2">Resume</div>
            {resumeHref ? (
              <a href={resumeHref} target="_blank" className="text-blue-600 underline" rel="noreferrer">Open Resume</a>
            ) : (
              <div className="text-gray-500">No resume provided</div>
            )}
          </div>

          <div className="border rounded-xl p-4">
            <div className="font-medium mb-2">Cover Letter</div>
            <div className="text-sm whitespace-pre-wrap">{coverLetterText}</div>
          </div>

          {Array.isArray(app.answers) && app.answers.length > 0 && (
            <div className="border rounded-xl p-4">
              <div className="font-medium mb-2">Answers</div>
              <div className="space-y-2">
                {app.answers.map((ans: any, i: number) => (
                  <div key={i} className="text-sm">
                    <div className="text-gray-500">Q: {toText(ans.question)}</div>
                    <div>A: {toText(ans.answer)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(app.history) && app.history.length > 0 && (
            <div className="border rounded-xl p-4">
              <div className="font-medium mb-2">History</div>
              <ul className="text-sm list-disc ml-5">
                {app.history.map((h: any, i: number) => (
                  <li key={i}>{h.status} · {new Date(h.at).toLocaleString()}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="border rounded-xl p-4">
            <div className="font-medium mb-2">Status</div>
            <select className="border rounded px-3 py-2 w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Applied</option>
              <option>Under Review</option>
              <option>Interview</option>
              <option>Offered</option>
              <option>Rejected</option>
            </select>
            <button className="mt-3 w-full bg-[#8F59ED] text-white rounded px-3 py-2" onClick={saveStatus}>Save Status</button>
          </div>

          <div className="border rounded-xl p-4">
            <div className="font-medium mb-2">Rating</div>
            <select className="border rounded px-3 py-2 w-full" value={rating} onChange={(e) => setRating(e.target.value ? Number(e.target.value) : "") }>
              <option value="">No rating</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
            <button className="mt-3 w-full border rounded px-3 py-2" onClick={saveRating}>Save Rating</button>
          </div>
        </div>
      </div>
    </div>
  );
}
