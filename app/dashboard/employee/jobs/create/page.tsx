"use client";
import { useState } from "react";
import { Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    specialization: "",
    description: "",
    jobType: "Full-time",
    shift: "Day",
    isRemote: false,
    minYears: "",
    maxYears: "",
    minSalary: "",
    maxSalary: "",
    currency: "INR",
    period: "Annual",
    city: "",
    state: "",
    country: "India",
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("No token found. Please log in again.");
      return;
    }

    const payload = {
      title: formData.title,
      specialization: formData.specialization,
      description: formData.description,
      jobType: formData.jobType,
      shift: formData.shift,
      isRemote: formData.isRemote,
      location: {
        city: formData.city,
        state: formData.state,
        country: formData.country,
      },
      experienceRequired: {
        minYears: Number(formData.minYears),
        maxYears: Number(formData.maxYears),
      },
      salary: {
        min: Number(formData.minSalary),
        max: Number(formData.maxSalary),
        currency: formData.currency,
        period: formData.period,
      },
    };

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error creating job:", data);
        alert(data.message || "Failed to create job");
      } else {
        alert("✅ Job created successfully!");
        router.push("/dashboard/employee/jobs");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong while creating the job.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
                Create New Job
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Fill in the details below to post a new position
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border border-gray-200 rounded-lg shadow-sm my-5">
        <div className="space-y-8">
          {/* Basic Information */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Job Title *
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#8F59ED]"
                  placeholder="e.g. Registered Nurse"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Specialization *
                </label>
                <input
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#8F59ED]"
                  placeholder="e.g. Cardiology"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#8F59ED] resize-none"
                placeholder="Describe the role, responsibilities, and requirements..."
              />
            </div>
          </section>

          {/* Location */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Location
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#8F59ED]"
              />
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#8F59ED]"
              />
              <input
                name="country"
                value={formData.country}
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
                name="minYears"
                value={formData.minYears}
                onChange={handleChange}
                placeholder="Min Years"
                className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#8F59ED]"
              />
              <input
                type="number"
                name="maxYears"
                value={formData.maxYears}
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
                name="minSalary"
                value={formData.minSalary}
                onChange={handleChange}
                placeholder="Min Salary"
                className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#8F59ED]"
              />
              <input
                type="number"
                name="maxSalary"
                value={formData.maxSalary}
                onChange={handleChange}
                placeholder="Max Salary"
                className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#8F59ED]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#8F59ED]"
              >
                <option>INR</option>
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
              <select
                name="period"
                value={formData.period}
                onChange={handleChange}
                className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#8F59ED]"
              >
                <option>Annual</option>
                <option>Monthly</option>
                <option>Hourly</option>
              </select>
            </div>
          </section>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-2.5 bg-[#8F59ED] hover:bg-[#7c4dd4] text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Job"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
