"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function JobApplicationsPage() {
    const { id } = useParams();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const use=localStorage.getItem("user");
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        fetch(`http://localhost:5000/api/applications/job/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                setApplications(data.data?.applications || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
        console.log("Fetched applications for job ID:", id);
        console.log("application data", applications);
    }, [id]);

    if (loading) return <p className="p-6">Loading applications...</p>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Applications for this Job</h1>

            {applications.length === 0 ? (
                <p>No applications yet.</p>
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <div
                            key={app._id}
                            className="border rounded-lg p-5 shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        {app.jobSeeker?.fullName || "Unknown Applicant"}
                                    </h2>
                                    {/* <p className="text-sm text-gray-600">
                    {app.jobSeeker?.email || "N/A"} • {app.jobSeeker?.phone || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    <b>Experience:</b> {app.jobSeeker?.experience || "Not specified"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <b>Status:</b> {app.status}
                  </p> */}
                                </div>

                                <div className="flex bg-amber-700 flex-col gap-2 items-end">
                                    {app.resume?.url && (
                                        <a
                                            href={app.resume.url}
                                            target="_blank"
                                            className="text-blue-600 text-sm underline"
                                        >
                                            View Resume
                                        </a>
                                    )}
                                    {app.coverLetter?.text && (
                                        <p className="text-sm italic text-gray-600 mt-2 max-w-sm">
                                            “{app.coverLetter.text.slice(0, 100)}...”
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
