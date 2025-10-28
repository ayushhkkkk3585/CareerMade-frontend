"use client";
import { useState } from "react";
import { Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateJobPage() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    specialization: "",
    description: "",
    jobType: "Full-time",
    shift: "Day",
    minYears: "",
    maxYears: "",
    minSalary: "",
    maxSalary: "",
    currency: "INR",
    period: "Annual",
    isRemote: false,
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      alert("✓ Job created successfully!");
      setLoading(false);
    }, 1500);
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
              <h1 className="text-2xl font-semibold text-gray-900">Create New Job</h1>
              <p className="text-sm text-gray-500 mt-0.5">Fill in the details below to post a new position</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-[1px] border-gray-200 rounded-lg shadow-sm my-5  ">
        <div className="space-y-8">

          {/* Basic Information */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F59ED] focus:border-transparent transition-shadow"
                    placeholder="e.g. Registered Nurse"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F59ED] focus:border-transparent transition-shadow"
                    placeholder="e.g. Cardiology"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Job Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F59ED] focus:border-transparent transition-shadow resize-none"
                  placeholder="Describe the role, responsibilities, and requirements..."
                />
              </div>
            </div>
          </section>

          {/* Job Details */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Employment Type
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F59ED] focus:border-transparent transition-shadow bg-white"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Shift
                  </label>
                  <select
                    name="shift"
                    value={formData.shift}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F59ED] focus:border-transparent transition-shadow bg-white"
                  >
                    <option>Day</option>
                    <option>Night</option>
                    <option>Rotating</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  name="isRemote"
                  checked={formData.isRemote}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#8F59ED] border-gray-300 rounded focus:ring-[#8F59ED] focus:ring-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Remote Position
                </label>
              </div>
            </div>
          </section>

          {/* Experience Requirements */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Experience Requirements</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Minimum (years)
                </label>
                <input
                  type="number"
                  name="minYears"
                  value={formData.minYears}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F59ED] focus:border-transparent transition-shadow"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Maximum (years)
                </label>
                <input
                  type="number"
                  name="maxYears"
                  value={formData.maxYears}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F59ED] focus:border-transparent transition-shadow"
                  placeholder="10"
                />
              </div>
            </div>
          </section>

          {/* Salary Range */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Salary Range</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Minimum
                  </label>
                  <input
                    type="number"
                    name="minSalary"
                    value={formData.minSalary}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F59ED] focus:border-transparent transition-shadow"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Maximum
                  </label>
                  <input
                    type="number"
                    name="maxSalary"
                    value={formData.maxSalary}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F59ED] focus:border-transparent transition-shadow"
                    placeholder="150000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F59ED] focus:border-transparent transition-shadow bg-white"
                  >
                    <option>INR</option>
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Period
                  </label>
                  <select
                    name="period"
                    value={formData.period}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F59ED] focus:border-transparent transition-shadow bg-white"
                  >
                    <option>Annual</option>
                    <option>Monthly</option>
                    <option>Hourly</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="flex-1 sm:flex-none px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 sm:flex-none px-8 py-2.5 bg-[#8F59ED] hover:bg-[#7c4dd4] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Job"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}