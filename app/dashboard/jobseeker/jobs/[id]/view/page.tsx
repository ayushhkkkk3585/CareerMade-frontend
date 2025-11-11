"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, Briefcase, DollarSign, Clock, Building2, ArrowLeft, FileText, Trash2, Upload, CheckCircle, BookmarkPlus } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import GradientLoader from "@/app/components/GradientLoader";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Dialog } from "@headlessui/react";



export default function JobViewPage() {
    const { id } = useParams();
    const router = useRouter();
    const [hasApplied, setHasApplied] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);


    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [resume, setResume] = useState<any>(null);
    const [coverLetter, setCoverLetter] = useState<any>(null);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const user = localStorage.getItem("user");
        if (!token || !user) {
            router.push("/login");
            return;
        }
        const parsedUser = JSON.parse(user);
        if (parsedUser.role !== "jobseeker") {
            router.push("/login");
            return;
        }
    }, [router]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            toast.error("No access token found. Please log in first!");
            return;
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`;
        // console.log("[JobView] Fetching job", { id, url });

        fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                // console.log("[JobView] Response", { status: res.status, ok: res.ok });
                return res
                    .json()
                    .catch((e) => {
                        toast.error(`[JobView] Failed to parse JSON: ${String(e)}`);
                        throw e;
                    });
            })
            .then((data) => {
                // console.log("[JobView] Raw payload", data);
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
                // console.log("[JobView] Normalized job", normalized);
                setJob(normalized);
            })
            .catch((err) => {
                toast.error(`[JobView] Error while loading job details: ${String(err)}`);
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
                // console.log("[JobView] Profile files", { resume: js?.resume, coverLetter: js?.coverLetter });
            })
            .catch((e) => toast.error(`[JobView] Failed to load profile: ${String(e)}`));
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
            toast.success(data?.message || "Resume uploaded");
        } catch (e) {
            setMessage("Failed to upload resume");
            toast.error("Failed to upload resume");
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
            if (res.ok) toast.success(data?.message || "Resume deleted"); else toast.error(data?.message || "Failed to delete resume");
        } catch (e) {
            setMessage("Failed to delete resume");
            toast.error("Failed to delete resume");
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
            toast.success(data?.message || "Cover letter uploaded");
        } catch (e) {
            setMessage("Failed to upload cover letter");
            toast.error("Failed to upload cover letter");
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
            if (res.ok) toast.success(data?.message || "Cover letter deleted"); else toast.error(data?.message || "Failed to delete cover letter");
        } catch (e) {
            setMessage("Failed to delete cover letter");
            toast.error("Failed to delete cover letter");
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
            toast.success(data.message || "Application submitted successfully!");
        } catch {
            setMessage("Something went wrong while applying.");
            toast.error("Something went wrong while applying.");
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
            toast.success(data.message || "Job saved successfully!");
        } catch {
            setMessage("Failed to save job.");
            toast.error("Failed to save job.");
        }
    };

    //                 <p className="text-gray-600">Loading job details...</p>
    //             </div>
    //         </div>
    //     );
    if (loading)
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <GradientLoader />
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
            <Navbar />
            <div className="min-h-screen bg-white">
                {/* Header Banner */}
                <div className="border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="w-full bg-[#1A0152] text-white relative rounded-xl overflow-hidden shadow-lg">
                            <div
                                className="absolute inset-0 bg-no-repeat bg-cover bg-center opacity-40"
                                style={{ backgroundImage: "url('/new1.png')" }}
                            ></div>

                            <div className="relative z-10 px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                                <div className="flex-1">
                                    <h1 className="text-3xl font-semibold leading-tight mb-2">
                                        {job.title || "Job Details"}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-200">
                                        {job.organization && (
                                            <span className="flex items-center gap-1.5">
                                                <Building2 className="w-4 h-4" />
                                                {job.organization}
                                            </span>
                                        )}
                                        {job.location && (
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4" />
                                                {`${job.location?.city ?? ""}, ${job.location?.state ?? ""}`}
                                            </span>
                                        )}
                                        {job.shift && (
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                {job.shift}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* <div>
                                    <button
                                        onClick={() => window.history.back()}
                                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-[#1A0152] rounded-lg text-sm font-semibold transition-all shadow-lg"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Jobs
                                    </button>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Job Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Job Description Card */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
                                {job.description ? (
                                    <p className="text-gray-700 leading-relaxed">{job.description}</p>
                                ) : (
                                    <p className="text-gray-500 italic">No description available</p>
                                )}
                            </div>

                            {/* Job Details Card */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Job Details</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                                            <Briefcase className="w-5 h-5 text-[#1A0152]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Specialization</p>
                                            <p className="text-sm text-gray-900 font-semibold mt-0.5">
                                                {job.specialization || "Not specified"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                                            <Clock className="w-5 h-5 text-green-700" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Experience</p>
                                            <p className="text-sm text-gray-900 font-semibold mt-0.5">
                                                {job.experienceRequired && (job.experienceRequired.minYears ?? job.experienceRequired.maxYears) !== undefined
                                                    ? `${job.experienceRequired.minYears ?? "0"} - ${job.experienceRequired.maxYears ?? "0"} years`
                                                    : "Not specified"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                            <DollarSign className="w-5 h-5 text-blue-700" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Salary Range</p>
                                            <p className="text-sm text-gray-900 font-semibold mt-0.5">
                                                {job.salary && (job.salary.min ?? job.salary.max) !== undefined
                                                    ? `${job.salary.min ?? "N/A"} - ${job.salary.max ?? "N/A"} ${job.salary.currency ?? ""}`
                                                    : "Not specified"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                                            <MapPin className="w-5 h-5 text-orange-700" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Work Mode</p>
                                            <p className="text-sm text-gray-900 font-semibold mt-0.5">
                                                {job.isRemote ? "Remote" : "On-site"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Application Documents Card */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Application Documents</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Resume Card */}
                                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-[#1A0152] transition-colors">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText className="w-5 h-5 text-[#1A0152]" />
                                            <h3 className="font-semibold text-gray-900">Resume</h3>
                                        </div>
                                        {resume ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    <span className="font-medium">Uploaded</span>
                                                </div>
                                                <a
                                                    href={resume.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block text-sm text-[#1A0152] hover:text-[#9333EA] font-medium hover:underline truncate"
                                                >
                                                    {resume.filename || "View resume"}
                                                </a>
                                                <button
                                                    onClick={handleDeleteResume}
                                                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg cursor-pointer transition-all">
                                                    <Upload className="w-4 h-4" />
                                                    {uploadingResume ? "Uploading..." : "Upload Resume"}
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx,.txt,.rtf"
                                                        onChange={(e) => {
                                                            const f = e.target.files?.[0];
                                                            if (f) handleUploadResume(f);
                                                        }}
                                                        disabled={uploadingResume}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <p className="text-xs text-gray-500 text-center">PDF, DOC, DOCX, TXT, RTF</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cover Letter Card */}
                                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-[#1A0152] transition-colors">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText className="w-5 h-5 text-[#1A0152]" />
                                            <h3 className="font-semibold text-gray-900">Cover Letter</h3>
                                        </div>
                                        {coverLetter ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    <span className="font-medium">Uploaded</span>
                                                </div>
                                                <a
                                                    href={coverLetter.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block text-sm text-[#1A0152] hover:text-[#9333EA] font-medium hover:underline truncate"
                                                >
                                                    {coverLetter.filename || "View cover letter"}
                                                </a>
                                                <button
                                                    onClick={handleDeleteCover}
                                                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg cursor-pointer transition-all">
                                                    <Upload className="w-4 h-4" />
                                                    {uploadingCover ? "Uploading..." : "Upload Letter"}
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx,.txt,.rtf"
                                                        onChange={(e) => {
                                                            const f = e.target.files?.[0];
                                                            if (f) handleUploadCover(f);
                                                        }}
                                                        disabled={uploadingCover}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <p className="text-xs text-gray-500 text-center">PDF, DOC, DOCX, TXT, RTF</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Actions */}
                        <div className="space-y-6">
                            {/* Apply Card */}
                            <div className="bg-gradient-to-br from-[#0A2540] to-[#1976D2] rounded-xl shadow-lg p-6 text-white">
                                <h3 className="text-lg font-bold mb-2">Ready to Apply?</h3>
                                <p className="text-sm text-gray-200 mb-4">
                                    Submit your application now and take the next step in your career.
                                </p>
                                <button
                                    onClick={() => setIsApplyModalOpen(true)}
                                    className="w-full px-6 py-3 bg-white text-[#1A0152] hover:bg-[#00CFFF] text-sm font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Apply Now
                                </button>
                            </div>
                            <Dialog
                                open={isApplyModalOpen}
                                onClose={() => setIsApplyModalOpen(false)}
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                            >
                                <Dialog.Panel className="bg-white/90 backdrop-blur-md border border-white/30 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                                    <Dialog.Title className="text-lg font-bold text-gray-900 mb-4">
                                        Confirm Application
                                    </Dialog.Title>

                                    <p className="text-sm text-gray-700 mb-6">
                                        Please select or confirm your resume before applying.
                                    </p>

                                    {resume ? (
                                        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <FileText className="w-4 h-4 text-[#1A0152]" />
                                                <span>{resume.filename || "Resume uploaded"}</span>
                                            </div>
                                            <a
                                                href={resume.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 text-sm hover:underline"
                                            >
                                                View
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-600 mb-4">
                                            <p>No resume found.</p>
                                            <p className="text-xs mt-1">Please upload a resume before applying.</p>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            onClick={() => setIsApplyModalOpen(false)}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!resume) {
                                                    toast.error("Please select or upload a resume before applying!");
                                                    return;
                                                }
                                                applyJob();
                                                setIsApplyModalOpen(false);
                                            }}
                                            className="px-5 py-2 bg-[#1A0152] hover:bg-[#2B0D85] text-white rounded-lg text-sm font-semibold transition"
                                        >
                                            Submit Application
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Dialog>


                            {/* Save Job Card */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Save for Later</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Bookmark this job to review and apply later.
                                </p>
                                <button
                                    onClick={saveJob}
                                    className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    <BookmarkPlus className="w-5 h-5" />
                                    Save Job
                                </button>
                            </div>

                            {/* Quick Info Card */}
                            <div className="bg-purple-50 rounded-xl border border-purple-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Quick Info</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Job Type:</span>
                                        <span className="font-semibold text-gray-900">
                                            {job.isRemote ? "Remote" : "On-site"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shift:</span>
                                        <span className="font-semibold text-gray-900">{job.shift || "N/A"}</span>
                                    </div>
                                    {job.location?.country && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Country:</span>
                                            <span className="font-semibold text-gray-900">{job.location.country}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className="mt-6 text-sm text-[#1A0152] bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-sm">
                            <p className="font-medium">{message}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
