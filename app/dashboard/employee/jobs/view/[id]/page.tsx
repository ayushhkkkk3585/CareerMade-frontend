"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function JobViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!id || !token) return;

    fetch(`http://localhost:5000/api/jobs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // ✅ your backend likely returns { success, data: { job } }
        const jobData = data.data?.job || data.data || data; 
        setJob(jobData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching job:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="p-6">Loading job details...</p>;
  if (!job) return <p className="p-6 text-red-500">Job not found.</p>;

  return (
    <div style={{ padding: "24px", maxWidth: "700px", margin: "auto" }}>
      <h1 className="text-2xl font-semibold mb-4">{job.title}</h1>

      <p>
        <b>Specialization:</b> {job.specialization || "N/A"}
      </p>
      <p>
        <b>Description:</b> {job.description || "N/A"}
      </p>
      <p>
        <b>Job Type:</b> {job.jobType || "N/A"}
      </p>
      <p>
        <b>Shift:</b> {job.shift || "N/A"}
      </p>
      <p>
        <b>Experience:</b>{" "}
        {job.experienceRequired
          ? `${job.experienceRequired.minYears} - ${job.experienceRequired.maxYears} years`
          : "N/A"}
      </p>
      <p>
        <b>Salary:</b>{" "}
        {job.salary
          ? `${job.salary.min} - ${job.salary.max} ${job.salary.currency} (${job.salary.period})`
          : "N/A"}
      </p>
      <p>
        <b>Remote:</b> {job.isRemote ? "Yes" : "No"}
      </p>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => router.push(`/dashboard/employee/jobs/edit/${id}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Edit Job
        </button>
        <button
          onClick={() => router.push("/dashboard/employee/jobs")}
          className="ml-4 bg-gray-400 text-white px-4 py-2 rounded"
        >
          Back
        </button>
      </div>
    </div>
  );
}
