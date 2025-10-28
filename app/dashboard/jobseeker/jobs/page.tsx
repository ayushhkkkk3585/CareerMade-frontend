"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { MapPin, Briefcase, Bookmark } from "lucide-react";

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch("http://localhost:5000/api/jobs?limit=30", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setJobs(data.data?.items || data.items || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="relative bg-[#1A0152] text-white rounded-xl overflow-hidden px-6 py-8 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div
                className="absolute inset-0 bg-no-repeat bg-left-bottom bg-contain opacity-40"
                style={{ backgroundImage: "url('/bg.png')" }}
              ></div>

              <div className="relative z-10">
                <h1 className="text-3xl font-semibold leading-tight">
                  Browse{" "}
                  <span className="italic text-[#CBA2FF] font-light">
                    Jobs
                  </span>
                </h1>
                <p className="text-sm text-gray-200 mt-1">
                  Explore thousands of healthcare jobs tailored for you
                </p>
              </div>

              <div className="relative z-10">
                <button
                  onClick={() => router.back()}
                  className="px-5 py-2.5 bg-[#CBA2FF] hover:bg-[#B482FF] text-[#1A0152] rounded-lg text-sm font-semibold transition-all shadow-lg"
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-gray-500 animate-pulse">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No jobs found
              </h3>
              <p className="text-sm text-gray-500">
                Try again later or update your search filters
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  onClick={() =>
                    router.push(`/dashboard/jobseeker/jobs/${job._id}/view`)
                  }
                  className="group border-[1px] border-gray-400 rounded-2xl p-5 bg-white shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
                >
                  {/* Job Header */}
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

                  {/* Job Meta */}
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

                  {/* Salary & CTA */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Salary:{" "}
                      <b>
                        {job.salary?.min} - {job.salary?.max}{" "}
                        {job.salary?.currency}
                      </b>
                    </span>
                    <button
                      className="text-sm text-purple-600 font-medium hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/dashboard/jobseeker/jobs/${job._id}/view`
                        );
                      }}
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
