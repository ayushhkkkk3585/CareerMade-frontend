"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { Briefcase, MapPin, Clock } from "lucide-react";

export default function JobSeekerLayout() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch("http://localhost:5000/api/jobs?limit=4", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setJobs(data.data?.items || data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="relative bg-[#1A0152] text-white rounded-2xl overflow-hidden shadow-lg p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div
              className="absolute inset-0 bg-no-repeat bg-left-bottom bg-contain opacity-40"
              style={{ backgroundImage: "url('/bg.png')" }}
            ></div>

            <div className="relative z-10">
              <h1 className="text-3xl font-bold">
                Job <span className="italic text-[#CBA2FF] font-light">Seeker Dashboard</span>
              </h1>
              <p className="text-sm text-gray-200 mt-2">
                Explore opportunities, track your applications, and manage your profile.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap gap-3 mt-6 sm:mt-0">
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

        {/* Recent Jobs */}
        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-600" />
              Recent Jobs
            </h2>
            <button
              onClick={() => router.push("/dashboard/jobseeker/jobs")}
              className="text-sm font-medium text-purple-600 hover:underline"
            >
              View All →
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-gray-500 animate-pulse">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
              <p className="text-sm text-gray-500 mb-6">
                Browse listings to start applying today.
              </p>
              <button
                onClick={() => router.push("/dashboard/jobseeker/jobs")}
                className="px-5 py-2.5 bg-[#8F59ED] hover:bg-[#7c4dd4] text-white rounded-lg text-sm font-medium transition-colors"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  onClick={() => router.push(`/dashboard/jobseeker/jobs/${job._id}/view`)}
                  className="group border-[1px] border-gray-400 rounded-2xl p-5 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {job.specialization || "General"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {job.location
                          ? `${job.location.city || ""}, ${job.location.state || ""}`
                          : "Location not specified"}
                      </span>
                    </div>
                    {job.experienceRequired && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {job.experienceRequired.minYears}-{job.experienceRequired.maxYears} yrs
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      💰 {job.salary?.min} - {job.salary?.max} {job.salary?.currency}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/jobseeker/jobs/${job._id}/view`);
                      }}
                      className="text-sm text-purple-600 font-medium hover:underline"
                    >
                      View Details →
                    </button>
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
