"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Briefcase,
  Clock,
  MapPin,
  DollarSign,
  Home,
  ChevronLeft,
  Edit2,
  Zap,
  Tag,
  Layers,
  FileText,
  Globe,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";

const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 mt-0.5 text-gray-500">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-[15px] font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

export default function JobViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!id || !token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`, {
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
      <div className="flex items-center justify-center min-h-screen text-gray-600 text-lg bg-gray-50">
        <Zap className="w-6 h-6 animate-spin mr-2 text-blue-500" />
        Loading job details...
      </div>
    );

  if (!job)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 text-lg bg-gray-50">
        Job not found.
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-10">
          {/* Header Section */}
          <div className="border-b pb-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-snug mb-3 sm:mb-0">
                {job.title}
              </h1>

              <span
                className={`px-4 py-1.5 text-sm rounded-full font-semibold uppercase tracking-wide ${
                  job.status === "Active"
                    ? "bg-green-100 text-green-700 ring-1 ring-green-200"
                    : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"
                }`}
              >
                {job.status || "Active"}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>
                  <strong>Location:</strong>{" "}
                  {job.location?.city}, {job.location?.state || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-500" />
                <span>
                  <strong>Type:</strong> {job.jobType || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Key Information */}
          <div className="bg-gray-50 p-6 rounded-xl mb-10 border border-gray-100 shadow-inner">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Key Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <DetailItem
                icon={<DollarSign className="w-5 h-5 text-green-600" />}
                label="Salary Range"
                value={
                  job.salary
                    ? `${job.salary.min} - ${job.salary.max} ${job.salary.currency} (${job.salary.period})`
                    : "N/A"
                }
              />
              <DetailItem
                icon={<Clock className="w-5 h-5 text-purple-600" />}
                label="Experience Required"
                value={
                  job.experienceRequired
                    ? `${job.experienceRequired.minYears}-${job.experienceRequired.maxYears} yrs`
                    : "N/A"
                }
              />
              <DetailItem
                icon={<Home className="w-5 h-5 text-red-600" />}
                label="Work Arrangement"
                value={job.isRemote ? "Remote" : "On-site"}
              />
              <DetailItem
                icon={<Tag className="w-5 h-5 text-orange-600" />}
                label="Specialization"
                value={job.specialization || "N/A"}
              />
              <DetailItem
                icon={<Clock className="w-5 h-5 text-cyan-600" />}
                label="Shift"
                value={job.shift || "N/A"}
              />

            </div>
          </div>

          {/* Description */}
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              Job Description
            </h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {job.description || "No description provided."}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-8 border-t mt-10">
            <button
              onClick={() => router.push("/dashboard/employee/jobs")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-semibold transition hover:bg-gray-100"
            >
              <ChevronLeft size={20} />
              Back to Jobs
            </button>

            <button
              onClick={() => router.push(`/dashboard/employee/jobs/edit/${id}`)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#8F59ED] text-white px-6 py-2.5 rounded-full font-semibold shadow-md hover:bg-[#7449c0] hover:shadow-lg transition-all"
            >
              <Edit2 size={20} />
              Edit Job
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
