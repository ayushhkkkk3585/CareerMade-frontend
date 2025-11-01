"use client";

import { useState } from "react";
import { 
  Briefcase, 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Home, 
  Clock, 
  Tag, 
  Layers, 
  FileText,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";

const FormSection = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-gray-50 p-6 rounded-xl mb-8 border border-gray-100 shadow-inner">
    <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
      {icon}
      {title}
    </h2>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const FormField = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.description.trim()) newErrors.description = 'Job description is required';
    if (formData.minYears && isNaN(Number(formData.minYears))) 
      newErrors.minExp = 'Must be a valid number';
    if (formData.maxYears && isNaN(Number(formData.maxYears)))
      newErrors.maxExp = 'Must be a valid number';
    if (formData.minSalary && isNaN(Number(formData.minSalary)))
      newErrors.minSalary = 'Must be a valid number';
    if (formData.maxSalary && isNaN(Number(formData.maxSalary)))
      newErrors.maxSalary = 'Must be a valid number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Please log in again to continue.");
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
        minYears: formData.minYears ? Number(formData.minYears) : 0,
        maxYears: formData.maxYears ? Number(formData.maxYears) : 0,
      },
      salary: {
        min: formData.minSalary ? Number(formData.minSalary) : 0,
        max: formData.maxSalary ? Number(formData.maxSalary) : 0,
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
    <>
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-6 sm:px-8">
            <button 
              onClick={() => router.push('/dashboard/employee/jobs')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Jobs</span>
            </button>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Briefcase className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create New Job Posting
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Fill in the job details below. All fields are required unless marked optional.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8">
            <FormSection title="Job Information" icon={<Layers className="w-5 h-5 text-blue-600" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Job Title *">
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="e.g. Doctor"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </FormField>

                <FormField label="Specialization *">
                  <input
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Cardiologist"
                  />
                </FormField>
              </div>

              <FormField label="Job Description *">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full px-4 py-2.5 border ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Detailed job description, responsibilities, and requirements..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </FormField>
            </FormSection>

            <FormSection title="Job Details" icon={<Briefcase className="w-5 h-5 text-indigo-600" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Job Type">
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                    <option value="Volunteer">Volunteer</option>
                  </select>
                </FormField>

                <FormField label="Shift">
                  <select
                    name="shift"
                    value={formData.shift}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Day">Day Shift</option>
                    <option value="Night">Night Shift</option>
                    <option value="Rotating">Rotational Shift</option>
                    <option value="Flexible">Flexible Hours</option>
                    {/* <option value="Weekend">Weekend Only</option> */}
                  </select>
                </FormField>

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRemote"
                      name="isRemote"
                      checked={formData.isRemote}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isRemote" className="ml-2 text-sm text-gray-700">
                      This is a remote position
                    </label>
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection title="Experience & Salary" icon={<DollarSign className="w-5 h-5 text-green-600" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormField label="Experience Required (Years)">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          name="minYears"
                          value={formData.minYears}
                          onChange={handleChange}
                          placeholder="Min"
                          min="0"
                          className={`w-full px-4 py-2.5 border ${
                            errors.minExp ? 'border-red-300' : 'border-gray-300'
                          } rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.minExp && <p className="mt-1 text-sm text-red-600">{errors.minExp}</p>}
                      </div>
                      <span className="flex items-center text-gray-500">to</span>
                      <div className="flex-1">
                        <input
                          type="number"
                          name="maxYears"
                          value={formData.maxYears}
                          onChange={handleChange}
                          placeholder="Max"
                          min={formData.minYears || '0'}
                          className={`w-full px-4 py-2.5 border ${
                            errors.maxExp ? 'border-red-300' : 'border-gray-300'
                          } rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.maxExp && <p className="mt-1 text-sm text-red-600">{errors.maxExp}</p>}
                      </div>
                    </div>
                  </FormField>
                </div>

                <FormField label="Salary Range">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          name="minSalary"
                          value={formData.minSalary}
                          onChange={handleChange}
                          placeholder="Min"
                          min="0"
                          className={`w-full px-4 py-2.5 border ${
                            errors.minSalary ? 'border-red-300' : 'border-gray-300'
                          } rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.minSalary && <p className="mt-1 text-sm text-red-600">{errors.minSalary}</p>}
                      </div>
                      <span className="flex items-center text-gray-500">to</span>
                      <div className="flex-1">
                        <input
                          type="number"
                          name="maxSalary"
                          value={formData.maxSalary}
                          onChange={handleChange}
                          placeholder="Max"
                          min={formData.minSalary || '0'}
                          className={`w-full px-4 py-2.5 border ${
                            errors.maxSalary ? 'border-red-300' : 'border-gray-300'
                          } rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.maxSalary && <p className="mt-1 text-sm text-red-600">{errors.maxSalary}</p>}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <select
                          name="currency"
                          value={formData.currency}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="INR">Indian Rupee (₹)</option>
                          <option value="USD">US Dollar ($)</option>
                          <option value="EUR">Euro (€)</option>
                          <option value="GBP">British Pound (£)</option>
                        </select>
                      </div>
                      <div>
                        <select
                          name="period"
                          value={formData.period}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Annual">Per Year</option>
                          <option value="Monthly">Per Month</option>
                          <option value="Daily">Per Day</option>
                          <option value="Hourly">Per Hour</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </FormField>
              </div>
            </FormSection>

            {!formData.isRemote && (
              <FormSection title="Location" icon={<MapPin className="w-5 h-5 text-red-600" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="City">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Mumbai"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormField>
                  
                  <FormField label="State/Province">
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g. Maharashtra"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormField>
                  
                  <FormField label="Country" className="md:col-span-2">
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Japan">Japan</option>
                      <option value="China">China</option>
                      <option value="Other">Other</option>
                    </select>
                  </FormField>
                </div>
              </FormSection>
            )}

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-6 mt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.push('/dashboard/employee/jobs')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 font-medium transition hover:bg-gray-50"
              >
                <ArrowLeft size={18} />
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Zap className="w-4 h-4 animate-pulse" />
                    Creating...
                  </>
                ) : (
                  <>
                    <span>Create Job</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
