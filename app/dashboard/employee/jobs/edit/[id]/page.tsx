"use client";

import { useEffect, useState } from "react";
import { Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [formData, setFormData] = useState<any>({
    title: "",
    specialization: "",
    description: "",
    jobType: "Full-time",
    shift: "Day",
    isRemote: false,
    experienceRequired: { minYears: "", maxYears: "" },
    salary: { min: "", max: "", currency: "INR", period: "Annual" },
    location: { city: "", state: "", country: "India" },
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!id || !token) return;

    fetch(`http://localhost:5000/api/jobs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const job = data.data || {};
        setFormData({
          title: job.title || "",
          specialization: job.specialization || "",
          description: job.description || "",
          jobType: job.jobType || "Full-time",
          shift: job.shift || "Day",
          isRemote: job.isRemote ?? false,
          experienceRequired: {
            minYears: job.experienceRequired?.minYears || "",
            maxYears: job.experienceRequired?.maxYears || "",
          },
          salary: {
            min: job.salary?.min || "",
            max: job.salary?.max || "",
            currency: job.salary?.currency || "INR",
            period: job.salary?.period || "Annual",
          },
          location: {
            city: job.location?.city || "",
            state: job.location?.state || "",
            country: job.location?.country || "India",
          },
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev: any) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return alert("Please log in again.");

    // Clean empty strings
    const payload = {
      ...formData,
      jobType: formData.jobType || "Full-time",
      shift: formData.shift || "Day",
      experienceRequired: {
        minYears: Number(formData.experienceRequired.minYears) || 0,
        maxYears: Number(formData.experienceRequired.maxYears) || 0,
      },
      salary: {
        min: Number(formData.salary.min) || 0,
        max: Number(formData.salary.max) || 0,
        currency: formData.salary.currency,
        period: formData.salary.period,
      },
    };

    try {
      setUpdating(true);
      const res = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update job");

      alert("✅ Job updated successfully!");
      router.push("/dashboard/employee/jobs");
    } catch (err) {
      console.error("Update job error:", err);
      alert("Failed to update job");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p className="p-6">Loading job details...</p>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white mx-4">
        {/* Header */}
        <div className="border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link href="/dashboard/employee/jobs">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8F59ED] rounded-lg flex items-center justify-center">
                <Briefcase className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Edit Job
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Update the details below to modify your job posting
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border border-gray-200 rounded-lg shadow-sm my-5">
          <div className="space-y-8">
            {/* Basic Info */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Job Title"
                  className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#8F59ED]"
                />
                <input
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="Specialization"
                  className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#8F59ED]"
                />
              </div>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full mt-4 px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#8F59ED]"
                placeholder="Job Description"
              />
            </section>

            {/* Job Type & Shift */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Job Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#8F59ED]"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                  <option value="Volunteer">Volunteer</option>
                </select>

                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#8F59ED]"
                >
                  <option value="Day">Day</option>
                  <option value="Night">Night</option>
                  <option value="Rotating">Rotating</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </section>

            {/* Location */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Location
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#8F59ED]"
                />
                <input
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#8F59ED]"
                />
                <input
                  name="location.country"
                  value={formData.location.country}
                  onChange={handleChange}
                  placeholder="Country"
                  className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#8F59ED]"
                />
              </div>
            </section>

            {/* Experience */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Experience
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="experienceRequired.minYears"
                  value={formData.experienceRequired.minYears}
                  onChange={handleChange}
                  placeholder="Min Years"
                  className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#8F59ED]"
                />
                <input
                  type="number"
                  name="experienceRequired.maxYears"
                  value={formData.experienceRequired.maxYears}
                  onChange={handleChange}
                  placeholder="Max Years"
                  className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#8F59ED]"
                />
              </div>
            </section>

            {/* Salary */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Salary
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="salary.min"
                  value={formData.salary.min}
                  onChange={handleChange}
                  placeholder="Min Salary"
                  className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#8F59ED]"
                />
                <input
                  type="number"
                  name="salary.max"
                  value={formData.salary.max}
                  onChange={handleChange}
                  placeholder="Max Salary"
                  className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#8F59ED]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <select
                  name="salary.currency"
                  value={formData.salary.currency}
                  onChange={handleChange}
                  className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#8F59ED]"
                >
                  <option>INR</option>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
                <select
                  name="salary.period"
                  value={formData.salary.period}
                  onChange={handleChange}
                  className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#8F59ED]"
                >
                  <option>Annual</option>
                  <option>Monthly</option>
                  <option>Hourly</option>
                </select>
              </div>
            </section>

            {/* Remote */}
            <section>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isRemote"
                  checked={formData.isRemote}
                  onChange={handleChange}
                  className="w-4 h-4 accent-[#8F59ED]"
                />
                <span className="text-sm text-gray-700">Remote</span>
              </label>
            </section>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.push("/dashboard/employee/jobs")}
                className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={updating}
                className="px-8 py-2.5 bg-[#8F59ED] hover:bg-[#7c4dd4] text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {updating ? "Updating..." : "Update Job"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
