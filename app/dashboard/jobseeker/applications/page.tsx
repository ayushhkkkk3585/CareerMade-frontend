"use client";
import Navbar from "@/app/components/Navbar";
import { useEffect, useState } from "react";
import { Briefcase, Clock, MapPin } from "lucide-react";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    fetch("http://localhost:5000/api/applications/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setApplications(data.data?.items || data.items || []))
      .catch((err) => console.error("Error fetching applications:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen max-w-7xl mx-auto bg-white">
        {/* Header */}
        <div className="border-b border-gray-100">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col gap-4">
              <div className="relative bg-[#1A0152] text-white rounded-xl overflow-hidden px-6 py-8 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div
                  className="absolute inset-0 bg-no-repeat bg-left-bottom bg-contain opacity-40"
                  style={{ backgroundImage: "url('/bg.png')" }}
                ></div>

                <div className="relative z-10">
                  <h1 className="text-3xl font-semibold leading-tight">
                    My <span className="italic text-[#CBA2FF] font-light">Applications</span>
                  </h1>
                  <p className="text-sm text-gray-200 mt-1">
                    Track your submitted job applications and their current status
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#8F59ED] rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your applications...</p>
              </div>
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                You haven’t applied to any jobs yet
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Start browsing to find a position that suits you best
              </p>
              <a
                href="/dashboard/jobseeker/jobs"
                className="px-5 py-2.5 bg-[#8F59ED] hover:bg-[#7c4dd4] text-white rounded-lg text-sm font-medium transition-colors"
              >
                Browse Jobs
              </a>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {applications.map((app) => {
                const job = app.job || {};
                return (
                  <div
                    key={app._id}
                    className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all"
                  >
                    <h2 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                      {job.title || "Untitled Position"}
                    </h2>
                    <p className="text-sm text-gray-600 mb-2">
                      {job.specialization || "General"}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                      <MapPin className="w-4 h-4" />
                      {job.location
                        ? `${job.location.city || ""}, ${job.location.state || ""}, ${job.location.country || ""}`
                        : "Location not specified"}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                      <Clock className="w-4 h-4" />
                      Applied on{" "}
                      {app.appliedAt
                        ? new Date(app.appliedAt).toLocaleDateString()
                        : "N/A"}
                    </p>

                    <span
                      className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${
                        app.status === "Accepted"
                          ? "bg-green-50 text-green-700"
                          : app.status === "Rejected"
                          ? "bg-red-50 text-red-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {app.status || "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
