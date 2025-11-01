"use client";
import Navbar from "@/app/components/Navbar";
import { useEffect, useState, useRef } from "react";
import { Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MyApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const filterRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/me`, {
      headers: { Authorization: ` Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const items = data.data?.items || data.items || [];
        setAllApplications(items);
        setApplications(items);
      })
      .finally(() => setLoading(false));
  }, []);

  // close filter dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    }
    if (showFilter) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showFilter]);

  function toggleStatus(status: string) {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  }

  function applyFilters() {
    if (selectedStatuses.length === 0) {
      setApplications(allApplications);
    } else {
      setApplications(
        allApplications.filter((a) => selectedStatuses.includes(a.status || "Pending"))
      );
    }
    setShowFilter(false);
  }

  function resetFilters() {
    setSelectedStatuses([]);
    setApplications(allApplications);
  }

  return (
    <>
      <Navbar />
      <div className="w-full relative bg-[#002B6B] text-white overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{ backgroundImage: "url('/new1.png')" }}
        ></div>
        {/* Overlay (optional subtle gradient for text contrast) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#001b3e]/90 via-[#002b6b]/60 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left Text */}
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Track{" "}
              <span className="bg-gradient-to-r from-[#00A3FF] to-[#00E0FF] bg-clip-text text-transparent">
                Your Applications
              </span>
            </h1>
            <p className="text-base sm:text-lg text-blue-100 mt-3">
              Monitor your job application status and upcoming interviews in one place
            </p>
          </div>

          {/* Right Button */}
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => router.push("/dashboard/jobseeker")}
              className="px-5 py-2.5 bg-gradient-to-r from-[#00A3FF] to-[#00E0FF] text-[#1A0152] rounded-full text-sm font-semibold transition-all shadow-md flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </button>
          </div>

        </div>
      </div>
      <div className="min-h-screen max-w-7xl mx-auto bg-white">
        <div className="border-b mx-auto max-w-7xl border-gray-100 px-4 sm:px-6 lg:px-8 ">
        </div>
        {/* Filter toolbar (below banner) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end gap-3 py-6">
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilter((s) => !s)}
                className="px-4 py-2 bg-[#00A3FF] hover:bg-[#2b5de8] text-white rounded-lg text-sm font-medium transition-all shadow-md flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-1.447.894L9 18v-4.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filter
              </button>

              {showFilter && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border p-3 z-50 text-sm text-gray-700">
                  <div className="mb-2 font-semibold">Filter by status</div>
                  <div className="flex flex-col gap-2 mb-3">
                    {[
                      "Applied",
                      "Under Review",
                      "Interview",
                      "Hired",
                      "Rejected",
                    ].map((s) => (
                      <label key={s} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(s)}
                          onChange={() => toggleStatus(s)}
                          className="w-4 h-4 rounded"
                        />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={resetFilters}
                      className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
                    >
                      Reset
                    </button>
                    <button
                      onClick={applyFilters}
                      className="px-3 py-1 text-sm rounded  text-white bg-gradient-to-r from-[#00A3FF] to-[#00E0FF]"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
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
            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Job Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hospital</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Applied On</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Salary</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {applications.map((app: any) => {
                    const job = app.job || {};
                    return (
                      <tr key={app._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          {job.title || "Untitled Position"}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-600">
                          {job.organizationName || "Hospital"}
                        </td>
                        <td className="px-6 py-4 text-sm font-semiboldtext-gray-600">
                          {job.location
                            ? `${job.location.city || ""}, ${job.location.state || ""}`
                            : "—"}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-600">
                          {app.appliedAt
                            ? new Date(app.appliedAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-800">
                          {job.salary ? (
                            <>
                              {job.salary.currency === 'INR' && '₹'}
                              {job.salary.currency === 'USD' && '$'}
                              {job.salary.currency === 'EUR' && '€'}
                              {job.salary.currency === 'GBP' && '£'}

                              {job.salary.min?.toLocaleString()}–
                              {job.salary.max?.toLocaleString()}{' '}
                              {job.salary.period === 'Annual'
                                ? 'LPA'
                                : job.salary.period === 'Monthly'
                                  ? 'per month'
                                  : job.salary.period === 'Daily'
                                    ? 'per day'
                                    : 'per hour'}
                            </>
                          ) : (
                            'Not specified'
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${app.status === "Accepted"
                              ? "bg-green-50 text-green-700"
                              : app.status === "Rejected"
                                ? "bg-red-50 text-red-700"
                                : "bg-yellow-50 text-yellow-700"
                              }`}
                          >
                            {app.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}