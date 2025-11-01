"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";

const SPECIALIZATIONS = [
  "General Medicine",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Gynecology",
  "Dermatology",
  "Psychiatry",
  "Radiology",
  "Anesthesiology",
  "Emergency Medicine",
  "Internal Medicine",
  "Surgery",
  "Oncology",
  "Pathology",
  "Ophthalmology",
  "ENT",
  "Urology",
  "Gastroenterology",
  "Pulmonology",
  "Endocrinology",
  "Rheumatology",
  "Nephrology",
  "Hematology",
  "Infectious Disease",
  "Physical Therapy",
  "Occupational Therapy",
  "Speech Therapy",
  "Nursing",
  "Pharmacy",
  "Medical Technology",
  "Other",
];

interface Job {
  _id: string;
  title?: string;
  organizationName?: string;
  location?: {
    city?: string;
    state?: string;
  };
  experienceRequired?: {
    minYears?: number;
    maxYears?: number;
  };
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  specialization?: string;
}

export default function JobSeekerLayout() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const headerColors = ["#1A0152", "#9333EA", "#16A34A", "#0F172A"];

  // Pagination state (client-side)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const jobsPerPage = 6; // adjust if needed

  // Fetch all jobs once (client-side pagination)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const jobList = data.data?.items || data.items || [];
        setJobs(jobList);
        setFilteredJobs(jobList);
        setCurrentPage(1);
      })
      .catch((err) => {
        console.error("Failed to fetch jobs:", err);
        setJobs([]);
        setFilteredJobs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter jobs by specialization (resets page)
  useEffect(() => {
    if (selectedSpecialization) {
      const filtered = jobs.filter(
        (job) =>
          job.specialization &&
          job.specialization.toLowerCase() ===
          selectedSpecialization.toLowerCase()
      );
      setFilteredJobs(filtered);
      setCurrentPage(1);
    } else {
      setFilteredJobs(jobs);
      setCurrentPage(1);
    }
  }, [selectedSpecialization, jobs]);

  // derived pagination values
  const totalJobs = filteredJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalJobs / jobsPerPage));
  // clamp currentPage in case filteredJobs changed
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="border-b mx-auto max-w-7xl border-gray-100 px-4 sm:px-6 lg:px-8 py-6">
          <div className="w-full bg-[#1A0152] text-white relative rounded-xl overflow-hidden shadow-md">
            <div
              className="absolute inset-0 bg-no-repeat bg-cover bg-center opacity-40"
              style={{ backgroundImage: "url('/bg.png')" }}
            ></div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-semibold leading-tight">
                  Job{" "}
                  <span className="italic text-[#CBA2FF] font-light">
                    Seeker Dashboard
                  </span>
                </h1>
                <p className="text-sm text-gray-200 mt-1">
                  Explore opportunities, track your applications, and manage your
                  profile.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => router.push("/dashboard/jobseeker/jobs")}
                  className="px-5 py-2.5 bg-[#CBA2FF] hover:bg-[#B482FF] text-[#1A0152] rounded-lg text-sm font-semibold transition-all shadow-md"
                >
                  Browse Jobs
                </button>
                <button
                  onClick={() => router.push("/dashboard/jobseeker/applications")}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all shadow-md"
                >
                  My Applications
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Jobs Section */}
        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            {/* Heading */}
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-600" />
              Recent Jobs
            </h2>

            {/* Filter Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <label
                htmlFor="specialization"
                className="text-sm font-medium text-gray-700 sm:whitespace-nowrap"
              >
                Filter by specialization
              </label>
              <div className="relative w-full sm:w-40 md:w-56">
                <select
                  id="specialization"
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm transition-all cursor-pointer"
                >
                  <option value="">All Specializations</option>
                  {SPECIALIZATIONS.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>

                {/* Dropdown Icon */}
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-gray-500 animate-pulse">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No jobs found
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Try changing the specialization filter or browse all listings.
              </p>
              <button
                onClick={() => router.push("/dashboard/jobseeker/jobs")}
                className="px-5 py-2.5 bg-[#8F59ED] hover:bg-[#7c4dd4] text-white rounded-lg text-sm font-medium transition-colors"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {currentJobs.map((job, index) => {
                  const headerColor = headerColors[index % headerColors.length];
                  return (
                    <div
                      key={job._id}
                      onClick={() =>
                        router.push(`/dashboard/jobseeker/jobs/${job._id}/view`)
                      }
                      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 w-full relative cursor-pointer"
                    >
                      {/* ===== Job Card ===== */}
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
                                src={"/card.png"}
                                alt="Company Logo"
                                className="w-2/4 h-2/4 object-contain"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start justify-between mt-8 mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold leading-tight mb-1">
                            {job.title || "Job Title"}
                          </h3>
                          <p className="text-sm text-gray-500 font-medium">
                            {job.organizationName || "Hospital"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        {job.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 text-gray-400 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="font-medium">
                              {job.location.city || "—"}, {job.location.state || ""}
                            </span>
                          </div>
                        )}

                        {job.experienceRequired && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 text-gray-400 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 6V4a2 2 0 00-2-2h-4a2"
                              />
                            </svg>
                            <span className="font-medium">
                              {job.experienceRequired.minYears || "—"}–
                              {job.experienceRequired.maxYears || "—"} years
                            </span>
                          </div>
                        )}

                        {job.salary && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 text-gray-400 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343"
                              />
                            </svg>
                            <span className="font-medium">
                              💰 {job.salary?.min} - {job.salary?.max} {job.salary?.currency}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-5 pb-5 border-b border-gray-100">
                        {job.specialization ? (
                          <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md">
                            {job.specialization}
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 bg-gray-50 text-gray-400 text-xs font-semibold rounded-md">
                            Not specified
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/jobseeker/jobs/${job._id}/view`);
                        }}
                        className="w-full rounded-xl"
                        style={{ backgroundColor: headerColor }}
                      >
                        <div className="text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:opacity-90">
                          <span>View Details</span>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-3 mt-10">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 bg-gray-100 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     <ChevronLeft className="w-4 h-4" />
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
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

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
