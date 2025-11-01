"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { ArrowLeft, Bookmark } from "lucide-react";


export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/saved-jobs/saved-jobs`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSavedJobs(data.data?.items || []))
      .finally(() => setLoading(false));
  }, [])

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 animate-pulse">Loading saved jobs...</p>
      </div>
    );

  if (!savedJobs.length)
    return (
      <>

        <div className="p-8 text-center">
          <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">You haven’t saved any jobs yet.</p>
          <p className="text-sm text-gray-400">
            Browse listings and tap the <Bookmark className="inline w-4 h-4 text-gray-400" /> icon to save them.
          </p>
        </div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="flex justify-center mt-10">
        <div className="w-full max-w-6xl px-6">
          <button
            onClick={() => router.push("/dashboard/jobseeker")}
            className="flex items-center text-[#8F59ED] hover:text-[#7c4dd4] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-purple-600" />
            Saved Jobs
          </h1>
          <p className="text-sm text-gray-500">
            {savedJobs.length} {savedJobs.length === 1 ? "Job" : "Jobs"}
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Job Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Specialization</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Experience</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Salary</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {savedJobs
                .filter((item: any) => item.job) // 🛠 skip null job entries
                .map(({ job }: any) => (
                  <tr
                    key={job._id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/jobseeker/jobs/${job._id}/view`)
                    }
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {job.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {job.specialization || "General"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {job.location
                        ? `${job.location.city}, ${job.location.state}`
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {job.experienceRequired
                        ? `${job.experienceRequired.minYears}-${job.experienceRequired.maxYears} yrs`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {job.salary?.min} - {job.salary?.max} {job.salary?.currency}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/jobseeker/jobs/${job._id}/view`);
                        }}
                        className="text-sm text-purple-600 hover:underline"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>

          </table>
        </div>
      </div>
    </>
  );
}
