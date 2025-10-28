"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Briefcase, Clock, MapPin, DollarSign, Home, ChevronLeft } from "lucide-react";

export default function JobViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!id || !token) return;

    fetch(`http://localhost:5000/api/jobs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const jobData = data.data?.job || data.data || data;
        setJob(jobData);
      })
      .catch((err) => console.error("Error fetching job:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 text-lg">
        Loading job details...
      </div>
    );

  if (!job)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 text-lg">
        Job not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f9f8ff] py-10 px-6 flex justify-center">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-md border border-gray-100 p-8 transition-all hover:shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Briefcase className="text-blue-600 w-7 h-7" />
            {job.title}
          </h1>

          <span
            className={`px-3 py-1 text-sm rounded-full font-medium ${
              job.status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {job.status || "Active"}
          </span>
        </div>

        {/* Job Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-5 h-5 text-blue-500" />
            <span>
              {job.location?.city}, {job.location?.state || "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-5 h-5 text-purple-500" />
            <span>
              {job.experienceRequired
                ? `${job.experienceRequired.minYears}-${job.experienceRequired.maxYears} yrs`
                : "Experience N/A"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span>
              {job.salary
                ? `${job.salary.min} - ${job.salary.max} ${job.salary.currency} (${job.salary.period})`
                : "Salary N/A"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Home className="w-5 h-5 text-indigo-500" />
            <span>{job.isRemote ? "Remote" : "On-site"}</span>
          </div>
        </div>

        {/* Job Details */}
        <div className="border-t border-gray-200 pt-6 space-y-4">
          <p>
            <span className="font-semibold text-gray-800">Specialization:</span>{" "}
            {job.specialization || "N/A"}
          </p>

          <p>
            <span className="font-semibold text-gray-800">Job Type:</span>{" "}
            {job.jobType || "N/A"}
          </p>

          <p>
            <span className="font-semibold text-gray-800">Shift:</span>{" "}
            {job.shift || "N/A"}
          </p>

          <div>
            <span className="font-semibold text-gray-800">Description:</span>
            <p className="mt-1 text-gray-600 whitespace-pre-line">
              {job.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end items-center gap-4 mt-8">
          <button
            onClick={() => router.push("/dashboard/employee/jobs")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
          >
            <ChevronLeft size={18} />
            Back
          </button>

          <button
            onClick={() =>
              router.push(`/dashboard/employee/jobs/edit/${id}`)
            }
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-full font-medium shadow-md transition-transform hover:scale-105"
          >
            Edit Job
          </button>
        </div>
      </div>
    </div>
  );
}
