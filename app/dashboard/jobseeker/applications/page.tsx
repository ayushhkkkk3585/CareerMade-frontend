"use client";
import Navbar from "@/app/components/Navbar";
import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setApplications(data.data?.items || data.items || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen max-w-7xl mx-auto bg-white">
        <div className="border-b mx-auto max-w-7xl border-gray-100 px-4 sm:px-6 lg:px-8 py-6">
          {/* full-width banner wrapper */}
          <div className="w-full bg-[#1A0152] text-white relative rounded-xl overflow-hidden shadow-md">
            <div
              className="absolute inset-0 bg-no-repeat bg-cover bg-center opacity-40"
              style={{ backgroundImage: "url('/bg.png')" }}
            ></div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-semibold leading-tight">
                  My{" "}
                  <span className="italic text-[#CBA2FF] font-light">
                    Applications
                  </span>
                </h1>
                <p className="text-sm text-gray-200 mt-1">
                  Track your submitted job applications and their current status
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
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
            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Job Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Specialization</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Applied On</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {applications.map((app: any) => {
                    const job = app.job || {};
                    return (
                      <tr key={app._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {job.title || "Untitled Position"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {job.specialization || "General"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {job.location
                            ? `${job.location.city || ""}, ${job.location.state || ""}`
                            : "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {app.appliedAt
                            ? new Date(app.appliedAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${app.status === "Accepted"
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
