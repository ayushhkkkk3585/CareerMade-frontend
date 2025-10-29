"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { Eye } from "lucide-react";

export default function JobApplicationsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    const fetchApplications = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/applications/job/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();
        console.log("Fetched applications:", data);

        if (!res.ok) {
          console.error("Error fetching applications:", data.message);
          setApplications([]);
        } else {
          setApplications(data.data?.applications || []);
        }
      } catch (err) {
        console.error("Network error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchApplications();
  }, [id, router]);

  if (loading) return <p className="p-6">Loading applications...</p>;

  const totalPages = Math.ceil(applications.length / itemsPerPage);
  const paginatedApps = applications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Job Applications
        </h1>

        {applications.length === 0 ? (
          <p className="text-gray-600 text-center py-10">
            No applications received yet.
          </p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-50 text-gray-900 text-sm font-medium">
                <tr>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Experience</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApps.map((app) => {
                  const js = app.jobSeeker || {};
                  const u = js.user || {};
                  const fullName =
                    (u.firstName
                      ? `${u.firstName} ${u.lastName || ""}`.trim()
                      : null) ||
                    js.fullName ||
                    "Unknown";
                  const email = u.email || "N/A";
                  const phone = u.phone || "N/A";
                  const experienceYears =
                    js.experience &&
                    (js.experience.totalYears ?? js.experience.years ?? "—");
                  const resumeUrl = app.resume?.url || js.resume?.url;
                  const status = app.status || "Pending";

                  const statusColors: Record<string, string> = {
                    Active: "bg-green-100 text-green-800",
                    Pending: "bg-yellow-100 text-yellow-800",
                    Rejected: "bg-red-100 text-red-800",
                  };

                  return (
                    <tr
                      key={app._id}
                      className="border-t border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {fullName}
                      </td>
                      <td className="px-6 py-4">{email}</td>
                      <td className="px-6 py-4">{phone}</td>
                      <td className="px-6 py-4">
                        {experienceYears ? `${experienceYears} years` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            statusColors[status] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {resumeUrl && (
                          <a
                            href={resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#8F59ED] hover:text-[#7c4dd4]"
                          >
                            <Eye className="inline w-4 h-4" />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {applications.length > itemsPerPage && (
          <div className="flex justify-center items-center gap-3 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}
