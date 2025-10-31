"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Pencil,
  Trash2,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Location {
  city?: string;
  state?: string;
}
interface Experience {
  minYears?: number;
  maxYears?: number;
}
interface Salary {
  min?: number;
  max?: number;
  currency?: string;
}
interface Job {
  _id: string;
  title?: string;
  organizationName?: string;
  specialization?: string;
  location?: Location;
  experienceRequired?: Experience;
  salary?: Salary;
}
interface EmployerProfile {
  _id: string;
  name: string;
  email: string;
  companyName?: string;
}

export default function JobsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const headerColors = ["#1A0152", "#9333EA", "#16A34A", "#0F172A"];

  // 🔹 Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const jobsPerPage = 6;

  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = jobs.slice(startIndex, startIndex + jobsPerPage);

  // ✅ Fetch all jobs
  useEffect(() => {
    const fetchJobs = async (): Promise<void> => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;
        if (!token) {
          toast.error("Please login first");
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/jobs?limit=20`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await res.json();
        if (res.ok) {
          setJobs(data.data?.items || data.items || []);
        } else {
          toast.error(data.message || "Failed to fetch jobs");
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        toast.error("Something went wrong while fetching jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // ✅ Fetch employer profile
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfile = async (): Promise<void> => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/employer/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();

        if (res.ok) {
          setProfile(data.data.employer);
        } else {
          setError(data.message || "Profile not found");
        }
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // ✅ Handle delete
  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (!token) {
      toast.error("Unauthorized");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (res.ok) {
        setJobs((prev) => prev.filter((job) => job._id !== id));
        toast.success("Job deleted successfully");
      } else {
        toast.error(data.message || "Failed to delete job");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Something went wrong while deleting the job");
    }
  };

  const formatSalary = (amount?: number): string => {
    if (!amount) return "—";
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
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
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="min-h-screen max-w-7xl mx-auto bg-white">
        {/* ===== HEADER ===== */}
        <div className="border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-6">
          <div className="w-full bg-[#1A0152] text-white relative rounded-xl overflow-hidden">
            <div
              className="absolute inset-0 bg-no-repeat bg-cover bg-center opacity-40"
              style={{ backgroundImage: "url('/bg.png')" }}
            ></div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-semibold leading-tight">
                  Job{" "}
                  <span className="italic text-[#CBA2FF] font-light">
                    Postings
                  </span>
                </h1>
                <p className="text-sm text-gray-200 mt-1">
                  Manage and track your job listings effortlessly
                </p>
              </div>

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

        {/* ===== JOB CARDS ===== */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No jobs posted yet
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Create your first job posting to start receiving applications
              </p>
              <button
                onClick={() => router.push("/dashboard/employee/jobs/create")}
                className="px-5 py-2.5 bg-[#8F59ED] hover:bg-[#7c4dd4] text-white rounded-lg text-sm font-medium transition-colors"
              >
                Create Job
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {currentJobs.map((job, index) => {
                  const headerColor = headerColors[index % headerColors.length];
                  return (
                    <div
                      key={job._id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 relative"
                    >
                      <div className="relative mb-5">
                        <div
                          className="w-full h-20 rounded-lg"
                          style={{ backgroundColor: headerColor }}
                        ></div>
                        <div className="absolute -bottom-6 left-6">
                          <div className="w-14 h-14 rounded-full bg-white p-1 shadow-md flex items-center justify-center">
                            <div
                              className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                              style={{ backgroundColor: headerColor }}
                            >
                              <img
                                src="/card.png"
                                alt="Hospital Logo"
                                className="w-2/4 h-2/4 object-contain"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 mb-3">
                        <h3 className="text-xl font-bold leading-tight mb-1">
                          {job.title || "Untitled"}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">
                          Hospital
                        </p>
                      </div>

                      <div className="space-y-2 mb-3 text-sm text-gray-600">
                        <div>
                          📍 {job.location?.city || "—"},{" "}
                          {job.location?.state || ""}
                        </div>
                        <div>
                          💼 {job.experienceRequired?.minYears || "—"}–
                          {job.experienceRequired?.maxYears || "—"} yrs
                        </div>
                        <div>
                          💰 ₹{formatSalary(job.salary?.min)}–
                          ₹{formatSalary(job.salary?.max)}{" "}
                          {job.salary?.currency}
                        </div>
                      </div>

                      <div className="mb-5 pb-5 border-b border-gray-100">
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md">
                          {job.specialization || "Not specified"}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/employee/jobs/${job._id}/applications`
                          )
                        }
                        className="w-full mb-2 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:opacity-90"
                        style={{ backgroundColor: headerColor }}
                      >
                        View Applications
                      </button>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/employee/jobs/view/${job._id}`
                            )
                          }
                          className="border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-[#CBA2FF] hover:text-[#1A0152] py-2.5"
                        >
                          <Eye className="w-5 h-5 mx-auto" /> View
                        </button>

                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/employee/jobs/edit/${job._id}`
                            )
                          }
                          className="border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-[#CBA2FF] hover:text-[#1A0152] py-2.5"
                        >
                          <Pencil className="w-5 h-5 mx-auto" /> Edit
                        </button>

                        <button
                          onClick={() => handleDelete(job._id)}
                          className="border border-red-200 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 py-2.5"
                        >
                          <Trash2 className="w-5 h-5 mx-auto" /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 🔹 PAGINATION */}
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                   className="px-4 py-2 bg-gray-100 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-2 text-sm rounded-md ${currentPage === i + 1
                        ? "bg-[#8F59ED] text-white font-semibold"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-4 py-2 bg-gray-100 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
