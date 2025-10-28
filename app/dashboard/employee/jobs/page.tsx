"use client";
import { useEffect, useState } from "react";
import { Briefcase, MapPin, Clock, Pencil, Trash2, Eye, Users, Plus } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { useRouter } from "next/navigation";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
        if (!token) {
          alert("Please login first");
          return;
        }

        const res = await fetch("http://localhost:5000/api/jobs?limit=20", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setJobs(data.data?.items || data.items || []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
    if (!token) return alert("Unauthorized");

    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setJobs((prev) => prev.filter((job) => job._id !== id));
        alert("Job deleted successfully");
      } else alert(data.message || "Failed to delete job");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Something went wrong while deleting the job");
    }
  };

  const formatSalary = (amount) => {
    if (!amount) return "—";
    if (amount >= 100000) {
      return `${(amount / 100000).toFixed(1)}L`;
    }
    return amount.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#8F59ED] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen max-w-7xl mx-auto bg-white">
        {/* Header */}
        <div className="border-b border-gray-100">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col gap-4">

              {/* Header card with background */}
              <div
                className="relative bg-[#1A0152] text-white rounded-xl overflow-hidden px-6 py-8 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
              >
                

                {/* background pattern */}
                <div
                  className="absolute inset-0 bg-no-repeat bg-left-bottom bg-contain opacity-40"
                  style={{ backgroundImage: "url('/bg.png')" }}
                ></div>

                {/* text content */}
                <div className="relative z-10">
                  <h1 className="text-3xl font-semibold leading-tight">
                    Job <span className="italic text-[#CBA2FF] font-light">Postings</span>
                  </h1>
                  <p className="text-sm text-gray-200 mt-1">
                    Manage and track your job listings effortlessly
                  </p>
                </div>

                {/* Button (aligned to right on large screens) */}
                <div className="relative z-10">
                  <button
                    onClick={() => router.push("/dashboard/employee/jobs/create")}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#CBA2FF] hover:bg-[#B482FF] text-[#1A0152] rounded-lg text-sm font-semibold transition-all shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Create Job
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs posted yet</h3>
              <p className="text-sm text-gray-500 mb-6">Create your first job posting to start receiving applications</p>
              <button
                onClick={() => {
                  router.push("/dashboard/employee/jobs/create");
                }}
                className="px-5 py-2.5 bg-[#8F59ED] hover:bg-[#7c4dd4] text-white rounded-lg text-sm font-medium transition-colors"
              >
                Create Job
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all"
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                        {job.title}
                      </h3>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${job.status === "Active"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-50 text-gray-600"
                          }`}
                      >
                        {job.status || "Active"}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-[#8F59ED] mb-3">
                      {job.specialization}
                    </p>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {job.location?.city}, {job.location?.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {job.experienceRequired?.minYears}–{job.experienceRequired?.maxYears} years
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Salary Range</p>
                      <p className="text-base font-semibold text-gray-900">
                        ₹{formatSalary(job.salary?.min)} - ₹{formatSalary(job.salary?.max)} {job.salary?.currency}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          router.push(`/dashboard/employee/jobs/${job._id}/applications`);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#8F59ED] hover:bg-[#7c4dd4] text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        View Applications
                      </button>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => {
                            router.push(`/dashboard/employee/jobs/view/${job._id}`);
                          }}
                          className="flex items-center justify-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                        <button
                          onClick={() => {
                            router.push(`/dashboard/employee/jobs/edit/${job._id}`);
                          }}
                          className="flex items-center justify-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="flex items-center justify-center gap-1 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}