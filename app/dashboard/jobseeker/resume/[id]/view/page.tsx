"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";

export default function ViewResumePage() {
    const { id } = useParams();
    const [resume, setResume] = useState<any>(null);

    const token =
        typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    useEffect(() => {
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resume/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setResume(data.data?.resume))
            .catch(() => alert("Failed to load resume"));
    }, [token, id]);

    if (!resume)
        return <div className="p-6 text-gray-500">Loading resume...</div>;

    return (
        <>
            <Navbar />
            <div className="p-6 max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-2">{resume.title}</h2>
                <p className="text-gray-600 mb-4">{resume.summary}</p>

                <div>
                    <h3 className="text-xl font-semibold mb-2">Education</h3>
                    {resume.education?.map((e: any, i: number) => (
                        <div key={i} className="mb-2 border-l-2 pl-3">
                            <p className="font-medium">
                                {e.degree} in {e.field} — {e.institution}
                            </p>
                            <p className="text-sm text-gray-500">
                                {e.yearOfCompletion} • {e.grade}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-2">Work Experience</h3>
                    {resume.workExperience?.map((w: any, i: number) => (
                        <div key={i} className="mb-2 border-l-2 pl-3">
                            <p className="font-medium">
                                {w.position} — {w.company}
                            </p>
                            <p className="text-sm text-gray-500">
                                {w.startDate?.slice(0, 10)} to{" "}
                                {w.isCurrent ? "Present" : w.endDate?.slice(0, 10)}
                            </p>
                            <p className="text-sm">{w.description}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {resume.skills?.map((s: any, i: number) => (
                            <span
                                key={i}
                                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                            >
                                {s.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
