"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    fetch("http://localhost:5000/api/jobs?limit=5", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.data?.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Heading */}
      <h1 className="text-3xl font-bold mb-4">Employer Dashboard</h1>
      <p className="text-gray-700 mb-6">
        Welcome to your dashboard! Manage your organization profile and job posts here.
      </p>

      {/* Main Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-10">
        <button
          onClick={() => router.push("/dashboard/employee/profile/view")}
          className="bg-blue-600 text-white px-5 py-2 rounded"
        >
          View Profile
        </button>

        <button
          onClick={() => router.push("/dashboard/employee/profile/create")}
          className="bg-green-600 text-white px-5 py-2 rounded"
        >
          Create / Edit Profile
        </button>

        <button
          onClick={() => router.push("/dashboard/employee/jobs")}
          className="bg-gray-800 text-white px-5 py-2 rounded"
        >
          Manage Jobs
        </button>
      </div>

      {/* Recent Jobs Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Job Posts</h2>

        {loading ? (
          <p>Loading recent jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-gray-600">No jobs posted yet.</p>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/employee/jobs/view/${job._id}`)
                }
              >
                <h3 className="text-lg font-medium">{job.title}</h3>
                <p className="text-sm text-gray-600">
                  {job.specialization} •{" "}
                  {job.location
                    ? `${job.location.city}, ${job.location.state}`
                    : "Remote"}
                </p>
                <p className="text-sm mt-1">Status: {job.status || "Active"}</p>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        {jobs.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => router.push("/dashboard/employee/jobs")}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              View All Jobs →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
