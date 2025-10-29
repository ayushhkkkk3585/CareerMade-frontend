"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EmployerApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/employer?limit=50`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setApplications(data.data?.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch applications:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4">Loading applications...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Applications for Your Jobs</h1>

      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="border p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => router.push(`/dashboard/employee/applications/${app._id}`)}
            >
              <h2 className="text-lg font-medium">{app.job?.title}</h2>
              <p className="text-sm text-gray-600">
                Applicant:{" "}
                {app.jobSeeker?.name ||
                  app.jobSeeker?.user?.name ||
                  "Unknown Candidate"}
              </p>
              <p className="text-sm mt-1">
                Status:{" "}
                <span
                  className={`font-medium ${
                    app.status === "Applied"
                      ? "text-blue-600"
                      : app.status === "Interview"
                      ? "text-yellow-600"
                      : app.status === "Rejected"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {app.status}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Applied on: {new Date(app.appliedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
