"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch("http://localhost:5000/api/jobs?limit=20", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setJobs(data.data?.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4">Loading jobs...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Job Posts</h1>
        <button onClick={() => router.push("/dashboard/employee/jobs/create")}>
          + Create Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="p-4 border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() =>
                router.push(`/dashboard/employee/jobs/view/${job._id}`)
              }
            >
              <h2 className="text-lg font-medium">{job.title}</h2>
              <p className="text-sm text-gray-600">
                {job.specialization} • {job.location?.city}, {job.location?.state}
              </p>
              <p className="text-sm mt-1">Status: {job.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
