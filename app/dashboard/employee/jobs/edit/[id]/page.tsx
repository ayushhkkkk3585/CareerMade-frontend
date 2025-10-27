"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    specialization: "",
    description: "",
    jobType: "",
    shift: "",
    experienceRequired: { minYears: "", maxYears: "" },
    salary: { min: "", max: "", currency: "INR", period: "Annual" },
    isRemote: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!id || !token) return;

    fetch(`http://localhost:5000/api/jobs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const jobData = data.data || {};
        setJob(jobData);

        // Safely populate form fields with defaults
        setFormData({
          title: jobData.title || "",
          specialization: jobData.specialization || "",
          description: jobData.description || "",
          jobType: jobData.jobType || "",
          shift: jobData.shift || "",
          experienceRequired: {
            minYears: jobData.experienceRequired?.minYears || "",
            maxYears: jobData.experienceRequired?.maxYears || "",
          },
          salary: {
            min: jobData.salary?.min || "",
            max: jobData.salary?.max || "",
            currency: jobData.salary?.currency || "INR",
            period: jobData.salary?.period || "Annual",
          },
          isRemote: jobData.isRemote ?? false,
        });

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");

    const res = await fetch(`http://localhost:5000/api/jobs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("Job updated successfully!");
      router.push("/dashboard/employee/jobs");
    } else {
      alert("Failed to update job");
    }
  };

  if (loading) return <p className="p-6">Loading job details...</p>;
  if (!job) return <p className="p-6">Job not found</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Edit Job</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Job Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Specialization</label>
          <input
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Job Type</label>
          <input
            type="text"
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Shift</label>
          <input
            type="text"
            name="shift"
            value={formData.shift}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="flex gap-4">
          <div>
            <label className="block font-medium">Min Experience (years)</label>
            <input
              type="number"
              value={formData.experienceRequired.minYears}
              onChange={(e) =>
                handleNestedChange("experienceRequired", "minYears", e.target.value)
              }
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block font-medium">Max Experience (years)</label>
            <input
              type="number"
              value={formData.experienceRequired.maxYears}
              onChange={(e) =>
                handleNestedChange("experienceRequired", "maxYears", e.target.value)
              }
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div>
            <label className="block font-medium">Min Salary</label>
            <input
              type="number"
              value={formData.salary.min}
              onChange={(e) => handleNestedChange("salary", "min", e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block font-medium">Max Salary</label>
            <input
              type="number"
              value={formData.salary.max}
              onChange={(e) => handleNestedChange("salary", "max", e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium">Remote?</label>
          <input
            type="checkbox"
            checked={formData.isRemote}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isRemote: e.target.checked }))
            }
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Update Job
        </button>
      </form>
    </div>
  );
}
