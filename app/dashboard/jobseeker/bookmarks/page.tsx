"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { Bookmark, MapPin, Briefcase } from "lucide-react";

export default function SavedJobs() {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        fetch("http://localhost:5000/api/saved-jobs/saved-jobs", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setSavedJobs(data.data?.items || []))
            .finally(() => setLoading(false));
    }, []);

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500 animate-pulse">Loading saved jobs...</p>
            </div>
        );

    if (!savedJobs.length)
        return (
            <>
                <Navbar />
                <div className="p-8 text-center">
                    <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                        You haven’t saved any jobs yet.
                    </p>
                    <p className="text-sm text-gray-400">
                        Browse listings and tap the <Bookmark className="inline w-4 h-4 text-gray-400" /> icon to save them.
                    </p>
                </div>
            </>
        );

    return (
        <>
            <Navbar />
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                        <Bookmark className="w-6 h-6 text-purple-600" />
                        Saved Jobs
                    </h1>
                    <p className="text-sm text-gray-500">
                        {savedJobs.length} {savedJobs.length === 1 ? "Job" : "Jobs"}
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {savedJobs.map(({ job }: any) => (
                        <div
                            key={job._id}
                            onClick={() =>
                                router.push(`/dashboard/jobseeker/jobs/${job._id}/view`)
                            }
                            className="group border rounded-2xl p-5 bg-white shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600">
                                        {job.title}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {job.specialization || "General"}
                                    </p>
                                </div>
                                <Bookmark className="w-5 h-5 text-purple-500" />
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
                                {job.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>
                                            {job.location.city}, {job.location.state}
                                        </span>
                                    </div>
                                )}
                                {job.experienceRequired && (
                                    <div className="flex items-center gap-1">
                                        <Briefcase className="w-4 h-4" />
                                        <span>
                                            {job.experienceRequired.minYears} -{" "}
                                            {job.experienceRequired.maxYears} yrs
                                        </span>
                                    </div>
                                )}
                                {job.isRemote && (
                                    <span className="text-green-600 font-medium">Remote</span>
                                )}
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    Salary:{" "}
                                    <b>
                                        {job.salary?.min} - {job.salary?.max} {job.salary?.currency}
                                    </b>
                                </span>
                                <button
                                    className="text-sm text-purple-600 font-medium hover:underline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/dashboard/jobseeker/jobs/${job._id}/view`);
                                    }}
                                >
                                    View Details →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
