"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, Briefcase, DollarSign, Clock, Building2 } from "lucide-react";
import Navbar from "@/app/components/Navbar";

export default function JobViewPage() {
    const { id } = useParams();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [resume, setResume] = useState<any>(null);
    const [coverLetter, setCoverLetter] = useState<any>(null);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.warn("[JobView] No accessToken found in localStorage");
            return;
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`;
        console.log("[JobView] Fetching job", { id, url });

        fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                console.log("[JobView] Response", { status: res.status, ok: res.ok });
                return res
                    .json()
                    .catch((e) => {
                        console.error("[JobView] Failed to parse JSON", e);
                        throw e;
                    });
            })
            .then((data) => {
                console.log("[JobView] Raw payload", data);
                const dataLayer = data?.data ?? data;
                const base = dataLayer?.job ?? dataLayer; // unwrap if API returns { data: { job: {...} } }
                const salary = base?.salary ?? {};
                const exp = base?.experienceRequired ?? {};
                const normalized = {
                    ...base,
                    organization: base?.organization ?? base?.organizationName,
                    salary: {
                        min: salary?.min ?? salary?.amountMin ?? salary?.minimum ?? null,
                        max: salary?.max ?? salary?.amountMax ?? salary?.maximum ?? null,
                        currency: salary?.currency ?? salary?.currencyCode ?? salary?.curr,
                    },
                    experienceRequired: {
                        minYears: exp?.minYears ?? exp?.min ?? exp?.minimum ?? null,
                        maxYears: exp?.maxYears ?? exp?.max ?? exp?.maximum ?? null,
                    },
                };
                console.log("[JobView] Normalized job", normalized);
                setJob(normalized);
            })
            .catch((err) => {
                console.error("[JobView] Error while loading job details", err);
                setMessage("Failed to load job details.");
            })
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                const js = data?.data?.jobSeeker ?? data?.jobSeeker ?? data;
                setResume(js?.resume ?? null);
                setCoverLetter(js?.coverLetter ?? null);
                console.log("[JobView] Profile files", { resume: js?.resume, coverLetter: js?.coverLetter });
            })
            .catch((e) => console.error("[JobView] Failed to load profile", e));
    }, []);

    const handleUploadResume = async (file: File) => {
        try {
            setUploadingResume(true);
            const token = localStorage.getItem("accessToken");
            const fd = new FormData();
            fd.append("resume", file);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/resume`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            const data = await res.json();
            setResume(data?.data?.resume ?? data?.resume ?? null);
            setMessage(data?.message || "Resume uploaded");
        } catch (e) {
            setMessage("Failed to upload resume");
        } finally {
            setUploadingResume(false);
        }
    };

    const handleDeleteResume = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/resume`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setResume(null);
            setMessage(data?.message || (res.ok ? "Resume deleted" : "Failed to delete resume"));
        } catch (e) {
            setMessage("Failed to delete resume");
        }
    };

    const handleUploadCover = async (file: File) => {
        try {
            setUploadingCover(true);
            const token = localStorage.getItem("accessToken");
            const fd = new FormData();
            fd.append("coverLetter", file);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/cover-letter`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            const data = await res.json();
            setCoverLetter(data?.data?.coverLetter ?? data?.coverLetter ?? null);
            setMessage(data?.message || "Cover letter uploaded");
        } catch (e) {
            setMessage("Failed to upload cover letter");
        } finally {
            setUploadingCover(false);
        }
    };

    const handleDeleteCover = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/cover-letter`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setCoverLetter(null);
            setMessage(data?.message || (res.ok ? "Cover letter deleted" : "Failed to delete cover letter"));
        } catch (e) {
            setMessage("Failed to delete cover letter");
        }
    };

    const applyJob = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}/apply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ coverLetter: "Excited to apply!" }),
            });
            const data = await res.json();
            setMessage(data.message || "Application submitted successfully!");
        } catch {
            setMessage("Something went wrong while applying.");
        }
    };

    const saveJob = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/saved-jobs/jobs/${id}/save`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = await res.json();
            setMessage(data.message || "Job saved successfully!");
        } catch {
            setMessage("Failed to save job.");
        }
    };

    if (loading)
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-[#8F59ED] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading job details...</p>
                </div>
            </div>
        );

    if (!job)
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <p className="text-gray-600 text-lg">Job not found.</p>
            </div>
        );

    return (
        <>
        <Navbar/>
            <div className="max-w-4xl mx-auto px-6 py-10">
                {/* Job Header */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {job.title || "Untitled Job"}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        {job.organization && (
                            <span className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" /> {job.organization}
                            </span>
                        )}
                        {job.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {`${job.location?.city ?? ""}, ${job.location?.state ?? ""}, ${job.location?.country ?? ""}`}
                            </span>
                        )}
                        {job.shift && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" /> {job.shift}
                            </span>
                        )}
                    </div>
                </div>

                {/* Job Details */}
                <div className="space-y-4 text-gray-700 leading-relaxed">
                    {job.description && (
                        <p className="text-gray-800">{job.description}</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
                        <p>
                            <span className="font-semibold">Specialization:</span>{" "}
                            {job.specialization || "N/A"}
                        </p>
                        <p>
                            <span className="font-semibold">Experience:</span>{" "}
                            {job.experienceRequired && (job.experienceRequired.minYears ?? job.experienceRequired.maxYears) !== undefined
                                ? `${job.experienceRequired.minYears ?? "?"} - ${job.experienceRequired.maxYears ?? "?"} years`
                                : "Not specified"}
                        </p>
                        <p className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold">Salary:</span>{" "}
                            {job.salary && (job.salary.min ?? job.salary.max) !== undefined
                                ? `${job.salary.min ?? "?"} - ${job.salary.max ?? "?"} ${job.salary.currency ?? ""}`
                                : "Not specified"}
                        </p>
                        <p>
                            <span className="font-semibold">Remote:</span>{" "}
                            {job.isRemote ? "Yes" : "No"}
                        </p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap gap-4 mt-8">
                    <button
                        onClick={applyJob}
                        className="px-6 py-2.5 bg-[#8F59ED] hover:bg-[#7c4dd4] text-white text-sm font-medium rounded-lg transition-all shadow-md"
                    >
                        Apply Now
                    </button>
                    <button
                        onClick={saveJob}
                        className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg transition-all shadow-md"
                    >
                        Save Job
                    </button>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4">
                        <div className="font-semibold mb-2">Resume</div>
                        {resume ? (
                            <div className="flex items-center justify-between text-sm">
                                <a href={resume.url} target="_blank" rel="noreferrer" className="text-[#8F59ED] hover:underline">
                                    {resume.filename || "View resume"}
                                </a>
                                <button onClick={handleDeleteResume} className="text-red-600 hover:underline">Delete</button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-sm">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt,.rtf"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleUploadResume(f);
                                    }}
                                    disabled={uploadingResume}
                                />
                                {uploadingResume && <span className="text-gray-500">Uploading...</span>}
                            </div>
                        )}
                    </div>

                    <div className="border rounded-lg p-4">
                        <div className="font-semibold mb-2">Cover Letter</div>
                        {coverLetter ? (
                            <div className="flex items-center justify-between text-sm">
                                <a href={coverLetter.url} target="_blank" rel="noreferrer" className="text-[#8F59ED] hover:underline">
                                    {coverLetter.filename || "View cover letter"}
                                </a>
                                <button onClick={handleDeleteCover} className="text-red-600 hover:underline">Delete</button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-sm">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt,.rtf"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleUploadCover(f);
                                    }}
                                    disabled={uploadingCover}
                                />
                                {uploadingCover && <span className="text-gray-500">Uploading...</span>}
                            </div>
                        )}
                    </div>
                </div>

                {message && (
                    <p className="mt-6 text-sm text-[#4A0D83] bg-purple-50 border border-purple-100 rounded-md p-3">
                        {message}
                    </p>
                )}
            </div>
        </>
    );
}
