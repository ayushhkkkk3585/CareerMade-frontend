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

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        fetch(`http://localhost:5000/api/jobs/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setJob(data.data || data))
            .catch(() => setMessage("Failed to load job details."))
            .finally(() => setLoading(false));
    }, [id]);

    const applyJob = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:5000/api/jobs/${id}/apply`, {
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
                `http://localhost:5000/api/saved-jobs/jobs/${id}/save`,
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
                                {`${job.location.city || ""}, ${job.location.state || ""}, ${job.location.country || ""
                                    }`}
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
                            {job.experienceRequired
                                ? `${job.experienceRequired.minYears} - ${job.experienceRequired.maxYears} years`
                                : "Not specified"}
                        </p>
                        <p className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold">Salary:</span>{" "}
                            {job.salary
                                ? `${job.salary.min} - ${job.salary.max} ${job.salary.currency || ""}`
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

                {message && (
                    <p className="mt-6 text-sm text-[#4A0D83] bg-purple-50 border border-purple-100 rounded-md p-3">
                        {message}
                    </p>
                )}
            </div>
        </>
    );
}
